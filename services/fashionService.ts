import axios from "axios";
import { StyleResponse } from "../types/openai";

export async function getFashionRecommendations(
    inspirationImages: string[],
    userImage: string,
    budget: string,
    additionalInfo: string
): Promise<StyleResponse> {
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    style: {
      title: "Casual",
      description: "A casual look with a focus on comfort and versatility.",
      tags: ["casual", "comfortable", "versatile"],
    },
    gender: "female",
    items: [
      {
        description: "A casual white t-shirt",
        short_description: "White t-shirt",
        category: "Tops"
      },
      {
        description: "A pair of blue jeans",
        short_description: "Blue jeans",
        category: "Bottoms"
      }
    ]
  };
}

export const getFashionRecommendationsReal = async (
    inspirationImages: string[],
    userImage: string,
    budget: string,
    additionalInfo: string
  ): Promise<StyleResponse> => {
    const formData = new FormData();
  
    inspirationImages.forEach((image, index) => {
        const blob = dataURLtoBlob(image);
        formData.append(`inspiration_images[${index}]`, blob, `inspiration_${index}.jpg`);
    });
  
    formData.append("profile_photo", dataURLtoBlob(userImage));
    formData.append("budget", budget);
    formData.append("additional_info", additionalInfo);
  
    const response = await axios.post<StyleResponse>(
      "/api/recommendations",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  
    return response.data;
  };

  const dataURLtoBlob = (dataURL: string) => {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };


