export type TargetFormat =
  | 'jpg'
  | 'png'
  | 'webp'
  | 'avif'
  | 'gif'
  | 'svg'
  | 'tiff'
  | 'bmp'
  | 'ico';

export type SourceFormat =
  | TargetFormat
  | 'jpeg'
  | 'heic'
  | 'heif';

export interface FormatInfo {
  id: TargetFormat;
  label: string;
  mime: string;
  extension: string;
  supportsQuality: boolean;
  note?: string;
}

export const TARGET_FORMATS: FormatInfo[] = [
  { id: 'jpg', label: 'JPG', mime: 'image/jpeg', extension: 'jpg', supportsQuality: true },
  { id: 'png', label: 'PNG', mime: 'image/png', extension: 'png', supportsQuality: false },
  { id: 'webp', label: 'WebP', mime: 'image/webp', extension: 'webp', supportsQuality: true },
  { id: 'avif', label: 'AVIF', mime: 'image/avif', extension: 'avif', supportsQuality: true },
  { id: 'gif', label: 'GIF', mime: 'image/gif', extension: 'gif', supportsQuality: false, note: 'Single frame output' },
  { id: 'svg', label: 'SVG', mime: 'image/svg+xml', extension: 'svg', supportsQuality: false, note: 'Embeds raster as base64' },
  { id: 'tiff', label: 'TIFF', mime: 'image/tiff', extension: 'tiff', supportsQuality: false },
  { id: 'bmp', label: 'BMP', mime: 'image/bmp', extension: 'bmp', supportsQuality: false },
  { id: 'ico', label: 'ICO', mime: 'image/x-icon', extension: 'ico', supportsQuality: false, note: 'Resized to 256×256 max' },
];

const ACCEPTED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
  'image/tiff',
  'image/bmp',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'image/heic',
  'image/heif',
];

const ACCEPTED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif',
  '.svg', '.tif', '.tiff', '.bmp', '.ico',
  '.heic', '.heif',
];

export const ACCEPT_ATTRIBUTE = [...ACCEPTED_MIMES, ...ACCEPTED_EXTENSIONS].join(',');

export function detectSourceFormat(file: File): SourceFormat {
  const name = file.name.toLowerCase();
  if (file.type === 'image/heic' || file.type === 'image/heif' || name.endsWith('.heic') || name.endsWith('.heif')) return 'heic';
  if (file.type === 'image/tiff' || name.endsWith('.tif') || name.endsWith('.tiff')) return 'tiff';
  if (file.type === 'image/svg+xml' || name.endsWith('.svg')) return 'svg';
  if (file.type === 'image/gif' || name.endsWith('.gif')) return 'gif';
  if (file.type === 'image/webp' || name.endsWith('.webp')) return 'webp';
  if (file.type === 'image/avif' || name.endsWith('.avif')) return 'avif';
  if (file.type === 'image/bmp' || name.endsWith('.bmp')) return 'bmp';
  if (file.type === 'image/x-icon' || file.type === 'image/vnd.microsoft.icon' || name.endsWith('.ico')) return 'ico';
  if (file.type === 'image/png' || name.endsWith('.png')) return 'png';
  return 'jpg';
}

export function isAcceptedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  if (ACCEPTED_MIMES.includes(file.type)) return true;
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}
