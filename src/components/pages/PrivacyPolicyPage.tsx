import { motion } from 'motion/react';
import { Shield, Lock, Eye, Server, UserCheck, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/card';

export function PrivacyPolicyPage() {
  const sections = [
    {
      icon: Shield,
      title: 'Information We Collect',
      content: [
        'Account information (email, name) when you register',
        'Content you submit for verification (text, images, videos, URLs)',
        'Usage data and analytics to improve our services',
        'Device information and browser type for security purposes'
      ]
    },
    {
      icon: Lock,
      title: 'How We Use Your Information',
      content: [
        'To provide and improve our AI-powered verification services',
        'To maintain and enhance the security of our platform',
        'To communicate important updates and security alerts',
        'To analyze trends in misinformation for research purposes'
      ]
    },
    {
      icon: Eye,
      title: 'Data Sharing and Disclosure',
      content: [
        'We never sell your personal information to third parties',
        'Content submitted is analyzed using our AI models locally',
        'Aggregated, anonymized data may be used for research',
        'We may disclose information if required by law'
      ]
    },
    {
      icon: Server,
      title: 'Data Storage and Security',
      content: [
        'All data is encrypted in transit and at rest',
        'We use industry-standard security measures',
        'Regular security audits and penetration testing',
        'Data centers comply with international security standards'
      ]
    },
    {
      icon: UserCheck,
      title: 'Your Rights',
      content: [
        'Access your personal data at any time',
        'Request deletion of your account and data',
        'Opt-out of non-essential data collection',
        'Export your data in a portable format'
      ]
    },
    {
      icon: AlertTriangle,
      title: 'Data Retention',
      content: [
        'Account data is retained while your account is active',
        'Verification history is kept for 90 days by default',
        'Deleted accounts are purged within 30 days',
        'Backup data is retained for disaster recovery purposes'
      ]
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
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        <div className="space-y-8">
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
                      <ul className="space-y-2">
                        {section.content.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
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
          <h3 className="text-lg font-semibold mb-2">Contact Us</h3>
          <p className="text-gray-600 dark:text-gray-400">
            If you have questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:anamitrasarkar13@gmail.com" className="text-blue-600 hover:underline">
              anamitrasarkar13@gmail.com
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
