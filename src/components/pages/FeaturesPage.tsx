import { motion } from 'motion/react';
import { Shield, Zap, Globe, Users, Target, Lock, TrendingUp, Bell } from 'lucide-react';
import { Card } from '../ui/card';

export function FeaturesPage() {
  const features = [
    { icon: Shield, title: 'Advanced AI Detection', desc: '99.2% accuracy in detecting fake news, deepfakes, and misinformation using state-of-the-art models.' },
    { icon: Zap, title: 'Real-Time Analysis', desc: 'Instant verification results with detailed confidence scores and explanations.' },
    { icon: Globe, title: '17 Indian Languages', desc: 'Support for Hindi, Bengali, Telugu, Tamil, Marathi, and 12 more regional languages.' },
    { icon: Users, title: 'Community Driven', desc: 'Join thousands of truth guardians fighting misinformation together.' },
    { icon: Target, title: 'Multi-Format Support', desc: 'Verify text, images, videos, voice, and URLs across all platforms.' },
    { icon: Lock, title: 'Privacy First', desc: 'End-to-end encryption with no data sharing or personal information collection.' },
    { icon: TrendingUp, title: 'Trending Insights', desc: 'Real-time tracking of viral misinformation and regional fake news trends.' },
    { icon: Bell, title: 'Smart Notifications', desc: 'Get alerts about trending fake news in your area and topics you care about.' },
  ];

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">Powerful Features</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Everything you need to combat misinformation and stay informed in the digital age.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <Card className="p-6 glass-card h-full hover:shadow-xl transition-shadow">
                <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
