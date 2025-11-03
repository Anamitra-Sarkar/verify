import React, { useState, useEffect } from 'react';
import { ApiClient, ApiError } from '../../services/api';
import { Card } from '../ui/card';
import { AlertTriangle, TrendingUp, Loader } from 'lucide-react';
import { motion } from 'motion/react';

// Define the structure of a single trending item
interface TrendingItem {
  id: string;
  topic: string;
  category: string;
  detection_count: number;
  last_detected_at: string;
  sample_content: string;
  average_confidence: number;
}

// Define the structure of the API response
interface TrendingApiResponse {
  trending_topics: TrendingItem[];
}

export function TrendingPage() {
  // State for data, loading, and errors
  const [trendingData, setTrendingData] = useState<TrendingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Function to fetch data from the API
    const fetchTrendingData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // The API returns an object like { trending_topics: [...] }
        const response: TrendingApiResponse = await ApiClient.getTrending();
        
        // Check if the response has the expected property and it is an array
        if (response && Array.isArray(response.trending_topics)) {
          setTrendingData(response.trending_topics);
        } else {
          // If the structure is wrong or the array is missing, treat as empty
          console.warn("Unexpected API response structure for trending data:", response);
          setTrendingData([]);
        }
      } catch (err) {
        const apiError = err as ApiError;
        console.error("Failed to fetch trending data:", apiError);
        setError(apiError.detail || 'Could not load trending topics.');
        setTrendingData([]); // Clear data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingData();
  }, []); // Empty dependency array means this runs once on component mount

  // --- Render different UI based on the state ---

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="container mx-auto px-4 pt-28 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <TrendingUp className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Trending Topics</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time insights into misinformation trends.
          </p>
        </motion.div>

        {/* 3. Empty State or Data List */}
        {trendingData.length === 0 ? (
          <Card className="p-8 text-center glass-card">
            <h3 className="text-xl font-semibold">No Trending Data Available</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              There are no trending topics to display right now. Check back later!
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {trendingData.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 glass-card">
                  <h3 className="text-lg font-semibold mb-2">{item.topic}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Category: {item.category} | Detections: {item.detection_count}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                    "{item.sample_content}"
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
