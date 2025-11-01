import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { useEffect } from 'react';

interface AnimatedCounterProps {
  value: string;
  label: string;
  delay?: number;
}

export function AnimatedCounter({ value, label, delay = 0 }: AnimatedCounterProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  // Extract number from value string (e.g., "2M+" -> 2000000)
  const targetNumber = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
  const suffix = value.replace(/[0-9.]/g, '');
  const multiplier = suffix.includes('M') ? 1000000 : suffix.includes('K') ? 1000 : 1;
  const finalTarget = targetNumber * multiplier;

  useEffect(() => {
    const controls = animate(count, finalTarget, {
      duration: 2,
      delay,
      ease: 'easeOut',
    });

    return controls.stop;
  }, [count, finalTarget, delay]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M+';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K+';
    }
    return num.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ 
        scale: 1.05, 
        y: -8,
        boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)',
        transition: { duration: 0.2 }
      }}
      className="glass-card rounded-2xl p-6 sm:p-8 text-center group cursor-pointer relative overflow-hidden"
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />
      
      {/* Spotlight effect */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />

      <div className="relative z-10">
        <motion.div 
          className="font-display text-4xl sm:text-5xl mb-2 gradient-text font-bold"
        >
          <motion.span>
            {formatNumber(rounded.get())}
          </motion.span>
        </motion.div>
        <motion.div 
          className="text-gray-600 dark:text-gray-400 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.5 }}
        >
          {label}
        </motion.div>
      </div>

      {/* Particle effect on hover */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />
    </motion.div>
  );
}
