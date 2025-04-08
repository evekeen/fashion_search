import { StyleResponse } from '../../types/api';
import { openaiClient } from './client';

export async function generateStyleImageWithDalle(recommendations: StyleResponse): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  if (!recommendations.style?.description) {
    throw new Error('Style description is required for image generation');
  }

  const prompt = `Generate a fashion style image based on: ${recommendations.style.description}
    Output separate clothing items in the image for each category of items in the style.
    <Items>
      ${recommendations.items.map(item => item.short_description).join('\n')}
    </Items>
  `;
  
  try {
    console.log("Generating style image with DALL-E...");
    const response = await openaiClient.images.generate({
      model: "dall-e-2",
      prompt: prompt,
      n: 1,
      size: "256x256",
      quality: "standard",
      style: "natural"
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('No response from OpenAI API');
    }

    const imageUrl = response.data[0].url;
    if (!imageUrl) {
      throw new Error('No image URL in OpenAI API response');
    }

    return imageUrl;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
    throw new Error('An unexpected error occurred with OpenAI API');
  }
}