import sharp from 'sharp';

export async function resizeImageToMaxDimension(imageBuffer: Buffer, maxDimension: number = 256): Promise<Buffer> {
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  
  if (!metadata.width || !metadata.height) {
    throw new Error('Could not read image dimensions');
  }

  const aspectRatio = metadata.width / metadata.height;
  let width = metadata.width;
  let height = metadata.height;

  if (width > height && width > maxDimension) {
    width = maxDimension;
    height = Math.round(width / aspectRatio);
  } else if (height > maxDimension) {
    height = maxDimension;
    width = Math.round(height * aspectRatio);
  }

  return image
    .resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .toBuffer();
} 