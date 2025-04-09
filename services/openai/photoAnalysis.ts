import fs from 'fs';
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from 'zod';
import { UserAttributes } from '../../types/api';
import { openaiClient } from './client';

const userAttributesSchema: z.ZodType<UserAttributes> = z.object({
  gender: z.string().optional(),
  apparent_age_range: z.string().optional(),
  body_type: z.string().optional(),
  height_impression: z.string().optional(),
  skin_tone: z.string().optional(),
  style_suggestions: z.array(z.string()).optional(),
  colors_to_complement: z.array(z.string()).optional(),
  avoid_styles: z.array(z.string()).optional()
});

export async function analyzeUserPhotos(userPhotoPaths: string[]): Promise<UserAttributes> {
  if (!userPhotoPaths || userPhotoPaths.length === 0) {
    return {};
  }

  // Prepare messages for the API call
  const messages: any[] = [
    {
      role: "system",
      content: `You are a fashion expert and personal stylist. Analyze the provided photos of a person to extract 
      physical attributes relevant for fashion recommendations. Be respectful, inclusive, and focus only on attributes 
      that would help with clothing recommendations. Provide your analysis in JSON format with the following fields:
      - gender: The apparent gender (man, woman, non-binary)
      - apparent_age_range: Estimated age range (e.g., "18-25", "25-35", "35-50", etc.)
      - body_type: Body shape and proportions (e.g., rectangle, hourglass, athletic, pear, apple, etc.)
      - height_impression: Impression of height (tall, average, petite)
      - skin_tone: General skin tone category (very fair, fair, medium, olive, tan, deep, etc.)
      - style_suggestions: 3-5 specific style suggestions based on the person's physical attributes
      - colors_to_complement: 3-5 color recommendations that would complement their skin tone and features
      - avoid_styles: 1-2 styles or cuts that might be less flattering for their body type
      `
    }
  ];

  // Add user photos
  for (const photoPath of userPhotoPaths) {
    const imageBuffer = fs.readFileSync(photoPath);
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    messages.push({
      role: "user",
      content: [
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
      ]
    });
  }

  // Add final instruction
  messages.push({
    role: "user",
    content: "Please analyze these photos and provide the attributes in JSON format as specified."
  });

  try {
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 800,
      temperature: 0.5,
      response_format: zodResponseFormat(userAttributesSchema, "user_attributes")
    });

    const responseText = response.choices[0].message.content?.trim() || "";

    // Try to extract JSON from the response
    try {
      // Find JSON object in the response
      const startIdx = responseText.indexOf('{');
      const endIdx = responseText.lastIndexOf('}') + 1;

      if (startIdx >= 0 && endIdx > startIdx) {
        const jsonStr = responseText.substring(startIdx, endIdx);
        const attributes = JSON.parse(jsonStr);
        console.log(`Successfully extracted user attributes: ${Object.keys(attributes)}`);
        return attributes;
      } else {
        console.log("Could not find JSON in user photo analysis response");
        return {};
      }
    } catch (e) {
      console.log(`Error parsing JSON from user photo analysis: ${e}`);
      console.log(`Response text: ${responseText.substring(0, 200)}...`);
      return {};
    }
  } catch (e) {
    console.log(`Error analyzing user photos: ${e}`);
    return {};
  }
}