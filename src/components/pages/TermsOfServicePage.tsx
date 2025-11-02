import { motion } from 'motion/react';
import { FileText, Shield, AlertCircle, Users, Ban, CheckCircle } from 'lucide-react';
import { Card } from '../ui/card';

export function TermsOfServicePage() {
  const sections = [
    {
      icon: CheckCircle,
      title: 'Acceptance of Terms',
      content: 'By accessing and using VeriFy AI, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our services.'
    },
    {
      icon: Users,
      title: 'User Responsibilities',
      content: 'You agree to use VeriFy AI only for lawful purposes and in compliance with all applicable laws. You must not attempt to interfere with the proper functioning of the platform or access areas you are not authorized to access.'
    },
    {
      icon: Shield,
      title: 'Intellectual Property',
      content: 'All content, features, and functionality of VeriFy AI are owned by us and protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without explicit permission.'
    },
    {
      icon: Ban,
      title: 'Prohibited Uses',
      content: 'You may not use VeriFy AI to spread misinformation, harass others, violate privacy rights, or engage in any illegal activities. We reserve the right to terminate accounts that violate these terms.'
    },
    {
      icon: AlertCircle,
      title: 'Disclaimer of Warranties',
      content: 'VeriFy AI is provided "as is" without warranties of any kind. While we strive for high accuracy, we do not guarantee that our AI detection is 100% accurate. Users should use their own judgment.'
    },
    {
      icon: FileText,
      title: 'Changes to Terms',
      content: 'We may modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms. We will notify users of significant changes.'
    }
  ];

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Please read these terms carefully before using VeriFy AI services.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        <div className="space-y-6">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-6 glass-card">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
                      <p className="text-gray-600 dark:text-gray-400">{section.content}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 p-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
        >
          <h3 className="text-lg font-semibold mb-2">Questions?</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Contact us at{' '}
            <a href="mailto:anamitrasarkar13@gmail.com" className="text-blue-600 hover:underline">
              anamitrasarkar13@gmail.com
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
