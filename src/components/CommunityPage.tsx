import { motion } from 'motion/react';
import { Trophy, Award, Shield, Star, TrendingUp, Users, MessageSquare, ThumbsUp, Plus } from 'lucide-react';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

interface CommunityPageProps {
  language: string;
}

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  name: string;
  points: number;
  badge: string;
  verified: number;
  accuracy: number;
  avatar: string;
}

interface UserStats {
  user_id: number;
  level: number;
  xp_current: number;
  xp_required: number;
  total_reports: number;
  accuracy: number;
  current_rank: number;
  rank_change: number;
  streak_days: number;
}

interface BadgeInfo {
  name: string;
  description: string;
  rarity: string;
  color: string;
  bgColor: string;
  earned: boolean;
  earned_at?: string;
}

interface Discussion {
  id: number;
  title: string;
  author: string;
  author_id: number;
  replies: number;
  likes: number;
  views: number;
  timeAgo: string;
  category?: string;
  tags?: string;
}

// API functions
const API_BASE_URL = 'http://localhost:8000/api/v1';

async function fetchLeaderboard(token?: string): Promise<LeaderboardEntry[]> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/community/leaderboard?limit=50`, {
      headers,
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

async function fetchUserStats(token: string): Promise<UserStats | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/community/stats/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return null;
  }
}

async function fetchBadges(token: string): Promise<BadgeInfo[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/community/badges`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching badges:', error);
    return [];
  }
}

async function fetchDiscussions(token?: string): Promise<Discussion[]> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/community/discussions?limit=20`, {
      headers,
    });
    
    if (!response.ok) {
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching discussions:', error);
    return [];
  }
}

const badges = [
  {
    name: 'Guardian Elite',
    description: 'Verified 500+ reports with 95%+ accuracy',
    icon: Shield,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    rarity: 'Legendary',
  },
  {
    name: 'Truth Seeker',
    description: 'Active for 6+ months with consistent contributions',
    icon: Trophy,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    rarity: 'Epic',
  },
  {
    name: 'Fact Champion',
    description: 'Top 100 contributors this month',
    icon: Award,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    rarity: 'Rare',
  },
  {
    name: 'Top Reporter',
    description: 'Submitted 250+ accurate reports',
    icon: Star,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950',
    rarity: 'Rare',
  },
  {
    name: 'Vigilant Eye',
    description: 'First to report 50+ viral misinformation',
    icon: TrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    rarity: 'Uncommon',
  },
  {
    name: 'Community Hero',
    description: 'Helped educate 1000+ users',
    icon: Users,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 dark:bg-pink-950',
    rarity: 'Epic',
  },
];

const recentDiscussions = [
  {
    title: 'How to identify deepfake videos?',
    author: 'Vikram Singh',
    replies: 24,
    likes: 156,
    timeAgo: '2 hours ago',
  },
  {
    title: 'Common patterns in health misinformation',
    author: 'Dr. Meena Reddy',
    replies: 18,
    likes: 203,
    timeAgo: '5 hours ago',
  },
  {
    title: 'Tips for fact-checking political claims',
    author: 'Arun Verma',
    replies: 31,
    likes: 189,
    timeAgo: '1 day ago',
  },
  {
    title: 'Understanding AI-generated content markers',
    author: 'Sneha Joshi',
    replies: 12,
    likes: 98,
    timeAgo: '2 days ago',
  },
];

export function CommunityPage({ language: _language }: CommunityPageProps) {
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [badgesData, setBadgesData] = useState<BadgeInfo[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, [user]);
  
  async function loadData() {
    setLoading(true);
    
    try {
      // Get token from Firebase user
      const token = user ? await (user as any).getIdToken() : undefined;
      
      // Fetch all data in parallel
      const [leaderboard, stats, badges, disc] = await Promise.all([
        fetchLeaderboard(token),
        token ? fetchUserStats(token) : Promise.resolve(null),
        token ? fetchBadges(token) : Promise.resolve([]),
        fetchDiscussions(token),
      ]);
      
      setLeaderboardData(leaderboard);
      setUserStats(stats);
      setBadgesData(badges);
      setDiscussions(disc);
    } catch (error) {
      console.error('Error loading community data:', error);
      toast.error('Failed to load community data');
    } finally {
      setLoading(false);
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading community data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8 text-blue-600" />
            <h2>Community Hub</h2>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Join our community of truth guardians and earn recognition
          </p>
        </motion.div>

        <Tabs defaultValue="leaderboard" className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="mt-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Top 3 Podium */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2"
              >
                <Card className="glass-card p-8">
                  <h3 className="mb-8">Top Contributors This Month</h3>
                  
                  {/* Podium */}
                  {leaderboardData.length >= 3 && (
                    <div className="flex items-end justify-center gap-6 mb-12">
                      {/* 2nd Place */}
                      <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col items-center"
                      >
                        <Avatar className="w-16 h-16 mb-3 ring-4 ring-gray-300">
                          <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-600 text-white">
                            {leaderboardData[1].avatar}
                          </AvatarFallback>
                        </Avatar>
                        <Badge className="mb-2 bg-gray-200 text-gray-700">2nd</Badge>
                        <p className="text-sm mb-1">{leaderboardData[1].name}</p>
                        <p className="text-xs text-gray-500">{leaderboardData[1].points} pts</p>
                        <div className="w-24 h-32 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-t-lg mt-4" />
                      </motion.div>

                      {/* 1st Place */}
                      <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col items-center"
                      >
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Avatar className="w-20 h-20 mb-3 ring-4 ring-yellow-400">
                          <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white">
                            {leaderboardData[0].avatar}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                      <Badge className="mb-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                        <Trophy className="w-3 h-3 mr-1" />
                        1st
                      </Badge>
                      <p className="mb-1">{leaderboardData[0].name}</p>
                      <p className="text-xs text-gray-500">{leaderboardData[0].points} pts</p>
                      <div className="w-24 h-40 bg-gradient-to-br from-yellow-300 to-yellow-500 dark:from-yellow-600 dark:to-yellow-800 rounded-t-lg mt-4 relative overflow-hidden">
                        <motion.div
                          className="absolute inset-0 bg-white"
                          animate={{ opacity: [0, 0.3, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                    </motion.div>

                    {/* 3rd Place */}
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex flex-col items-center"
                    >
                      <Avatar className="w-16 h-16 mb-3 ring-4 ring-orange-300">
                        <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white">
                          {leaderboardData[2].avatar}
                        </AvatarFallback>
                      </Avatar>
                      <Badge className="mb-2 bg-orange-200 text-orange-700">3rd</Badge>
                      <p className="text-sm mb-1">{leaderboardData[2].name}</p>
                      <p className="text-xs text-gray-500">{leaderboardData[2].points} pts</p>
                      <div className="w-24 h-24 bg-gradient-to-br from-orange-200 to-orange-300 dark:from-orange-700 dark:to-orange-800 rounded-t-lg mt-4" />
                    </motion.div>
                  </div>
                  )}
                  
                  {leaderboardData.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">
                        No leaderboard data available yet. Be the first to contribute!
                      </p>
                    </div>
                  )}

                  {/* Full Leaderboard */}
                  <div className="space-y-3">
                    {leaderboardData.map((user, idx) => (
                      <motion.div
                        key={user.rank}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + idx * 0.1 }}
                        className="glass-card rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-8 text-center">
                              <span className="font-display text-xl text-gray-500">#{user.rank}</span>
                            </div>
                            <Avatar className="w-12 h-12">
                              <AvatarFallback>{user.avatar}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p>{user.name}</p>
                              <p className="text-sm text-gray-500">{user.badge}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-display text-xl mb-1">{user.points}</p>
                            <p className="text-xs text-gray-500">{user.verified} verified • {user.accuracy}% accuracy</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* Your Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                {user && userStats ? (
                  <>
                    <Card className="glass-card p-6">
                      <h4 className="mb-4">Your Progress</h4>
                      <div className="text-center mb-6">
                        <Avatar className="w-20 h-20 mx-auto mb-3">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                            {user.displayName?.substring(0, 2).toUpperCase() || user.email?.substring(0, 2).toUpperCase() || 'YU'}
                          </AvatarFallback>
                        </Avatar>
                        <p className="mb-1">{user.displayName || user.email}</p>
                        <Badge variant="outline">Level {userStats.level}</Badge>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm">Level {userStats.level}</span>
                            <span className="text-sm text-gray-500">{userStats.xp_current} / {userStats.xp_required} XP</span>
                          </div>
                          <Progress value={(userStats.xp_current / userStats.xp_required) * 100} className="h-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                          <div className="text-center">
                            <p className="font-display text-2xl mb-1">{userStats.total_reports}</p>
                            <p className="text-xs text-gray-500">Reports</p>
                          </div>
                          <div className="text-center">
                            <p className="font-display text-2xl mb-1">{userStats.accuracy}%</p>
                            <p className="text-xs text-gray-500">Accuracy</p>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="glass-card p-6">
                      <h4 className="mb-4">Quick Stats</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Current Rank</span>
                          <span className="font-display">#{userStats.current_rank}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">This Week</span>
                          <span className={userStats.rank_change >= 0 ? "text-green-600" : "text-red-600"}>
                            {userStats.rank_change > 0 ? '+' : ''}{userStats.rank_change} {userStats.rank_change >= 0 ? '↑' : '↓'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Streak</span>
                          <span className="font-display">{userStats.streak_days} days 🔥</span>
                        </div>
                      </div>
                    </Card>
                  </>
                ) : (
                  <Card className="glass-card p-6">
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Login to see your stats and join the leaderboard!
                      </p>
                    </div>
                  </Card>
                )}
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="badges" className="mt-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {(badgesData.length > 0 ? badgesData : badges).map((badge, idx) => {
                // Map badge name to icon
                const iconMap: Record<string, any> = {
                  'Guardian Elite': Shield,
                  'Truth Seeker': Trophy,
                  'Fact Champion': Award,
                  'Top Reporter': Star,
                  'Vigilant Eye': TrendingUp,
                  'Community Hero': Users,
                };
                const Icon = iconMap[badge.name] || Shield;
                
                return (
                  <motion.div
                    key={badge.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <Card className={`${badge.bgColor} border-2 p-6 h-full relative ${
                      'earned' in badge && badge.earned ? 'ring-2 ring-green-500' : 'opacity-75'
                    }`}>
                      {'earned' in badge && badge.earned && (
                        <div className="absolute top-2 right-2">
                          <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                        </div>
                      )}
                      <div className="flex items-start justify-between mb-4">
                        <Icon className={`w-12 h-12 ${badge.color}`} />
                        <Badge variant="outline" className="text-xs">{badge.rarity}</Badge>
                      </div>
                      <h4 className="mb-2">{badge.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {badge.description}
                      </p>
                      {'earned' in badge && badge.earned && badge.earned_at && (
                        <p className="text-xs text-green-600 mt-2">
                          Earned {new Date(badge.earned_at).toLocaleDateString()}
                        </p>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </TabsContent>

          <TabsContent value="discussions" className="mt-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {discussions.length > 0 ? discussions.map((discussion, idx) => (
                  <motion.div
                    key={discussion.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="glass-card p-6 hover:shadow-lg transition-shadow cursor-pointer">
                      <h4 className="mb-3">{discussion.title}</h4>
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-4">
                          <span>by {discussion.author}</span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {discussion.replies}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" />
                            {discussion.likes}
                          </span>
                        </div>
                        <span>{discussion.timeAgo}</span>
                      </div>
                    </Card>
                  </motion.div>
                )) : (
                  <Card className="glass-card p-8">
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        No discussions yet. Be the first to start one!
                      </p>
                      {user && (
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Start Discussion
                        </Button>
                      )}
                    </div>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <Card className="glass-card p-6">
                  <h4 className="mb-4">Discussion Guidelines</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Be respectful and constructive</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Share credible sources</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Help educate others</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Report misinformation</span>
                    </li>
                  </ul>
                </Card>

                <Card className="glass-card p-6">
                  <h4 className="mb-4">Popular Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {['#Deepfakes', '#Politics', '#Health', '#Education', '#Technology', '#WhatsApp'].map((tag) => (
                      <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
