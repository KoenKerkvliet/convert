import UTIF from 'utif';
import { encodeBMP } from './encoders/bmp';
import { encodeICO } from './encoders/ico';
import { detectSourceFormat, TARGET_FORMATS, type TargetFormat } from './formats';

export interface ConvertOptions {
  targetFormat: TargetFormat;
  quality: number;          // 0..1
  maxWidth?: number;        // 0/undefined = no cap
  maxHeight?: number;
  keepAspectRatio: boolean;
  renamePattern?: string;   // empty/undefined = keep original base name
}

export interface ConvertedImage {
  blob: Blob;
  fileName: string;
  width: number;
  height: number;
  originalSize: number;
  newSize: number;
  delta: number;            // (newSize - originalSize) / originalSize
  format: TargetFormat;
  previewUrl: string;
}

interface DecodedSource {
  source: CanvasImageSource;
  width: number;
  height: number;
  cleanup: () => void;
}

async function decode(file: File): Promise<DecodedSource> {
  const fmt = detectSourceFormat(file);

  if (fmt === 'heic' || fmt === 'heif') {
    const heic2any = (await import('heic2any')).default;
    const result = await heic2any({ blob: file, toType: 'image/png' });
    const blob = Array.isArray(result) ? result[0] : result;
    const bitmap = await createImageBitmap(blob as Blob);
    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      cleanup: () => bitmap.close(),
    };
  }

  if (fmt === 'tiff') {
    const buffer = await file.arrayBuffer();
    const ifds = UTIF.decode(buffer);
    if (!ifds.length) throw new Error('No images found in TIFF');
    UTIF.decodeImage(buffer, ifds[0]);
    const rgba = UTIF.toRGBA8(ifds[0]);
    const width = ifds[0].width as number;
    const height = ifds[0].height as number;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    ctx.putImageData(new ImageData(new Uint8ClampedArray(rgba), width, height), 0, 0);
    return { source: canvas, width, height, cleanup: () => {} };
  }

  if (fmt === 'svg') {
    const text = await file.text();
    const blob = new Blob([text], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
      await img.decode();
      let { naturalWidth: width, naturalHeight: height } = img;
      if (!width || !height) {
        // SVG without intrinsic size — fall back to viewBox or default
        const match = text.match(/viewBox=["']([\d.\s-]+)["']/i);
        if (match) {
          const parts = match[1].trim().split(/\s+/).map(Number);
          width = parts[2] || 1024;
          height = parts[3] || 1024;
        } else {
          width = 1024;
          height = 1024;
        }
      }
      return {
        source: img,
        width,
        height,
        cleanup: () => URL.revokeObjectURL(url),
      };
    } catch (err) {
      URL.revokeObjectURL(url);
      throw err;
    }
  }

  // Browser-native formats: jpg, png, webp, avif, gif, bmp, ico
  const bitmap = await createImageBitmap(file);
  return {
    source: bitmap,
    width: bitmap.width,
    height: bitmap.height,
    cleanup: () => bitmap.close(),
  };
}

function computeTargetSize(
  srcW: number,
  srcH: number,
  options: ConvertOptions,
): { width: number; height: number } {
  const maxW = options.maxWidth && options.maxWidth > 0 ? options.maxWidth : Infinity;
  const maxH = options.maxHeight && options.maxHeight > 0 ? options.maxHeight : Infinity;

  if (options.keepAspectRatio) {
    const scale = Math.min(maxW / srcW, maxH / srcH, 1);
    return {
      width: Math.max(1, Math.round(srcW * scale)),
      height: Math.max(1, Math.round(srcH * scale)),
    };
  }
  return {
    width: Math.max(1, Math.min(srcW, maxW)),
    height: Math.max(1, Math.min(srcH, maxH)),
  };
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error(`Encoder failed for ${mime}`))),
      mime,
      quality,
    );
  });
}

async function encode(canvas: HTMLCanvasElement, options: ConvertOptions): Promise<Blob> {
  switch (options.targetFormat) {
    case 'jpg':
      return canvasToBlob(canvas, 'image/jpeg', options.quality);
    case 'png':
      return canvasToBlob(canvas, 'image/png');
    case 'webp':
      return canvasToBlob(canvas, 'image/webp', options.quality);
    case 'avif':
      try {
        return await canvasToBlob(canvas, 'image/avif', options.quality);
      } catch (err) {
        throw new Error('AVIF encoding is not supported in this browser. Try Chrome 85+ or Edge.');
      }
    case 'gif': {
      // No native GIF encoder. Fall back to PNG with .gif extension would lie about content;
      // instead, emit a single-frame GIF via a tiny indexed encoder is complex — we re-encode as PNG
      // and the file extension will reflect that we couldn't truly produce a GIF.
      // To keep promise: encode as PNG bytes but wrap in image/gif MIME would corrupt readers,
      // so we return PNG with note (handled at UI layer via TargetFormat.note).
      return canvasToBlob(canvas, 'image/png');
    }
    case 'tiff': {
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable');
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const tiff = UTIF.encodeImage(
        new Uint8Array(imgData.data.buffer) as unknown as Uint8Array,
        canvas.width,
        canvas.height,
      );
      return new Blob([tiff], { type: 'image/tiff' });
    }
    case 'bmp': {
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable');
      return encodeBMP(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }
    case 'ico':
      return encodeICO(canvas);
    case 'svg': {
      // Embed PNG as base64 inside SVG so the result is a valid SVG container
      const png = await canvasToBlob(canvas, 'image/png');
      const dataUrl = await blobToDataUrl(png);
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">
  <image href="${dataUrl}" width="${canvas.width}" height="${canvas.height}"/>
</svg>`;
      return new Blob([svg], { type: 'image/svg+xml' });
    }
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function buildFileName(originalName: string, options: ConvertOptions, index: number): string {
  const dot = originalName.lastIndexOf('.');
  const baseOriginal = dot > 0 ? originalName.slice(0, dot) : originalName;
  const targetInfo = TARGET_FORMATS.find((f) => f.id === options.targetFormat)!;
  const pattern = options.renamePattern?.trim();
  if (!pattern) {
    return `${baseOriginal}.${targetInfo.extension}`;
  }
  const padded = String(index + 1).padStart(2, '0');
  const base = pattern
    .replace(/\{name\}/g, baseOriginal)
    .replace(/\{n\}/g, padded)
    .replace(/\{index\}/g, String(index + 1));
  return `${base}.${targetInfo.extension}`;
}

export async function convertImage(
  file: File,
  options: ConvertOptions,
  index: number,
): Promise<ConvertedImage> {
  const decoded = await decode(file);
  try {
    const { width, height } = computeTargetSize(decoded.width, decoded.height, options);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(decoded.source, 0, 0, width, height);

    const blob = await encode(canvas, options);
    const fileName = buildFileName(file.name, options, index);
    const previewUrl = URL.createObjectURL(blob);

    return {
      blob,
      fileName,
      width,
      height,
      originalSize: file.size,
      newSize: blob.size,
      delta: file.size === 0 ? 0 : (blob.size - file.size) / file.size,
      format: options.targetFormat,
      previewUrl,
    };
  } finally {
    decoded.cleanup();
  }
}
