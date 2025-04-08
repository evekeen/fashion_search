import { StyleResponse } from '../../types/api';
import { replicateClient } from './client';

export async function generateStyleImageWithReplicate(request: StyleResponse): Promise<string> {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error('Replicate API token is not configured');
  }

  if (!request.style?.description) {
    throw new Error('Style description is required for image generation');
  }

  const prompt = `
    Generate a fashion style image based on: ${request.style.description}.
    Display individual items of clothing together in a single image. Just one item per category.
    items: ${request.items.map(item => item.short_description).join(', ')}.
    gender: ${request.gender} - just one single person
    Focus on the clothing, not the person.
  `;
  
  try {
    console.log("Generating style image with Replicate...");
    
    // Use predictions API instead of run method to better handle streaming response
    const input = {
      prompt,
      negative_prompt: "distorted, blurry, deformed, ugly, poorly drawn",
      width: 256,
      height: 256,
      num_outputs: 1,
      scheduler: "K_EULER",
      num_inference_steps: 30,
      guidance_scale: 7.5,
    }
    const prediction = await replicateClient.predictions.create({
      model: "black-forest-labs/flux-pro",
      input: input
    });

    // Wait for the prediction to complete
    let result = await replicateClient.predictions.get(prediction.id);
    
    // Poll for completion
    while (result.status !== "succeeded" && result.status !== "failed") {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before checking again
      result = await replicateClient.predictions.get(prediction.id);
      console.log(`Prediction status: ${result.status}`);
    }
    
    if (result.status === "failed") {
      throw new Error(`Image generation failed: ${result.error || "Unknown error"}`);
    }
    
    // Get the output
    if (result.output && Array.isArray(result.output) && result.output.length > 0) {
      const imageUrl = result.output[0];
      if (typeof imageUrl === 'string') {
        return imageUrl;
      }
    } else if (result.output && typeof result.output === 'string') {
      return result.output;
    }
    
    console.log("Output:", result.output);
    throw new Error('No valid image URL received from Replicate API');
  } catch (error) {
    console.error('Error generating image with Replicate:', error);
    if (error instanceof Error) {
      throw new Error(`Replicate API error: ${error.message}`);
    }
    throw new Error('An unexpected error occurred with Replicate API');
  }
}