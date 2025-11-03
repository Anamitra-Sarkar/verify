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

export function TrendingPage() {
  const [trendingData, setTrendingData] = useState<TrendingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await ApiClient.getTrending();

        // --- Defensive Data Handling ---
        // Log the raw response to see its structure in the browser console.
        console.log("API response for getTrending:", response);

        let data: TrendingItem[] = [];
        
        if (Array.isArray(response)) {
          // Case 1: The response itself is the array.
          data = response;
        } else if (typeof response === 'object' && response !== null) {
          // Case 2: The response is an object, find the array within it.
          const possibleKeys = ['trending_topics', 'data', 'results', 'items'];
          const key = possibleKeys.find(k => Array.isArray(response[k]));
          if (key) {
            data = response[key];
          } else {
             console.warn("API response is an object, but no array found under expected keys.", response);
          }
        } else {
            console.warn("Unexpected API response type:", typeof response);
        }

        setTrendingData(data);

      } catch (err) {
        const apiError = err as ApiError;
        console.error("Failed to fetch trending data:", apiError);
        setError(apiError.detail || 'Could not load trending topics.');
        setTrendingData([]); // Ensure data is cleared on error.
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

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
