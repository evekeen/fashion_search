import { Fields, Files, IncomingForm } from 'formidable';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import os from 'os';
import path from 'path';
import { UserInput } from '../../types/api';
import { resizeImageToMaxDimension } from '../../utils/imageProcessing';
import { generateSearchQuery } from '../../services/openai';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Received request:', req.body);
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });

    const [fields, files] = await new Promise<[Fields, Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });
    
    const additionalInfo = (fields.additional_info as string[])?.[0] || '';
    const budget = (fields.budget as string[])?.[0] || 'medium';
    
    const tempDir = path.join(os.tmpdir(), 'fashion_search');
    const profilePhotosDir = path.join(tempDir, 'profile_photos');
    const aestheticPhotosDir = path.join(tempDir, 'aesthetic_photos');
    
    fs.mkdirSync(tempDir, { recursive: true });
    fs.mkdirSync(profilePhotosDir, { recursive: true });
    fs.mkdirSync(aestheticPhotosDir, { recursive: true });
    
    let profilePhotoPath = null;
    if (files.profile_photo?.[0]) {
      const photo = files.profile_photo[0];
      const imageBuffer = fs.readFileSync(photo.filepath);
      const resizedBuffer = await resizeImageToMaxDimension(imageBuffer);
      profilePhotoPath = path.join(profilePhotosDir, `profile_photo_${photo.originalFilename}`);
      fs.writeFileSync(profilePhotoPath, resizedBuffer);
    }
    
    const aestheticPhotoPaths: string[] = [];
    const inspirationFiles = Object.entries(files).filter(([key]) => key.startsWith('inspiration_images['));
    
    for (const [_, photo] of inspirationFiles) {
      if (photo?.[0]) {
        const imageBuffer = fs.readFileSync(photo[0].filepath);
        const resizedBuffer = await resizeImageToMaxDimension(imageBuffer);
        const filePath = path.join(aestheticPhotosDir, `inspiration_${photo[0].originalFilename}`);
        fs.writeFileSync(filePath, resizedBuffer);
        aestheticPhotoPaths.push(filePath);
      }
    }
    
    const userInput: UserInput = {
      additional_info: additionalInfo,
      budget,
      profile_photo_path: profilePhotoPath || undefined,
      aesthetic_photo_paths: aestheticPhotoPaths
    };
    
    const recommendations = await generateSearchQuery(userInput);
    return res.status(200).json(recommendations);
  } catch (error) {
    console.error('Error in recommendations:', error);
    return res.status(500).json({ success: false, error: String(error) });
  }
}