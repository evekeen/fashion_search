import { StyleResponse, UserAttributes, UserInput } from '../types/openai';

export async function generateStyleImage(recommendation: StyleResponse): Promise<string> {
  try {
    const response = await fetch('/api/openai', {
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

export async function generateSearchQuery(userInput: UserInput): Promise<StyleResponse> {
  try {
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generateSearchQuery',
        data: { userInput }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate search query');
    }

    const data = await response.json();
    return data.searchQuery;
  } catch (error) {
    console.error('Error in generateSearchQuery service:', error);
    throw error;
  }
}

export async function analyzeUserPhotos(photoPaths: string[]): Promise<UserAttributes> {
  try {
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'analyzeUserPhotos',
        data: { photoPaths }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze user photos');
    }

    const data = await response.json();
    return data.userAttributes;
  } catch (error) {
    console.error('Error in analyzeUserPhotos service:', error);
    throw error;
  }
} 