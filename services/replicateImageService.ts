import { StyleResponse } from './frontend.js';

export async function generateStyleImage(recommendation: StyleResponse): Promise<string> {
  try {
    const response = await fetch('/api/replicate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generateStyleImage',
        data: { recommendation }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate style image');
    }

    const data = await response.json();
    return data.image;
  } catch (error) {
    console.error('Error in generateStyleImage service:', error);
    return '/images/default-style.svg';
  }
} 