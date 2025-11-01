import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export function AnimatedHeroText({ language }: { language: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const taglines = [
    { text: 'FIGHT MISINFORMATION', highlight: 'INSTANTLY', lang: 'en' },
    { text: 'गलत सूचना से लड़ें', highlight: 'तुरंत', lang: 'hi' },
    { text: 'ভুল তথ্যের বিরুদ্ধে লড়াই', highlight: 'তাৎক্ষণিকভাবে', lang: 'bn' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % taglines.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const currentTagline = taglines[currentIndex];

  return (
    <div className="min-h-[200px] flex flex-col items-center justify-center">
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, rotateX: -90, y: 50 }}
        animate={{ opacity: 1, rotateX: 0, y: 0 }}
        exit={{ opacity: 0, rotateX: 90, y: -50 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="perspective-1000"
      >
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-center mb-4 leading-tight">
          <span className="block text-gray-900 dark:text-white mb-2">
            {currentTagline.text.split('').map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="inline-block"
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </span>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            className="gradient-text block animate-pulse-glow"
          >
            {currentTagline.highlight}
          </motion.span>
        </h1>
      </motion.div>
    </div>
  );
}
