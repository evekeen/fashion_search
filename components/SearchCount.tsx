import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function SearchCount() {
  const { data: session } = useSession();
  const [searchCount, setSearchCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSearchCount = async () => {
      if (!session) return;
      
      try {
        const response = await fetch('/api/search/limit');
        const data = await response.json();
        
        // In a real application, you would get the actual search count from the API
        // For now, we'll just use a placeholder
        setSearchCount(5);
      } catch (error) {
        console.error('Error fetching search count:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchCount();
  }, [session]);

  if (!session || isLoading) {
    return null;
  }

  return (
    <div className="text-sm text-gray-600">
      Searches today: {searchCount !== null ? searchCount : '...'}
    </div>
  );
} 