import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface FloatingCardProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function FloatingCard({ children, delay = 0, duration = 6, className = '' }: FloatingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ 
        scale: 1.02,
        y: -5,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        transition: { duration: 0.2 }
      }}
      className={className}
    >
      <motion.div
        animate={{
          y: [0, -15, 0],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

interface AnimatedFeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
  gradient?: string;
}

export function AnimatedFeatureCard({ 
  icon, 
  title, 
  description, 
  delay = 0,
  gradient = 'from-blue-500/20 to-purple-500/20'
}: AnimatedFeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ delay, duration: 0.5, type: 'spring', stiffness: 100 }}
      whileHover={{ 
        scale: 1.05,
        y: -10,
        transition: { duration: 0.2 }
      }}
      className="relative group cursor-pointer"
    >
      {/* Card */}
      <div className="glass-card rounded-3xl p-8 h-full relative overflow-hidden">
        {/* Gradient overlay */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        />

        {/* Glow effect */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-40 h-40 bg-blue-400/30 dark:bg-blue-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Icon with animated background */}
          <motion.div
            className="relative inline-block mb-6"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-2xl blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all duration-300">
              {icon}
            </div>
          </motion.div>

          {/* Title */}
          <motion.h3
            className="text-2xl font-bold mb-4 text-gray-900 dark:text-white"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.2 }}
          >
            {title}
          </motion.h3>

          {/* Description */}
          <motion.p
            className="text-gray-600 dark:text-gray-400 leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: delay + 0.3 }}
          >
            {description}
          </motion.p>
        </div>

        {/* Bottom accent line */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
        />
      </div>
    </motion.div>
  );
}
