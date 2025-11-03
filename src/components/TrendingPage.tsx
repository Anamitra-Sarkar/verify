import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, MapPin, Clock, Users, AlertCircle, Eye, Loader2 } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';

interface TrendingPageProps {
  language: string;
}

interface TrendingTopic {
  id: number;
  title: string;
  category: string;
  fake_count: number;
  real_count: number;
  total_checks: number;
  trending_score: number;
  created_at: string;
  source_url?: string;
  region?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function TrendingPage({ language }: TrendingPageProps) {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  useEffect(() => {
    // Check if location permission was previously granted
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      setUserLocation(savedLocation);
      setLocationPermission('granted');
    }
    fetchTrendingTopics();
  }, []);

  const requestLocationAccess = async () => {
    try {
      if ('geolocation' in navigator) {
        // Try to query permissions if supported
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' });
          
          if (permission.state === 'granted' || permission.state === 'prompt') {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                // Use reverse geocoding to get location name
                // For now, we'll use a simple approximation
                const location = 'India'; // TODO: Implement reverse geocoding
                setUserLocation(location);
                localStorage.setItem('userLocation', location);
                setLocationPermission('granted');
                fetchTrendingTopics(location);
                toast.success('Location access granted - showing local trending topics');
              },
              (error) => {
                console.error('Location error:', error);
                setLocationPermission('denied');
                toast.info('Location access denied - showing global trending topics');
                fetchTrendingTopics();
              }
            );
          } else {
            setLocationPermission('denied');
            fetchTrendingTopics();
          }
        } catch (permError) {
          // Fallback for browsers that don't support permissions API
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const location = 'India';
              setUserLocation(location);
              localStorage.setItem('userLocation', location);
              setLocationPermission('granted');
              fetchTrendingTopics(location);
              toast.success('Location access granted - showing local trending topics');
            },
            (error) => {
              console.error('Location error:', error);
              setLocationPermission('denied');
              toast.info('Location access denied - showing global trending topics');
              fetchTrendingTopics();
            }
          );
        }
      }
    } catch (error) {
      console.error('Location access error:', error);
      setLocationPermission('denied');
      fetchTrendingTopics();
    }
  };

  const fetchTrendingTopics = async (location?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = location 
        ? `${API_BASE_URL}/api/v1/trending?limit=10&location=${encodeURIComponent(location)}`
        : `${API_BASE_URL}/api/v1/trending?limit=10`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 503) {
          throw new Error('Real-time trending data unavailable. Please configure API.');
        }
        throw new Error('Failed to fetch trending topics');
      }
      
      const data = await response.json();
      setTrendingTopics(data);
    } catch (err: any) {
      console.error('Error fetching trending topics:', err);
      setError(err.message || 'Failed to load trending topics');
      toast.error('Could not load real-time trending data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (category: string) => {
    switch (category) {
      case 'politics':
        return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400';
      case 'health':
        return 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400';
      case 'science':
        return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400';
      case 'entertainment':
        return 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400';
    }
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
      const region = topic.region || 'Global';
      regionMap.set(region, (regionMap.get(region) || 0) + topic.total_checks);
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
    
    const totalChecks = trendingTopics.reduce((sum, topic) => sum + topic.total_checks, 0);
    const totalFake = trendingTopics.reduce((sum, topic) => sum + topic.fake_count, 0);
    const totalReal = trendingTopics.reduce((sum, topic) => sum + topic.real_count, 0);
    
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
      categoryMap.set(category, (categoryMap.get(category) || 0) + topic.total_checks);
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
            {locationPermission === 'prompt' && (
              <button
                onClick={requestLocationAccess}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Enable Location
              </button>
            )}
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Real-time tracking of viral misinformation across regions
            {userLocation && <span className="ml-2 text-blue-600">• Showing trends for {userLocation}</span>}
          </p>
          {locationPermission === 'denied' && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Location access denied. Showing global trending topics instead.
              </p>
            </div>
          )}
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
                  No trending topics available. Tavily API may need configuration.
                </p>
              </div>
            )}
            
            {trendingTopics.map((topic, idx) => {
              const timeAgo = formatTimeAgo(topic.created_at);
              const region = topic.region || 'Global';
              const engagement = `${Math.floor(topic.total_checks / 10)}K views`;
              
              const handleClick = () => {
                if (topic.source_url) {
                  window.open(topic.source_url, '_blank', 'noopener,noreferrer');
                }
              };
              
              return (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card 
                    className="glass-card p-6 h-full hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={handleClick}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={`${getStatusColor(topic.category)} border`}>
                        {topic.category.toUpperCase()}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <AlertCircle className="w-4 h-4" />
                        <span>{topic.total_checks}</span>
                      </div>
                    </div>

                    <h4 className="mb-4 line-clamp-2">{topic.title}</h4>

                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
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
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between text-xs">
                        <span className="text-red-600 dark:text-red-400">
                          {Math.round((topic.fake_count / topic.total_checks) * 100)}% fake
                        </span>
                        <span className="text-green-600 dark:text-green-400">
                          {Math.round((topic.real_count / topic.total_checks) * 100)}% real
                        </span>
                      </div>
                    </div>
                    
                    {topic.source_url && (
                      <div className="mt-3 text-xs text-blue-600 dark:text-blue-400">
                        Click to view source →
                      </div>
                    )}
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
