import { CLOTHING_CATEGORIES } from "@/categories";
import { getBatchSearchResults } from "@/services/searchService";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Skeleton } from "../components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Item, SearchResult, StyleResponse } from "../services/frontend";
import { generateStyleImage } from "../services/replicateImageService";

type ErrorState = {
  [key: string]: string | null;
};

interface SearchResultWithCategory extends SearchResult {
  category: string;
  imagePreloaded?: boolean;
}

export default function ResultsPage() {
  const router = useRouter();
  const [recommendation, setRecommendation] = useState<StyleResponse | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("Tops");
  const [categoryResults, setCategoryResults] = useState<Record<string, SearchResult[]>>({});
  const [errors, setErrors] = useState<ErrorState>({});
  const [isSearching, setIsSearching] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [styleImage, setStyleImage] = useState<string | null>(null);
  const [preloadedImages, setPreloadedImages] = useState<Record<string, boolean>>({});
  
  const categories = useMemo(() => 
    CLOTHING_CATEGORIES.filter((category: string) => 
      recommendation?.items.some((item: Item) => 
        item.category.toLowerCase() === category.toLowerCase()
      )
    ),
    [recommendation?.items]
  );

  useEffect(() => {
    if (!recommendation) return;

    generateStyleImage(recommendation)
      .then(imageURL => {
        console.log(`Style image generated with Replicate: ${imageURL}`)
        setStyleImage(imageURL)
      })
      .catch(error => {
        console.error('Error generating style image:', error)
        setStyleImage('/images/default-style.svg')
      })
      .finally(() => {
        setIsImageLoading(false)
      });
  }, [recommendation]);
      
  useEffect(() => {
    const resultsData = router.query.results;
    if (resultsData) {
      try {
        const parsedResults = JSON.parse(decodeURIComponent(resultsData as string));
        setRecommendation(parsedResults);
        if (parsedResults?.items?.length > 0) {
          setActiveCategory(parsedResults.items[0].category);
        }
      } catch (error) {
        setErrors(prev => ({ ...prev, parsing: "Failed to parse results data" }));
      }
    }
  }, [router.query]);

  const preloadImage = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(false);
        return;
      }
      const img = new window.Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  const preloadCategoryImages = useCallback(async (category: string) => {
    if (!categoryResults[category] || preloadedImages[category]) return;
    
    // Preload all images for this category
    await Promise.all(
      categoryResults[category].map(item => preloadImage(item.thumbnailURL))
    );
    
    // Mark this category as preloaded
    setPreloadedImages(prev => ({
      ...prev,
      [category]: true
    }));
  }, [categoryResults, preloadedImages]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!recommendation) return;

      setIsSearching(true);

      try {
        // Create an array of search queries from item descriptions
        const searchQueries = recommendation.items.map(item => item.description);
        
        // Use batch search to fetch all results at once
        const batchResults = await getBatchSearchResults(searchQueries);
        
        // Organize results by category
        const resultsByCategory: Record<string, SearchResult[]> = {};
        
        recommendation.items.forEach((item, index) => {
          // Get the results for this item's query
          const results = batchResults[item.description] || [];
          
          if (!resultsByCategory[item.category]) {
            resultsByCategory[item.category] = [];
          }
          
          // Add category results
          if (results.length > 0) {
            resultsByCategory[item.category].push(...results);
          } else {
            console.warn(`No results found for category ${item.category}, query: ${item.description}`);
          }
        });
        
        setCategoryResults(resultsByCategory);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setErrors(prev => ({ 
          ...prev, 
          search: error instanceof Error ? error.message : 'Failed to fetch search results' 
        }));
      } finally {
        setIsSearching(false);
      }
    };

    fetchSearchResults();
  }, [recommendation]);
  
  // Preload images for active category when data loads or active category changes
  useEffect(() => {
    if (categoryResults[activeCategory] && !isSearching) {
      preloadCategoryImages(activeCategory);
    }
  }, [activeCategory, categoryResults, isSearching, preloadCategoryImages]);  

  if (!recommendation || errors.parsing) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg">{errors.parsing || "No results found"}</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold">Your Personalized Results</h1>
          <button
            onClick={() => router.push('/')}
            className="flex items-center bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors w-full sm:w-auto justify-center sm:justify-start"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>
        <p className="text-lg sm:text-xl text-gray-600 mb-12">Based on your style preferences, we've curated these recommendations just for you.</p>

        <h2 className="text-2xl font-bold mb-8">Recommended Aesthetic</h2>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/3 aspect-square h-[240px] mx-auto md:mx-0">
              {isImageLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <img 
                  src={styleImage || '/images/default-style.svg'} 
                  alt="Style aesthetic" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/images/default-style.svg';
                  }}
                />
              )}
            </div>
            <div className="w-full md:w-2/3 p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-bold mb-4">{recommendation?.style.title}</h3>
              <p className="text-gray-600 mb-6">{recommendation?.style.description}</p>
              <div className="flex flex-wrap gap-3">
                {recommendation?.style.tags.map((tag: string) => (
                  <span key={tag} className="px-4 py-2 bg-gray-100 rounded-full text-sm">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Recommended Items</h2>
      {errors.search ? (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg">{errors.search}</p>
          </div>
          <button
            onClick={() => {
              setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.search;
                return newErrors;
              });
              setCategoryResults({});
              router.reload();
            }}
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <Tabs defaultValue={activeCategory} className="w-full">
          <TabsList className="flex space-x-2 mb-8 border-b">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                onClick={() => setActiveCategory(category)}
                onMouseEnter={() => preloadCategoryImages(category)}
                onFocus={() => preloadCategoryImages(category)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="data-[state=inactive]:hidden">
              {isSearching && category === activeCategory ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                      <Skeleton className="aspect-w-1 aspect-h-1 w-full" />
                      <div className="p-4">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-10 w-28" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : errors[category] ? (
                <div className="text-center py-12">
                  <div className="text-red-600 mb-4">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-lg">{errors[category]}</p>
                  </div>
                  <button
                    onClick={() => {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors[category];
                        return newErrors;
                      });
                      setCategoryResults(prev => {
                        const newResults = { ...prev };
                        delete newResults[category];
                        return newResults;
                      });
                    }}
                    className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categoryResults[category]?.map((item: SearchResult, index: number) => (
                    <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm relative group h-[320px] flex flex-col">
                      <a
                        href={item.productURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col flex-grow"
                      >
                        <div className="h-[160px] flex-shrink-0 flex items-center justify-center">
                          <img
                            src={item.thumbnailURL}
                            alt={item.description}
                            className="w-full h-full object-contain max-w-[160px]"
                            onError={(e) => {
                              e.currentTarget.src = 'https://picsum.photos/400/400';
                            }}
                          />
                        </div>
                        <div className="p-3 flex flex-col flex-grow">
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2 hover:text-gray-900">{item.description}</p>
                          <div className="flex justify-between items-center mt-auto">
                            <span className="text-base font-semibold">{item.price}</span>
                            <span className="text-gray-600 hover:text-gray-900 px-3 py-1.5 border rounded-md text-sm">
                              View
                            </span>
                          </div>
                        </div>
                      </a>
                      <a
                        href={item.productURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}