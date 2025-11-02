import { motion } from 'motion/react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export function ContactUsPage() {
  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Mail className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="p-6 glass-card">
            <Mail className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Email Us</h3>
            <a href="mailto:anamitrasarkar13@gmail.com" className="text-blue-600 hover:underline">
              anamitrasarkar13@gmail.com
            </a>
          </Card>
          
          <Card className="p-6 glass-card">
            <MapPin className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Location</h3>
            <p className="text-gray-600 dark:text-gray-400">India</p>
          </Card>
        </div>
        
        <Card className="p-8 glass-card">
          <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input type="text" className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input type="email" className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800" placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea rows={5} className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800" placeholder="Your message..."></textarea>
            </div>
            <Button className="w-full">
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
