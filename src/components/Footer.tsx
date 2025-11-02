import { motion } from 'motion/react';
import { Shield, Github, Linkedin, Mail, ExternalLink } from 'lucide-react';
import { t } from '../utils/translations';

interface FooterProps {
  language?: string;
  onNavigate?: (page: string) => void;
}

export function Footer({ language = 'en', onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const translate = (key: string) => t(key, language);

  const footerSections = [
    {
      title: translate('Product'),
      links: [
        { name: translate('Features'), page: 'Features' },
        { name: translate('How it Works'), page: 'About' },
        { name: translate('Accuracy'), page: 'About' },
        { name: translate('API Access'), page: 'About' },
      ],
    },
    {
      title: translate('Resources'),
      links: [
        { name: translate('Blog'), page: 'Community' },
        { name: translate('Guidelines'), page: 'Community' },
        { name: translate('Help Center'), page: 'Help' },
        { name: translate('Community'), page: 'Community' },
      ],
    },
    {
      title: translate('Legal'),
      links: [
        { name: translate('Privacy Policy'), page: 'Privacy' },
        { name: translate('Terms of Service'), page: 'Terms' },
        { name: translate('Cookie Policy'), page: 'Cookies' },
        { name: translate('Contact Us'), page: 'Contact' },
      ],
    },
  ];

  const socialLinks = [
    { icon: Github, href: 'https://github.com/Anamitra-Sarkar', label: 'GitHub' },
    { icon: Linkedin, href: 'https://www.linkedin.com/in/anamitra-sarkar-7538b936b/', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:anamitrasarkar13@gmail.com', label: 'Email' },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative mt-32 overflow-hidden"
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/20 to-purple-950/30 dark:from-transparent dark:via-blue-950/40 dark:to-purple-950/60" />
      
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(96, 165, 250, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(96, 165, 250, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
      </div>

      <div className="relative">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                  VeriFy AI
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Fighting misinformation with advanced verification technology and community power.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gradient-to-br hover:from-blue-600 hover:to-purple-600 transition-all group"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Footer Links */}
            {footerSections.map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + sectionIndex * 0.1 }}
              >
                <h4 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <button
                        onClick={() => onNavigate && onNavigate(link.page)}
                        className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 group cursor-pointer"
                      >
                        {link.name}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent mb-8" />

          {/* Bottom Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} <span className="font-semibold text-gray-900 dark:text-white">VeriFy AI</span>. {translate('All rights reserved. Built with care to combat misinformation.')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {translate('This platform uses advanced verification technology. Not meant for collecting PII or securing sensitive data.')}
            </p>
          </motion.div>
        </div>

        {/* Bottom Glow Effect */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      </div>
    </motion.footer>
  );
}
