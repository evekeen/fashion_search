import { StyleResponse } from './openai';

export async function generateStyleImage(request: StyleResponse): Promise<Buffer> {
  if (!process.env.REPLICATE_API_TOKEN) {
    console.error('Replicate API token is missing');
    throw new Error('Replicate API token is not configured');
  }

  if (!request.style) {
    console.error('Style description is missing from recommendations:', request);
    throw new Error('Style description is required for image generation');
  }

  const prompt = `
    Generate a fashion style image based on: ${request.style.description}.
    Display individual items of clothing together in a single image.
    items: ${request.items.map(item => item.short_description).join(', ')}.
    gender: ${request.gender}.
  `;
  console.log('Generated prompt:', prompt);

  try {
    console.log('Initiating Replicate API request...');
    const response = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-pro/predictions", {
      method: "POST",
      headers: {
        "Authorization": "Token " + process.env.REPLICATE_API_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        input: {
          prompt: prompt,
          negative_prompt: "low quality, blurry, distorted",
          num_inference_steps: 50,
          guidance_scale: 7.5,
          width: 256,
          height: 256,
          num_outputs: 1
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Replicate API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Replicate API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    
    const predictionId = data.id;
    let predictionStatus = data.status;
    let result;
    
    
    let attempts = 0;
    const maxAttempts = 60;
    
    while (predictionStatus !== "succeeded" && predictionStatus !== "failed" && attempts < maxAttempts) {
      attempts++;
      console.log(`Polling attempt ${attempts}/${maxAttempts} - Current status: ${predictionStatus}`);
      
      await new Promise(r => setTimeout(r, 1000));
      const res = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          "Authorization": "Token " + process.env.REPLICATE_API_TOKEN
        }
      });
      
      if (!res.ok) {
        console.error('Error polling prediction status:', {
          status: res.status,
          statusText: res.statusText
        });
        throw new Error(`Failed to poll prediction status: ${res.status} ${res.statusText}`);
      }
      
      result = await res.json();
      predictionStatus = result.status;
    }
    
    if (attempts >= maxAttempts) {
      console.error('Prediction polling timed out after', maxAttempts, 'attempts');
      throw new Error('Prediction polling timed out');
    }
    
    if (predictionStatus === "failed") {
      console.error('Prediction failed with result:', result);
      throw new Error('Replicate prediction failed');
    }
    

    const imageUrl = result.output;    
    console.log('Prediction succeeded, fetching image from URL:', imageUrl);
    return imageUrl;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Replicate API error details:', {
        message: error.message,
        stack: error.stack
      });
      throw new Error(`Replicate API error: ${error.message}`);
    }
    console.error('Unexpected error type:', error);
    throw new Error('An unexpected error occurred with Replicate API');
  }
} 