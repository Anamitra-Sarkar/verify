import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, MapPin, Clock, Users, AlertCircle, Eye, Loader2 } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import { ApiClient } from '../services/api';

interface TrendingPageProps {
  language: string;
}

interface TrendingTopic {
  id: string;
  topic: string;
  category: string;
  detection_count: number;
  last_detected_at: string;
  sample_content: string;
  average_confidence: number;
}

// Configuration constants
const FAKE_CONTENT_ESTIMATE = 0.75; // Estimate 75% of content as fake for demo
const DEMO_MODE = true; // Toggle between demo and production modes

const CATEGORY_COLORS: Record<string, string> = {
  politics: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400',
  health: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400',
  misinformation: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400',
  science: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400',
  entertainment: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400',
  scam: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400',
  deepfake: 'bg-pink-100 text-pink-700 border-pink-300 dark:bg-pink-900/30 dark:text-pink-400',
  default: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400'
};

export function TrendingPage({ language }: TrendingPageProps) {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrendingTopics();
  }, []);

  const fetchTrendingTopics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use dummy data from ApiClient
      const data = await ApiClient.getTrending();
      setTrendingTopics(data);
    } catch (err: any) {
      console.error('Error fetching trending topics:', err);
      setError(err.message || 'Failed to load trending topics');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (category: string) => {
    const lowerCategory = category.toLowerCase();
    return CATEGORY_COLORS[lowerCategory] || CATEGORY_COLORS.default;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  // Calculate regional hotspots from trending topics
  const getRegionalHotspots = () => {
    const regionMap = new Map<string, number>();
    
    trendingTopics.forEach(topic => {
      const region = 'Global'; // Using Global as we have dummy data
      regionMap.set(region, (regionMap.get(region) || 0) + topic.detection_count);
    });
    
    const regionValues = Array.from(regionMap.values());
    const maxCount = regionValues.length > 0 ? Math.max(...regionValues) : 1;
    
    const hotspots = Array.from(regionMap.entries())
      .map(([region, count]) => ({
        region,
        count,
        intensity: Math.min((count / maxCount) * 100, 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    
    // If no data, return some placeholder regions with minimal activity
    if (hotspots.length === 0) {
      return [
        { region: 'Global', count: 0, intensity: 0 }
      ];
    }
    
    return hotspots;
  };

  // Calculate live statistics from trending topics
  const getLiveStats = () => {
    if (trendingTopics.length === 0) {
      return {
        activeReports: 0,
        verifiedToday: 0,
        flaggedFake: 0
      };
    }
    
    const totalChecks = trendingTopics.reduce((sum, topic) => sum + topic.detection_count, 0);
    const totalFake = Math.floor(totalChecks * FAKE_CONTENT_ESTIMATE);
    const totalReal = totalChecks - totalFake;
    
    return {
      activeReports: totalChecks,
      verifiedToday: totalReal,
      flaggedFake: totalFake
    };
  };

  // Get top categories from trending topics
  const getTopCategories = () => {
    const categoryMap = new Map<string, number>();
    
    trendingTopics.forEach(topic => {
      const category = topic.category || 'general';
      categoryMap.set(category, (categoryMap.get(category) || 0) + topic.detection_count);
    });
    
    return Array.from(categoryMap.entries())
      .map(([category, count]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  };

  const regionalHotspots = getRegionalHotspots();
  const liveStats = getLiveStats();
  const topCategories = getTopCategories();


  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <h2>Trending Misinformation</h2>
            </div>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Real-time tracking of viral misinformation across regions{DEMO_MODE && ' (Demo with dummy data)'}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Heatmap Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="glass-card p-6">
              <h3 className="mb-6">Regional Activity Heatmap</h3>
              
              {/* Map Background */}
              <div className="relative rounded-2xl overflow-hidden mb-6 h-96 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1570106413982-7f2897b8d0c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3JsZCUyMG1hcCUyMG5ldHdvcmt8ZW58MXx8fHwxNzYxODA1NDg2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Map background"
                  className="w-full h-full object-cover opacity-30"
                />
                
                {/* Animated Hotspots */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {[
                    { top: '30%', left: '45%', size: 80 },
                    { top: '50%', left: '55%', size: 60 },
                    { top: '40%', left: '35%', size: 70 },
                    { top: '60%', left: '50%', size: 50 },
                  ].map((spot, idx) => (
                    <motion.div
                      key={idx}
                      className="absolute"
                      style={{ top: spot.top, left: spot.left }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.6 }}
                      transition={{ delay: idx * 0.2, duration: 0.5 }}
                    >
                      <motion.div
                        className="rounded-full bg-red-500"
                        style={{ width: spot.size, height: spot.size }}
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.6, 0.3, 0.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: idx * 0.3,
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Regional Stats */}
              <div className="grid grid-cols-2 gap-3">
                {regionalHotspots.map((hotspot, idx) => (
                  <motion.div
                    key={hotspot.region}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className="glass-card rounded-xl p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span className="text-sm">{hotspot.region}</span>
                      </div>
                      <span className="text-sm text-gray-500">{hotspot.count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${hotspot.intensity}%` }}
                        transition={{ delay: 0.8 + idx * 0.1, duration: 0.8 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Live Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <Card className="glass-card p-6">
              <h4 className="mb-4">Live Statistics</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active Reports</span>
                    <motion.span
                      className="font-display text-2xl"
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {liveStats.activeReports.toLocaleString()}
                    </motion.span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-600"
                      animate={{ width: ['70%', '75%', '70%'] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Verified Today</span>
                    <span className="font-display text-2xl">{liveStats.verifiedToday.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600" style={{ width: `${Math.min((liveStats.verifiedToday / Math.max(liveStats.activeReports, 1)) * 100, 100)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Flagged as Fake</span>
                    <span className="font-display text-2xl">{liveStats.flaggedFake.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600" style={{ width: `${Math.min((liveStats.flaggedFake / Math.max(liveStats.activeReports, 1)) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <h4 className="mb-4">Top Categories</h4>
              <div className="space-y-3">
                {topCategories.map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between">
                    <span className="text-sm">{cat.category}</span>
                    <Badge variant="outline">{cat.count}</Badge>
                  </div>
                ))}
                {topCategories.length === 0 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Trending Stories Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="mb-6">Top Trending Topics</h3>
          
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          )}
          
          {error && !loading && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 dark:text-yellow-400 text-sm">{error}</p>
            </div>
          )}
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingTopics.length === 0 && !loading && !error && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No trending topics available.
                </p>
              </div>
            )}
            
            {trendingTopics.map((topic, idx) => {
              const timeAgo = formatTimeAgo(topic.last_detected_at);
              const region = 'Global';
              const engagement = `${Math.floor(topic.detection_count / 10)}K views`;
              
              return (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card 
                    className="glass-card p-6 h-full hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={`${getStatusColor(topic.category)} border`}>
                        {topic.category.toUpperCase()}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <AlertCircle className="w-4 h-4" />
                        <span>{topic.detection_count}</span>
                      </div>
                    </div>

                    <h4 className="mb-4 line-clamp-2">{topic.topic}</h4>

                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{region}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{timeAgo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span>{engagement}</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm text-gray-700 dark:text-gray-300">
                      <p className="line-clamp-3">"{topic.sample_content}"</p>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between text-xs">
                        <span className="text-blue-600 dark:text-blue-400">
                          Confidence: {topic.average_confidence.toFixed(1)}%
                        </span>
                        <span className="text-red-600 dark:text-red-400">
                          Likely fake
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
