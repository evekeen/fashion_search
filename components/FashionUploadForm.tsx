import { RefreshCw, Sparkles, Upload, UserCircle2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { getFashionRecommendationsReal } from "../services/fashionService";
import LoadingAnimation from "./LoadingAnimation";

export default function FashionUploadForm() {
  const router = useRouter();
  const { data: session } = useSession();
  // State for form inputs
  const [inspirationImages, setInspirationImages] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<string>("");
  const [styleDescription, setStyleDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [styleSuggestions, setStyleSuggestions] = useState<string[]>([]);

  // Load saved images from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProfileImage = localStorage.getItem('userProfileImage');
      const savedInspirationImages = localStorage.getItem('userInspirationImages');
      
      if (savedProfileImage) {
        setProfileImage(savedProfileImage);
      }
      
      if (savedInspirationImages) {
        try {
          setInspirationImages(JSON.parse(savedInspirationImages));
        } catch (e) {
          console.error('Error parsing saved inspiration images:', e);
        }
      }
    }
  }, []);

  // References for file inputs
  const inspirationInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  // Compress image function
  const compressImage = (file: File, maxWidth: number = 512, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to compressed JPEG
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = () => {
          reject(new Error('Error loading image'));
        };
      };
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
    });
  };

  // Handle inspiration image upload
  const handleInspirationUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsLoading(true);
      try {
        const compressedImages = await Promise.all(
          Array.from(files).map(file => compressImage(file))
        );
        
        setInspirationImages(prev => {
          const newImages = [...prev, ...compressedImages];
          if (typeof window !== 'undefined') {
            localStorage.setItem('userInspirationImages', JSON.stringify(newImages));
          }
          return newImages;
        });
      } catch (err) {
        console.error('Error compressing images:', err);
        setError('Failed to process images. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle profile image upload
  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      try {
        const compressedImage = await compressImage(file);
        setProfileImage(compressedImage);
        if (typeof window !== 'undefined') {
          localStorage.setItem('userProfileImage', compressedImage);
        }
      } catch (err) {
        console.error('Error compressing profile image:', err);
        setError('Failed to process profile image. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Remove inspiration image
  const removeInspirationImage = (index: number) => {
    setInspirationImages(prev => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      if (typeof window !== 'undefined') {
        localStorage.setItem('userInspirationImages', JSON.stringify(newImages));
      }
      return newImages;
    });
  };

  // Remove profile image
  const removeProfileImage = () => {
    setProfileImage("");
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userProfileImage');
    }
  };

  // Track search in the backend
  const trackSearch = async (results: any) => {
    try {
      await fetch('/api/search/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          query: {
            inspirationImages: inspirationImages.length,
            profileImage: !!profileImage,
            styleDescription
          },
          results
        }),
      });
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  };

  // Check if the user can perform a search
  const checkSearchLimit = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/search/limit');
      const data = await response.json();
      return data.canSearch;
    } catch (error) {
      console.error('Error checking search limit:', error);
      return true; // Default to allowing searches if there's an error
    }
  };

  // Generate random style suggestions
  const generateStyleSuggestions = () => {
    const shuffled = [...descriptionTemplates].sort(() => 0.5 - Math.random());
    setStyleSuggestions(shuffled.slice(0, 3));
  };

  // Initialize style suggestions on component mount
  useEffect(() => {
    generateStyleSuggestions();
  }, []);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError("");
    setError("");

    if (inspirationImages.length === 0) {
      setValidationError("Please upload at least one inspiration image");
      return;
    }

    if (!profileImage) {
      setValidationError("Please upload your profile photo");
      return;
    }

    setIsLoading(true);

    try {
      // Check if the user can perform a search
      const canSearch = await checkSearchLimit();
      
      if (!canSearch) {
        setError("You have reached your daily search limit. Please try again tomorrow.");
        setIsLoading(false);
        return;
      }
      
      const response = await getFashionRecommendationsReal(inspirationImages, profileImage, "Medium", styleDescription);
      
      // Track the search with the results
      await trackSearch(response);
      
      const encodedResults = encodeURIComponent(JSON.stringify(response));
      router.push(`/results?results=${encodedResults}`);
    } catch (err: any) {
      console.error("Error submitting form:", err);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <section id="fashion-upload" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto overflow-hidden">
          <div className="p-0">
            {isLoading ? (
              <div className="p-16 bg-transparent">
                <LoadingAnimation />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Find Your Perfect Style Match</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  <div className="order-1 md:order-1 md:col-span-1 max-w-xs mx-auto">
                    <h3 className="text-lg font-medium mb-3">Your Profile Picture</h3>
                    <p className="text-gray-500 text-sm mb-4">
                      Upload a photo of yourself to personalize your experience
                    </p>
                    
                    <div className="flex justify-start mb-4">
                      {profileImage ? (
                        <div className="relative w-40 h-40">
                          <Image 
                            src={profileImage} 
                            alt="Profile picture" 
                            fill
                            className="rounded-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={removeProfileImage}
                            className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => profileInputRef.current?.click()}
                          className="w-40 h-40 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
                        >
                          <UserCircle2 className="h-12 w-12 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">Add Profile Picture</span>
                        </button>
                      )}
                    </div>
                    
                    <Input
                      ref={profileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfileUpload}
                      className="hidden"
                    />
                  </div>
                  
                  <div className="order-2 md:order-2 md:col-span-2">
                    <h3 className="text-lg font-medium mb-3">Upload Inspiration</h3>
                    <p className="text-gray-500 text-sm mb-4">
                      Share images of styles you love or want to emulate
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {inspirationImages.map((img, index) => (
                        <div key={index} className="relative aspect-square rounded-md overflow-hidden bg-gray-100">
                          <Image 
                            src={img} 
                            alt={`Inspiration ${index + 1}`} 
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeInspirationImage(index)}
                            className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={() => inspirationInputRef.current?.click()}
                        className="aspect-square rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
                      >
                        <Upload className="h-6 w-6 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Add Images</span>
                      </button>
                    </div>
                    
                    <Input
                      ref={inspirationInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleInspirationUpload}
                      className="hidden"
                      multiple
                    />
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-3">Description <span className="text-gray-400 text-sm font-normal">(optional)</span></h3>
                  <Textarea
                    placeholder="Tell us more about your preferences"
                    value={styleDescription}
                    onChange={(e) => setStyleDescription(e.target.value)}
                    className="min-h-[100px] mb-3"
                  />
                  
                  <div className="flex items-start gap-4 mb-2">
                    <div className="flex-1 space-y-3">
                      {styleSuggestions.map((suggestion, index) => (
                        <div 
                          key={index} 
                          className="p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors bg-gray-50/50 shadow-sm"
                          onClick={() => setStyleDescription(suggestion)}
                        >
                          <p className="text-sm">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={generateStyleSuggestions}
                      className="rounded-full self-start"
                      title="Generate new suggestions"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {validationError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
                    {validationError}
                  </div>
                )}
                
                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
                    {error}
                  </div>
                )}
                
                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full py-6 bg-black hover:bg-black/90 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2">⟳</span> Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Sparkles className="mr-2 h-5 w-5" /> Get Personalized Recommendations
                    </span>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const descriptionTemplates = [
    "Bohemian Luxe: Vibrant, layered textures with embroidered details and flowing silhouettes that evoke free-spirited summer festivals.",
    "Vintage Glamour: Sophisticated ensembles paired with classic accessories and a touch of old Hollywood charm for a timeless look.",
    "Modern Minimalist: Clean lines, monochrome palettes, and streamlined silhouettes that embody contemporary urban sophistication.",
    "Edgy Street Warrior: Bold distressed denim, graphic tees, and statement accessories that radiate rebellious energy.",
    "Renaissance Revival: Ornate fabrics, rich hues, and intricate embellishments inspired by historical opulence with a modern twist.",
    "Athleisure Luxe: Sporty silhouettes combined with premium materials and subtle embellishments for a stylishly active look.",
    "Futuristic Cyberpunk: Urban cuts paired with metallic accents, innovative silhouettes, and neon hints evoking high-tech energy.",
    "Romantic Pastel Dream: Soft, airy fabrics in gentle hues adorned with delicate prints for an ethereal, feminine appeal.",
    "Eco-Chic Urban Explorer: Sustainable fabrics, functional designs, and an effortless blend of rugged and refined elements.",
    "Classic Power Suit: Tailored fits, sharp lines, and bold accessories designed to command attention in any boardroom.",
    "Artistic Avant-Garde: Unconventional silhouettes, experimental patterns, and a fusion of textures that push style boundaries.",
    "Summer Resort Elegance: Breezy, colorful ensembles crafted from lightweight fabrics perfect for sunlit days and starlit nights.",
    "Gothic Boho: Dark yet dreamy layers, intricate lace details, and statement accessories that blend mysticism with modern edge.",
    "Urban Nomad: Utilitarian details with rugged fabrics and versatile, layered pieces ideal for city adventures and travel.",
    "Retro-Futuristic Mod: Sharp silhouettes with vibrant colors, geometric prints, and nostalgic nods to '60s style reimagined.",
    "Eclectic Festival Fusion: Bold patterns, dynamic layering, and unexpected embellishments capturing the spirit of creative rebellion.",
    "Elegant Evening Soirée: Opulent fabrics, shimmering accents, and sophisticated tailoring that turns every entrance into a statement.",
    "Rustic Countryside Charm: Earthy tones, timeless textures, and a mix of vintage prints with modern comfort for relaxed elegance.",
    "High-Fashion Couture: Exquisitely tailored ensembles featuring dramatic silhouettes, intricate embroidery, and luxurious fabrics.",
    "Casual Decadence: Relaxed fits elevated by meticulous styling and premium details for an upscale, everyday look.",
    "Medieval Revival: Dramatic draped fabrics, statement belts, and regal textures that echo the grandeur of ancient courts.",
    "Enchanted Evening: Ethereal gowns paired with delicate accessories and subtle hints of sparkle for a mystical, fairy-tale ambiance.",
    "Urban Jungle: Bold nature-inspired prints and rugged textures combined with refined cuts to create a wild city vibe.",
    "Sophisticated Boho-Chic: A mix of relaxed silhouettes with tailored detailing and artisanal accessories that tell a story.",
    "Metropolitan Edge: Sleek, structured pieces with unexpected details blending urban sophistication and modern rebellion.",
    "Vintage Street Sophisticate: A tasteful mix of retro prints and contemporary tailoring that radiates nostalgic urban flair.",
    "Glamorous Rock 'n' Roll: Leather accents, metallic details, and daring cuts that capture the spirit of rebellious elegance.",
    "Effortless Coastal Living: Breezy fabrics, sun-drenched hues, and relaxed silhouettes that embody seaside sophistication.",
    "Artisanal Modern: Handcrafted details, layered textures, and contemporary silhouettes that celebrate creative individuality.",
    "Opulent Journey: A fusion of global influences with lavish fabrics, intricate patterns, and an air of refined wanderlust."
]
