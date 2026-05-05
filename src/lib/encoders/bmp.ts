// Minimal 32-bit BMP encoder (BI_BITFIELDS) — supports alpha, top-down rows.
export function encodeBMP(imageData: ImageData): Blob {
  const { width, height, data } = imageData;
  const fileHeaderSize = 14;
  const dibHeaderSize = 124; // BITMAPV5HEADER for alpha support
  const pixelDataSize = width * height * 4;
  const fileSize = fileHeaderSize + dibHeaderSize + pixelDataSize;
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);
  let offset = 0;

  // File header
  view.setUint8(offset++, 0x42); // 'B'
  view.setUint8(offset++, 0x4d); // 'M'
  view.setUint32(offset, fileSize, true); offset += 4;
  view.setUint16(offset, 0, true); offset += 2;
  view.setUint16(offset, 0, true); offset += 2;
  view.setUint32(offset, fileHeaderSize + dibHeaderSize, true); offset += 4;

  // BITMAPV5HEADER
  view.setUint32(offset, dibHeaderSize, true); offset += 4;
  view.setInt32(offset, width, true); offset += 4;
  view.setInt32(offset, -height, true); offset += 4; // negative = top-down
  view.setUint16(offset, 1, true); offset += 2; // planes
  view.setUint16(offset, 32, true); offset += 2; // bpp
  view.setUint32(offset, 3, true); offset += 4; // BI_BITFIELDS
  view.setUint32(offset, pixelDataSize, true); offset += 4;
  view.setInt32(offset, 2835, true); offset += 4; // x ppm (~72dpi)
  view.setInt32(offset, 2835, true); offset += 4; // y ppm
  view.setUint32(offset, 0, true); offset += 4; // colors used
  view.setUint32(offset, 0, true); offset += 4; // important colors
  // Channel masks: R, G, B, A
  view.setUint32(offset, 0x00ff0000, true); offset += 4;
  view.setUint32(offset, 0x0000ff00, true); offset += 4;
  view.setUint32(offset, 0x000000ff, true); offset += 4;
  view.setUint32(offset, 0xff000000, true); offset += 4;
  // Color space type 'sRGB' (0x73524742 little-endian = 'BGRs')
  view.setUint32(offset, 0x73524742, true); offset += 4;
  // CIEXYZTRIPLE (36 bytes) + gamma (12 bytes) zeroed
  offset += 48;
  // Intent + profile data/size + reserved (16 bytes) zeroed
  offset += 16;

  // Pixel data: RGBA → BGRA
  const pixels = new Uint8Array(buffer, offset);
  for (let i = 0, j = 0; i < data.length; i += 4, j += 4) {
    pixels[j]     = data[i + 2]; // B
    pixels[j + 1] = data[i + 1]; // G
    pixels[j + 2] = data[i];     // R
    pixels[j + 3] = data[i + 3]; // A
  }

  return new Blob([buffer], { type: 'image/bmp' });
}
