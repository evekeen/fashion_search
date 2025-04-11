import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function SearchCount() {
  const { data: session } = useSession();
  const [remainingSearches, setRemainingSearches] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSearchCount = async () => {
    if (!session) return;
    
    try {
      const response = await fetch('/api/search/limit', {
        credentials: 'include', // Ensure cookies are sent with the request
      });
      
      if (response.status === 401) {
        console.warn('Authentication error when fetching search count');
        setIsLoading(false);
        return;
      }
      
      const data = await response.json();
      if (data.remainingSearches !== undefined) {
        setRemainingSearches(data.remainingSearches);
      }
    } catch (error) {
      console.error('Error fetching search count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchCount();
  }, [session]);

  useEffect(() => {
    const handleSearchComplete = () => {
      fetchSearchCount();
    };

    window.addEventListener('searchCounterRefresh', handleSearchComplete);
    
    return () => {
      window.removeEventListener('searchCounterRefresh', handleSearchComplete);
    };
  }, []);

  if (!session || isLoading) {
    return null;
  }

  return (
    <div className="text-sm text-gray-600">
      {remainingSearches !== null ? (
        <span>{remainingSearches} searches left</span>
      ) : (
        <span>...</span>
      )}
    </div>
  );
} 