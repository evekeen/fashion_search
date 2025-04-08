import fs from 'fs';
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from 'zod';
import { CLOTHING_CATEGORIES } from '../../categories';
import { StyleResponse, UserAttributes, UserInput } from '../../types/api';
import { openaiClient } from './client';
import { analyzeUserPhotos } from './photoAnalysis';

const styleResponseSchema: z.ZodType<StyleResponse> = z.object({
  style: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string())
  }),
  items: z.array(z.object({
    description: z.string(),
    short_description: z.string(),
    category: z.string()
  })),
  gender: z.string()
});

export async function generateSearchQuery(userInput: UserInput): Promise<StyleResponse> {
  // Extract user inputs
  const additionalInfo = userInput.additional_info || "";
  const budget = userInput.budget || "medium";
  const profilePhotoPath = userInput.profile_photo_path;
  const aestheticPhotoPaths = userInput.aesthetic_photo_paths || [];

  // First, analyze user photo if provided
  let userAttributes: UserAttributes = {};
  if (profilePhotoPath) {
    console.log("Analyzing profile photo...");
    userAttributes = await analyzeUserPhotos([profilePhotoPath]);
  }

  // Prepare the prompt for OpenAI
  let prompt = `As a fashion expert, analyze the provided information and generate fashion recommendations.
  
Please return your response in the following JSON format EXACTLY:
{
    "style": { 
        "title": "Style category name",
        "description": "Description of the style",
        "tags": ["tag1", "tag2", ...],
    },
    "items": [
        {
            "description": "Detailed description of the recommended item",
            "short_description": "Short description of the recommended item",
            "category": "Category (must be one of: ${CLOTHING_CATEGORIES.join(', ')})"
        },
        ...
    ]
}

Make sure to:
1. Include 4-6 items
2. Use the exact category names: ${CLOTHING_CATEGORIES.join(', ')}
3. Make descriptions specific and detailed
4. Consider the provided budget level and style preferences
5. Return ONLY the JSON, no additional text

User preferences:
`;

  if (additionalInfo) {
    prompt += `Style preferences: ${additionalInfo}\n`;
  }

  if (budget) {
    prompt += `Budget level: ${budget}\n`;
  }

  if (Object.keys(userAttributes).length > 0) {
    prompt += `User attributes: ${JSON.stringify(userAttributes, null, 2)}\n`;
  }

  if (aestheticPhotoPaths.length > 0) {
    prompt += `Number of inspiration photos provided: ${aestheticPhotoPaths.length}\n`;
  }

  // Prepare the messages for the API call
  const messages: any[] = [
    { role: "system", content: "You are a fashion expert who provides specific and detailed clothing recommendations." },
    { role: "user", content: prompt }
  ];

  // Add user photo if provided
  if (profilePhotoPath) {
    messages.push({
      role: "user",
      content: "I'm providing a photo of myself. Please analyze my body type, proportions, and overall appearance to recommend clothing that would be flattering for my physique."
    });

    const imageBuffer = fs.readFileSync(profilePhotoPath);
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    messages.push({
      role: "user",
      content: [
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
      ]
    });
  }

  // Add aesthetic photos if provided
  if (aestheticPhotoPaths.length > 0) {
    messages.push({
      role: "user",
      content: `I'm also providing ${aestheticPhotoPaths.length} photo(s) of fashion styles I like. Please analyze these images carefully and consider their colors, patterns, textures, silhouettes, and overall aesthetic when generating your search queries.`
    });

    // Add each aesthetic photo as a separate message
    for (const photoPath of aestheticPhotoPaths) {
      const imageBuffer = fs.readFileSync(photoPath);
      const base64Image = Buffer.from(imageBuffer).toString('base64');

      messages.push({
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
        ]
      });
    }
  }

  try {
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 800,
      temperature: 0.7,
      response_format: zodResponseFormat(styleResponseSchema, "style_response")
    });

    const responseText = response.choices[0].message.content?.trim() || "";

    // Find JSON object in the response
    const startIdx = responseText.indexOf('{');
    const endIdx = responseText.lastIndexOf('}') + 1;

    if (startIdx >= 0 && endIdx > startIdx) {
      const jsonStr = responseText.substring(startIdx, endIdx);
      const recommendations = JSON.parse(jsonStr);

      if ("style" in recommendations && "items" in recommendations) {
        if ("title" in recommendations.style && "description" in recommendations.style && "tags" in recommendations.style) {
          return {
            ...recommendations,
            gender: userAttributes.gender_presentation || "unisex"
          };
        } else {
          console.log("Invalid style format in response, here's the response: ", jsonStr);
        }
      }

      // If we get here, the response wasn't in the correct format
      return {
        style: {
          title: "Casual",
          description: "Casual style",
          tags: ["casual", "comfortable", "everyday"]
        },
        items: [
          {
            description: `Fashion item matching ${additionalInfo}`,
            short_description: `Black t-shirt`,
            category: "Tops"
          },
          {
            description: `Fashion item for ${budget} budget`,
            short_description: `Black jeans`,
            category: "Bottoms"
          }
        ],
        gender: "female"
      };
    }
  } catch (e) {
    console.log(`Error calling OpenAI API: ${e}`);    
  }

  return {
    style: {
      title: "Casual",
      description: "Casual style",
      tags: ["casual", "comfortable", "everyday"]
    },
    gender: "female",
    items: [
      {
        description: `Fashion item matching ${additionalInfo}`,
        short_description: `Black t-shirt`,
        category: "Tops"
      },
      {
        description: `Fashion item for ${budget} budget`,
        short_description: `Black jeans`,
        category: "Bottoms"
      }
    ]
  };
}