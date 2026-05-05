import JSZip from 'jszip';
import type { ConvertedImage } from './converter';

export async function buildZip(images: ConvertedImage[]): Promise<Blob> {
  const zip = new JSZip();
  const used = new Map<string, number>();
  for (const img of images) {
    let name = img.fileName;
    const count = used.get(name);
    if (count !== undefined) {
      const dot = name.lastIndexOf('.');
      const base = dot > 0 ? name.slice(0, dot) : name;
      const ext = dot > 0 ? name.slice(dot) : '';
      name = `${base}-${count + 1}${ext}`;
      used.set(img.fileName, count + 1);
    } else {
      used.set(name, 0);
    }
    zip.file(name, img.blob);
  }
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
}
