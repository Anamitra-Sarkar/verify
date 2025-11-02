import { motion } from 'motion/react';
import { HelpCircle, Search, Book, MessageCircle } from 'lucide-react';
import { Card } from '../ui/card';

export function HelpCenterPage() {
  const faqs = [
    { q: 'How accurate is VeriFy AI?', a: 'Our platform maintains 99.2% accuracy using state-of-the-art AI models continuously trained on the latest misinformation patterns.' },
    { q: 'Is my data secure?', a: 'Yes. All data is encrypted end-to-end. We never store your personal content or share information with third parties.' },
    { q: 'What formats can I verify?', a: 'You can verify text, images, videos, voice recordings, and URLs from any source or platform.' },
    { q: 'How do I report a bug?', a: 'Email us at anamitrasarkar13@gmail.com with details about the issue.' },
  ];

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <HelpCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-gray-600 dark:text-gray-400">Find answers to common questions and get support.</p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <Card key={idx} className="p-6 glass-card">
              <h3 className="text-lg font-semibold mb-2">{faq.q}</h3>
              <p className="text-gray-600 dark:text-gray-400">{faq.a}</p>
            </Card>
          ))}
        </div>

        <Card className="mt-12 p-8 glass-card text-center">
          <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Still Need Help?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Contact our support team</p>
          <a href="mailto:anamitrasarkar13@gmail.com" className="text-blue-600 hover:underline text-lg">
            anamitrasarkar13@gmail.com
          </a>
        </Card>
      </div>
    </div>
  );
}
