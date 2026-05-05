// ICO encoder that wraps a single PNG image.
// PNG-in-ICO is supported by Windows Vista+ and all modern browsers.
export async function encodeICO(canvas: HTMLCanvasElement): Promise<Blob> {
  // Constrain to 256×256 (ICO max) while preserving aspect ratio
  const maxDim = 256;
  let { width, height } = canvas;
  if (width > maxDim || height > maxDim) {
    const scale = Math.min(maxDim / width, maxDim / height);
    const target = document.createElement('canvas');
    target.width = Math.max(1, Math.round(width * scale));
    target.height = Math.max(1, Math.round(height * scale));
    const ctx = target.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    ctx.drawImage(canvas, 0, 0, target.width, target.height);
    canvas = target;
    width = target.width;
    height = target.height;
  }

  const pngBlob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG encoding failed'))), 'image/png');
  });
  const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());

  const headerSize = 6;
  const dirEntrySize = 16;
  const totalSize = headerSize + dirEntrySize + pngBytes.length;
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // ICONDIR
  view.setUint16(0, 0, true);    // reserved
  view.setUint16(2, 1, true);    // type: 1 = ICO
  view.setUint16(4, 1, true);    // count: 1 image

  // ICONDIRENTRY (256 is encoded as 0)
  view.setUint8(6, width >= 256 ? 0 : width);
  view.setUint8(7, height >= 256 ? 0 : height);
  view.setUint8(8, 0);           // color count
  view.setUint8(9, 0);           // reserved
  view.setUint16(10, 1, true);   // planes
  view.setUint16(12, 32, true);  // bit count
  view.setUint32(14, pngBytes.length, true); // size
  view.setUint32(18, headerSize + dirEntrySize, true); // offset

  new Uint8Array(buffer, headerSize + dirEntrySize).set(pngBytes);
  return new Blob([buffer], { type: 'image/x-icon' });
}
