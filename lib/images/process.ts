import sharp from 'sharp';

export const MAX_IMAGE_BYTES = 200 * 1024;

export type CompressedImage = {
  buffer: Buffer;
  width?: number;
  height?: number;
  size: number;
  mimeType: string;
};

/**
 * Encodes a WebP thumbnail from `input`, reusing the same sharp pipeline across
 * quality steps instead of re-decoding the source file every iteration.
 */
export async function compressProductImage(
  input: Buffer,
  maxBytes = MAX_IMAGE_BYTES,
): Promise<CompressedImage> {
  let quality = 82;

  const encode = (q: number) =>
    sharp(input)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: q })
      .toBuffer({ resolveWithObject: true });

  let { data, info } = await encode(quality);

  while (data.length > maxBytes && quality > 35) {
    quality -= 7;
    ({ data, info } = await encode(quality));
  }

  return {
    buffer: data,
    width: info.width,
    height: info.height,
    size: data.length,
    mimeType: 'image/webp',
  };
}
