import { motion } from 'motion/react';
import { Cookie, Info, Settings, Shield } from 'lucide-react';
import { Card } from '../ui/card';

export function CookiePolicyPage() {
  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Cookie className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Learn how we use cookies to improve your experience on VeriFy AI.
          </p>
        </motion.div>
        
        <div className="space-y-6">
          <Card className="p-6 glass-card">
            <h2 className="text-xl font-semibold mb-3">What Are Cookies?</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Cookies are small text files stored on your device when you visit our website. They help us remember your preferences and improve your experience.
            </p>
          </Card>
          
          <Card className="p-6 glass-card">
            <h2 className="text-xl font-semibold mb-3">How We Use Cookies</h2>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>• Essential cookies for authentication and security</li>
              <li>• Preference cookies to remember your settings (language, theme)</li>
              <li>• Analytics cookies to understand how you use our platform</li>
              <li>• Performance cookies to optimize loading times</li>
            </ul>
          </Card>
          
          <Card className="p-6 glass-card">
            <h2 className="text-xl font-semibold mb-3">Managing Cookies</h2>
            <p className="text-gray-600 dark:text-gray-400">
              You can control and delete cookies through your browser settings. Note that disabling cookies may affect the functionality of VeriFy AI.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
