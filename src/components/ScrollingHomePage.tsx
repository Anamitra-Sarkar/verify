import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'motion/react';
import { useRef, useEffect, useState } from 'react';
import { 
  Shield, Zap, Globe, Users, TrendingUp, Lock,
  Sparkles, ArrowRight, CheckCircle2, Star,
  Eye, FileCheck, Video, Image as ImageIcon, Mic,
  Chrome, Download, Scan, Rocket
} from 'lucide-react';
import { Button } from './ui/button';
import { t } from '../utils/translations';

interface ScrollingHomePageProps {
  onAnalyzeClick: () => void;
  language: string;
}

export function ScrollingHomePage({ onAnalyzeClick, language }: ScrollingHomePageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentLanguageIndex, setCurrentLanguageIndex] = useState(0);
  const [robotPhase, setRobotPhase] = useState<'flying' | 'shrinking' | 'static'>('flying');
  const [showWhatsAppMessage, setShowWhatsAppMessage] = useState(false);

  // Translation function
  const translate = (key: string) => t(key, language);

  // Multi-language hero text
  const heroTexts = [
    { lang: 'English', line1: translate('FIGHT'), line2: translate('MISINFORMATION') },
    { lang: 'Hindi', line1: 'लड़ें', line2: 'गलत सूचना से' },
    { lang: 'Bengali', line1: 'লড়াই করুন', line2: 'ভুল তথ্যের বিরুদ্ধে' },
  ];

  // Cycle through languages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLanguageIndex((prev) => (prev + 1) % heroTexts.length);
    }, 3000); // Change every 3 seconds
    return () => clearInterval(interval);
  }, []);

  // Robot animation sequence - appears, shows message, flies away
  useEffect(() => {
    // Phase 1: Flying in (0-2s)
    const flyInTimer = setTimeout(() => {
      setRobotPhase('shrinking');
    }, 2000);

    // Phase 2: Show message (2-6s)
    const showMessageTimer = setTimeout(() => {
      setRobotPhase('static');
      setShowWhatsAppMessage(true);
    }, 3000);

    // Phase 3: Fly away (6-8s)
    const flyAwayTimer = setTimeout(() => {
      setRobotPhase('flying'); // Reuse flying for exit animation
      setShowWhatsAppMessage(false);
    }, 7000);

    return () => {
      clearTimeout(flyInTimer);
      clearTimeout(showMessageTimer);
      clearTimeout(flyAwayTimer);
    };
  }, []);

  // Smooth scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Parallax transforms
  const y1 = useTransform(smoothProgress, [0, 1], [0, -200]);
  const y2 = useTransform(smoothProgress, [0, 1], [0, -400]);
  const y3 = useTransform(smoothProgress, [0, 1], [0, -600]);
  const opacity = useTransform(smoothProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(smoothProgress, [0, 0.5], [1, 0.8]);

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: translate('Advanced AI Detection'),
      description: translate('State-of-the-art deep learning models detect deepfakes, fake news, and manipulated content with 99.2% accuracy.'),
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: translate('Real-Time Verification'),
      description: translate('Instant analysis with detailed source verification, fact-checking, and confidence scoring.'),
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: translate('Multi-Format Support'),
      description: translate('Verify text, images, videos, and audio content across all major social media platforms.'),
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: translate('Community-Driven'),
      description: 'Join millions of users fighting misinformation. Report, verify, and learn together.',
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  const stats = [
    { value: '2M+', label: 'Verifications', icon: <CheckCircle2 className="w-6 h-6" /> },
    { value: '500K+', label: 'Active Users', icon: <Users className="w-6 h-6" /> },
    { value: '99.2%', label: 'Accuracy', icon: <Star className="w-6 h-6" /> },
    { value: '150+', label: 'Countries', icon: <Globe className="w-6 h-6" /> },
  ];

  const capabilities = [
    {
      icon: <FileCheck className="w-12 h-12" />,
      title: 'Text Analysis',
      description: 'Detect fake news, misleading claims, and false information',
      color: 'blue',
    },
    {
      icon: <ImageIcon className="w-12 h-12" />,
      title: 'Image Detection',
      description: 'Identify deepfakes, AI-generated images, and photo manipulation',
      color: 'purple',
    },
    {
      icon: <Video className="w-12 h-12" />,
      title: 'Video Analysis',
      description: 'Spot deepfake videos, face swaps, and synthetic media',
      color: 'pink',
    },
    {
      icon: <Mic className="w-12 h-12" />,
      title: 'Voice Verification',
      description: 'Detect voice cloning, audio deepfakes, and synthetic speech',
      color: 'green',
    },
  ];

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden bg-black">
      {/* Animated Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#0f1729_1px,transparent_1px),linear-gradient(to_bottom,#0f1729_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />

      {/* Gradient Orbs */}
      <motion.div
        className="fixed top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-3xl"
        style={{
          x: mousePosition.x,
          y: mousePosition.y,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="fixed bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
        style={{
          x: -mousePosition.x,
          y: -mousePosition.y,
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 3D ROBOT WITH WHATSAPP MESSAGE ANIMATION */}
      <AnimatePresence mode="wait">
        {(robotPhase === 'flying' || robotPhase === 'shrinking') && (
          <motion.div
            initial={{ 
              x: '100vw',
              y: '-20vh',
              scale: 0.5,
              rotateY: -45,
              rotateZ: -15
            }}
            animate={
              robotPhase === 'flying' ? {
                x: ['100vw', '-100vw'],
                y: ['-20vh', '100vh'],
                scale: [0.5, 0.3],
                rotateY: [-45, 45],
                rotateZ: [-15, 15],
              } : {
                x: '50vw',
                y: '50vh',
                scale: 1,
                rotateY: 0,
                rotateZ: 0,
              }
            }
            exit={{
              x: '-100vw',
              y: '100vh',
              scale: 0.3,
              rotateY: 45,
              rotateZ: 15,
              opacity: 0
            }}
            transition={{
              duration: robotPhase === 'flying' ? 8 : 2,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            className="fixed z-50 pointer-events-none"
            style={{ 
              left: '-150px', 
              top: '-150px',
              transformStyle: 'preserve-3d',
              perspective: '1000px'
            }}
          >
            {/* 3D Robot Container */}
            <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
              {/* Glow Effect */}
              <motion.div
                className="absolute -inset-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* 3D Robot Body */}
              <motion.div
                className="relative w-48 h-48"
                animate={{
                  y: [0, -15, 0],
                  rotateY: [0, 10, 0, -10, 0],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Orbiting Fake News Badges */}
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute w-12 h-8 bg-gradient-to-r from-red-500 to-orange-500 backdrop-blur rounded-lg shadow-xl border border-red-600 flex items-center justify-center"
                    style={{
                      left: '50%',
                      top: '50%',
                      transformStyle: 'preserve-3d',
                    }}
                    animate={{
                      rotate: [i * 90, i * 90 + 360],
                      x: [0, 60 * Math.cos((i / 4) * Math.PI * 2), 0],
                      y: [0, 60 * Math.sin((i / 4) * Math.PI * 2), 0],
                      scale: [0.8, 1, 0.8],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'linear',
                      delay: i * 0.5,
                    }}
                  >
                    <span className="text-white text-[6px] font-black">FAKE</span>
                  </motion.div>
                ))}

                {/* 3D Robot Head */}
                <motion.div
                  className="absolute left-1/2 top-4 -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl border-2 border-white/30"
                  animate={{
                    rotateX: [-5, 5, -5],
                    rotateY: [-3, 3, -3],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Antenna */}
                  <motion.div
                    className="absolute -top-8 left-1/2 -translate-x-1/2 w-1 h-8 bg-gradient-to-t from-blue-500 to-transparent"
                    animate={{ scaleY: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <motion.div
                      className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  </motion.div>

                  {/* Eyes */}
                  <div className="flex gap-6 justify-center pt-8">
                    <motion.div
                      className="w-8 h-8 bg-cyan-400 rounded-full relative overflow-hidden"
                      animate={{ scaleY: [1, 0.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                        animate={{ x: [-50, 50] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.div>
                    <motion.div
                      className="w-8 h-8 bg-cyan-400 rounded-full relative overflow-hidden"
                      animate={{ scaleY: [1, 0.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 0.1 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                        animate={{ x: [-50, 50] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.div>
                  </div>

                  {/* Scanning Lines */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute left-0 right-0 h-0.5 bg-cyan-400/50"
                      style={{ top: `${30 + i * 10}%` }}
                      animate={{
                        opacity: [0, 1, 0],
                        scaleX: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    />
                  ))}

                  {/* Mouth */}
                  <motion.div
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1"
                    animate={{ scaleX: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="w-1 h-3 bg-cyan-400 rounded-full" />
                    ))}
                  </motion.div>
                </motion.div>

                {/* 3D Robot Body */}
                <motion.div
                  className="absolute left-1/2 top-24 -translate-x-1/2 w-28 h-36 bg-gradient-to-br from-blue-700 to-purple-700 rounded-xl shadow-2xl border-2 border-white/30"
                  animate={{
                    scaleY: [1, 1.03, 1],
                    rotateX: [0, 2, 0],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Chest Display */}
                  <motion.div
                    className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg overflow-hidden"
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(0, 255, 255, 0.5)',
                        '0 0 40px rgba(0, 255, 255, 0.8)',
                        '0 0 20px rgba(0, 255, 255, 0.5)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {/* Fake News Detector Display */}
                    <motion.div
                      className="text-white text-[10px] font-bold text-center pt-2"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      FAKE NEWS
                      <br />
                      DETECTED
                    </motion.div>
                  </motion.div>

                  {/* 3D Arms */}
                  <motion.div
                    className="absolute -left-6 top-6 w-6 h-16 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full shadow-lg"
                    animate={{ 
                      rotate: [0, -15, 0],
                      rotateY: [0, 10, 0]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ transformStyle: 'preserve-3d' }}
                  />
                  <motion.div
                    className="absolute -right-6 top-6 w-6 h-16 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full shadow-lg"
                    animate={{ 
                      rotate: [0, 15, 0],
                      rotateY: [0, -10, 0]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ transformStyle: 'preserve-3d' }}
                  />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Static Robot with WhatsApp Message */}
        {robotPhase === 'static' && showWhatsAppMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            transition={{ 
              type: 'spring',
              stiffness: 200,
              damping: 20
            }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-4"
          >
            {/* 3D Robot with Message */}
            <motion.div
              className="relative"
              animate={{ 
                rotateY: [0, 360],
                y: [0, -20, 0]
              }}
              transition={{ 
                rotateY: { duration: 4, repeat: Infinity, ease: 'linear' },
                y: { duration: 2, repeat: Infinity }
              }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Mega Glow */}
              <div className="absolute -inset-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-3xl opacity-60 animate-pulse" />
              
              {/* 3D Robot */}
              <div className="relative w-32 h-32" style={{ transformStyle: 'preserve-3d' }}>
                {/* Robot Head */}
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl border-2 border-white/30"
                  style={{ transformStyle: 'preserve-3d', transform: 'translateZ(20px)' }}
                >
                  {/* Eyes */}
                  <div className="flex gap-3 justify-center pt-3">
                    <motion.div
                      className="w-3 h-3 bg-cyan-400 rounded-full shadow-lg"
                      animate={{ scale: [1, 0.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="w-3 h-3 bg-cyan-400 rounded-full shadow-lg"
                      animate={{ scale: [1, 0.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
                    />
                  </div>
                  {/* Smile */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-8 h-2 bg-cyan-400 rounded-full shadow-lg" />
                  {/* Antenna */}
                  <motion.div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 w-1 h-4 bg-gradient-to-t from-purple-500 to-transparent"
                    animate={{ scaleY: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  </motion.div>
                </motion.div>
                
                {/* Robot Body */}
                <motion.div
                  className="absolute left-1/2 top-14 -translate-x-1/2 w-20 h-24 bg-gradient-to-br from-blue-700 to-purple-700 rounded-xl shadow-2xl border-2 border-white/30"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Chest Display */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg animate-pulse" />
                  {/* Arms */}
                  <motion.div
                    className="absolute -left-4 top-4 w-4 h-12 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full shadow-lg"
                    animate={{ rotate: [0, -20, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute -right-4 top-4 w-4 h-12 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full shadow-lg"
                    animate={{ rotate: [0, 20, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* WhatsApp Style Message Bubble */}
            <motion.div
              initial={{ opacity: 0, scale: 0, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
              className="relative max-w-md"
            >
              {/* Message Bubble */}
              <motion.div
                className="bg-gradient-to-r from-green-400 via-green-500 to-emerald-500 text-white px-8 py-6 rounded-3xl rounded-bl-none shadow-2xl relative"
                animate={{
                  boxShadow: [
                    '0 20px 60px rgba(34, 197, 94, 0.5)',
                    '0 20px 80px rgba(34, 197, 94, 0.7)',
                    '0 20px 60px rgba(34, 197, 94, 0.5)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: 'rotateX(5deg)'
                }}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-3 border-b border-white/30 pb-2">
                  <motion.div
                    className="text-2xl"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    🤖
                  </motion.div>
                  <div>
                    <div className="font-bold text-lg">VeriFy AI Bot</div>
                    <div className="text-xs text-white/80">online</div>
                  </div>
                </div>

                {/* Message */}
                <motion.p 
                  className="text-3xl font-black mb-4"
                  animate={{ 
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  TRY IT OUT!! 🚀✨
                </motion.p>

                {/* Timestamp & Checks */}
                <div className="flex justify-end items-center gap-2 text-sm text-white/90">
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ✓✓
                  </motion.span>
                </div>
              </motion.div>

              {/* Tail for bubble */}
              <div className="absolute -bottom-2 left-0 w-8 h-8 bg-emerald-500 rounded-bl-3xl transform -scale-x-100" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        <motion.div
          style={{ y: y1, opacity, scale }}
          className="max-w-7xl mx-auto text-center"
        >
          {/* Main Title - Multi-Language Cycling */}
          <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 leading-tight px-4 min-h-[200px] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[350px] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentLanguageIndex}
                initial={{ opacity: 0, y: 50, rotateX: -15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -50, rotateX: 15 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="w-full"
              >
                <div className="block text-white mb-4 break-words text-center">
                  {heroTexts[currentLanguageIndex].line1}
                </div>
                <div className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent break-words text-center">
                  {heroTexts[currentLanguageIndex].line2}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl sm:text-2xl text-white/70 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Detect deepfakes, fake news, and manipulated content instantly.
            Verify anything with AI-powered analysis in seconds.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              onClick={onAnalyzeClick}
              className="group relative px-8 py-6 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full shadow-2xl shadow-blue-500/50 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
            >
              <span className="flex items-center gap-2">
                Start Verification
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
            <Button
              variant="outline"
              className="px-8 py-6 text-lg font-semibold bg-white/10 hover:bg-white/20 backdrop-blur-xl border-white/20 text-white rounded-full transition-all duration-300 hover:scale-105"
            >
              Watch Demo
            </Button>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-white rounded-full"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section - INSANE ANIMATIONS */}
      <section className="relative py-32 px-4">
        <motion.div
          style={{ y: y2 }}
          className="max-w-7xl mx-auto"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  rotateY: -180,
                  rotateX: -180,
                  z: -1000
                }}
                whileInView={{ 
                  opacity: 1, 
                  scale: 1,
                  rotateY: 0,
                  rotateX: 0,
                  z: 0
                }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ 
                  duration: 0.8,
                  delay: index * 0.15,
                  type: 'spring',
                  stiffness: 100,
                  damping: 15
                }}
                whileHover={{ 
                  scale: 1.1,
                  y: -20,
                  rotateZ: 5,
                  transition: { duration: 0.3 }
                }}
                className="relative group perspective-1000"
              >
                <motion.div 
                  className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center overflow-hidden"
                  whileHover={{
                    boxShadow: '0 0 40px rgba(59, 130, 246, 0.5)',
                  }}
                >
                  {/* Animated Glow Effect */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20"
                    animate={{
                      opacity: [0, 0.3, 0],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                  
                  {/* Sparkle Effect */}
                  <motion.div
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: index * 0.15 + 0.5 }}
                  >
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 2,
                          delay: i * 0.2,
                          repeat: Infinity,
                        }}
                      />
                    ))}
                  </motion.div>
                  
                  <div className="relative z-10">
                    <motion.div 
                      className="inline-block mb-4 text-blue-400"
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    >
                      {stat.icon}
                    </motion.div>
                    <motion.div 
                      className="text-5xl font-black text-white mb-2"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.15 + 0.3 }}
                    >
                      {stat.value}
                    </motion.div>
                    <motion.div 
                      className="text-white/60 font-medium"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: index * 0.15 + 0.4 }}
                    >
                      {stat.label}
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Chrome Extension Card Section - EXPLOSIVE ANIMATION */}
      <section className="relative py-32 px-4">
        <motion.div
          style={{ y: y2 }}
          className="max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ 
              opacity: 0, 
              scale: 0.3,
              rotateX: -90,
              y: 100
            }}
            whileInView={{ 
              opacity: 1, 
              scale: 1,
              rotateX: 0,
              y: 0
            }}
            viewport={{ once: true, margin: '-150px' }}
            transition={{ 
              duration: 1,
              type: 'spring',
              stiffness: 80,
              damping: 12
            }}
            className="relative group perspective-1000"
          >
            {/* Animated Border Glow - ENHANCED */}
            <motion.div 
              className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-75 group-hover:opacity-100 blur-lg"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
            
            {/* Main Card */}
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-3xl p-12 overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20" />
              
              {/* Floating Chrome Icon */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute top-8 right-8 w-32 h-32 opacity-10"
              >
                <Chrome className="w-full h-full text-blue-400" />
              </motion.div>

              <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
                {/* Left: Icon & Badge - CRAZY ANIMATIONS */}
                <div className="flex-shrink-0">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      duration: 0.8,
                      type: 'spring',
                      stiffness: 100
                    }}
                    whileHover={{ 
                      scale: 1.2, 
                      rotate: 360,
                      transition: { duration: 0.6 }
                    }}
                    className="relative"
                  >
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-2xl opacity-50"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />
                    <motion.div 
                      className="relative w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(59, 130, 246, 0.5)',
                          '0 0 60px rgba(168, 85, 247, 0.8)',
                          '0 0 20px rgba(59, 130, 246, 0.5)',
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      >
                        <Chrome className="w-16 h-16 text-white" />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                  
                  {/* Rating Badge - BOUNCY */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0, y: 50 }}
                    whileInView={{ 
                      opacity: 1, 
                      scale: 1, 
                      y: 0,
                    }}
                    transition={{ 
                      delay: 0.5,
                      type: 'spring',
                      stiffness: 200,
                      damping: 10
                    }}
                    whileHover={{ 
                      scale: 1.1,
                      rotate: [0, -5, 5, -5, 0],
                      transition: { duration: 0.5 }
                    }}
                    className="mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full"
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    </motion.div>
                    <span className="text-sm font-semibold text-white">4.8/5.0</span>
                  </motion.div>
                </div>

                {/* Right: Content */}
                <div className="flex-1 text-center lg:text-left">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full mb-6">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-semibold text-blue-300">FREE CHROME EXTENSION</span>
                    </div>
                    
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
                      VERIFY AS YOU BROWSE
                    </h2>
                    
                    <p className="text-lg text-white/70 mb-8 leading-relaxed">
                      Install our powerful Chrome extension and verify content instantly while browsing. 
                      Auto-scan news articles, detect fake images, and get real-time alerts—all without leaving your page.
                    </p>

                    {/* Features List - STAGGERED EXPLOSIVE ENTRY */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                      {[
                        { icon: <Scan className="w-5 h-5" />, text: 'Auto-Scan Pages', color: 'blue' },
                        { icon: <Zap className="w-5 h-5" />, text: 'Instant Results', color: 'yellow' },
                        { icon: <Shield className="w-5 h-5" />, text: 'Privacy Protected', color: 'green' },
                        { icon: <Rocket className="w-5 h-5" />, text: 'Always Updated', color: 'purple' },
                      ].map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ 
                            opacity: 0, 
                            x: i % 2 === 0 ? -100 : 100,
                            scale: 0,
                            rotate: i % 2 === 0 ? -180 : 180
                          }}
                          whileInView={{ 
                            opacity: 1, 
                            x: 0,
                            scale: 1,
                            rotate: 0
                          }}
                          transition={{ 
                            delay: 0.6 + i * 0.15,
                            type: 'spring',
                            stiffness: 150,
                            damping: 15
                          }}
                          whileHover={{
                            scale: 1.05,
                            x: 10,
                            transition: { duration: 0.2 }
                          }}
                          className="flex items-center gap-3 text-white/80"
                        >
                          <motion.div 
                            className={`flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-${item.color}-400`}
                            whileHover={{
                              rotate: 360,
                              scale: 1.2,
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              transition: { duration: 0.5 }
                            }}
                            animate={{
                              y: [0, -5, 0],
                            }}
                            transition={{
                              duration: 2,
                              delay: i * 0.2,
                              repeat: Infinity,
                            }}
                          >
                            {item.icon}
                          </motion.div>
                          <motion.span 
                            className="font-medium"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 0.7 + i * 0.15 }}
                          >
                            {item.text}
                          </motion.span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Download Button */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={() => window.open('/chrome-extension', '_blank')}
                        className="group px-8 py-6 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full shadow-2xl shadow-blue-500/50 hover:shadow-purple-500/50 transition-all duration-300"
                      >
                        <span className="flex items-center gap-3">
                          <Download className="w-5 h-5" />
                          Download Extension
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </Button>
                    </motion.div>

                    <p className="text-sm text-white/50 mt-4">
                      Free • Works on Chrome, Edge & Brave • 500K+ Users
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section - MIND-BLOWING ANIMATIONS */}
      <section className="relative py-32 px-4">
        <motion.div
          style={{ y: y2 }}
          className="max-w-7xl mx-auto"
        >
          {/* Section Header - EXPLOSIVE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              type: 'spring',
              stiffness: 100
            }}
            className="text-center mb-20"
          >
            <motion.h2 
              className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-6"
              animate={{
                backgroundPosition: ['0%', '100%', '0%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
              }}
              style={{
                backgroundImage: 'linear-gradient(90deg, #fff, #3b82f6, #8b5cf6, #fff)',
                backgroundSize: '200% auto',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              POWERFUL FEATURES
            </motion.h2>
            <motion.p 
              className="text-xl text-white/70 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Everything you need to combat misinformation and verify content authenticity
            </motion.p>
          </motion.div>

          {/* Features Grid - CRAZY STAGGERED ENTRY */}
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ 
                  opacity: 0, 
                  scale: 0.3,
                  rotateY: index % 2 === 0 ? -90 : 90,
                  x: index % 2 === 0 ? -200 : 200,
                }}
                whileInView={{ 
                  opacity: 1, 
                  scale: 1,
                  rotateY: 0,
                  x: 0,
                }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ 
                  duration: 0.8,
                  delay: index * 0.2,
                  type: 'spring',
                  stiffness: 80,
                  damping: 15
                }}
                whileHover={{ 
                  scale: 1.05,
                  y: -20,
                  rotateZ: index % 2 === 0 ? 2 : -2,
                  transition: { duration: 0.3 }
                }}
                className="relative group cursor-pointer perspective-1000"
              >
                <motion.div 
                  className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 overflow-hidden"
                  whileHover={{
                    borderColor: 'rgba(255,255,255,0.3)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                  }}
                >
                  {/* Animated gradient background - PULSING */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient}`}
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 0.15 }}
                    animate={{
                      opacity: [0, 0.05, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                    }}
                  />

                  {/* Sparkle particles */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                      transition={{
                        duration: 2,
                        delay: index * 0.2 + i * 0.1,
                        repeat: Infinity,
                      }}
                    />
                  ))}

                  {/* Icon - BOUNCING */}
                  <motion.div 
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 text-white`}
                    initial={{ scale: 0, rotate: -180, y: 0 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: index * 0.2 + 0.3,
                      type: 'spring',
                      stiffness: 200,
                      damping: 15
                    }}
                    whileHover={{
                      scale: 1.2,
                      rotate: 360,
                      transition: { duration: 0.5 }
                    }}
                  >
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{
                        duration: 2,
                        delay: index * 0.3,
                        repeat: Infinity,
                      }}
                    >
                      {feature.icon}
                    </motion.div>
                  </motion.div>

                  {/* Content */}
                  <motion.h3 
                    className="text-2xl font-bold text-white mb-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 + 0.4 }}
                  >
                    {feature.title}
                  </motion.h3>
                  <motion.p 
                    className="text-white/60 leading-relaxed"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: index * 0.2 + 0.5 }}
                  >
                    {feature.description}
                  </motion.p>

                  {/* Arrow - SLIDING */}
                  <motion.div
                    className="absolute bottom-6 right-6"
                    initial={{ opacity: 0, x: -20 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-6 h-6 text-white" />
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Capabilities Section - ULTIMATE CRAZY ANIMATIONS */}
      <section className="relative py-32 px-4">
        <motion.div
          style={{ y: y3 }}
          className="max-w-7xl mx-auto"
        >
          {/* Section Header - ZOOM IN */}
          <motion.div
            initial={{ opacity: 0, scale: 0, rotateZ: -180 }}
            whileInView={{ opacity: 1, scale: 1, rotateZ: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 1,
              type: 'spring',
              stiffness: 80
            }}
            className="text-center mb-20"
          >
            <motion.h2 
              className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-6"
              animate={{
                textShadow: [
                  '0 0 20px rgba(59, 130, 246, 0.5)',
                  '0 0 40px rgba(168, 85, 247, 0.8)',
                  '0 0 20px rgba(59, 130, 246, 0.5)',
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            >
              VERIFY EVERYTHING
            </motion.h2>
            <motion.p 
              className="text-xl text-white/70 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Multi-modal AI detection across all types of content
            </motion.p>
          </motion.div>

          {/* Capabilities Grid - EXPLOSIVE CIRCULAR ENTRY */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map((capability, index) => {
              const angle = (index * 90) * (Math.PI / 180);
              const radius = 300;
              return (
                <motion.div
                  key={index}
                  initial={{ 
                    opacity: 0, 
                    scale: 0,
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius,
                    rotate: 360,
                  }}
                  whileInView={{ 
                    opacity: 1, 
                    scale: 1,
                    x: 0,
                    y: 0,
                    rotate: 0,
                  }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ 
                    duration: 0.8,
                    delay: index * 0.15,
                    type: 'spring',
                    stiffness: 100,
                    damping: 15
                  }}
                  whileHover={{ 
                    scale: 1.15,
                    rotateY: 15,
                    z: 50,
                    transition: { duration: 0.3 }
                  }}
                  style={{ transformStyle: 'preserve-3d' }}
                  className="relative group perspective-1000"
                >
                  <motion.div 
                    className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center overflow-hidden"
                    whileHover={{
                      boxShadow: '0 0 60px rgba(59, 130, 246, 0.4)',
                      borderColor: 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {/* Rotating gradient background */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br from-${capability.color}-500/20 to-transparent`}
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                    />

                    {/* Orbiting particles */}
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white rounded-full"
                        style={{
                          left: '50%',
                          top: '50%',
                        }}
                        animate={{
                          x: [
                            Math.cos((i * 90 + 0) * Math.PI / 180) * 40,
                            Math.cos((i * 90 + 90) * Math.PI / 180) * 40,
                            Math.cos((i * 90 + 180) * Math.PI / 180) * 40,
                            Math.cos((i * 90 + 270) * Math.PI / 180) * 40,
                            Math.cos((i * 90 + 360) * Math.PI / 180) * 40,
                          ],
                          y: [
                            Math.sin((i * 90 + 0) * Math.PI / 180) * 40,
                            Math.sin((i * 90 + 90) * Math.PI / 180) * 40,
                            Math.sin((i * 90 + 180) * Math.PI / 180) * 40,
                            Math.sin((i * 90 + 270) * Math.PI / 180) * 40,
                            Math.sin((i * 90 + 360) * Math.PI / 180) * 40,
                          ],
                          opacity: [0.3, 0.8, 0.3],
                        }}
                        transition={{
                          duration: 3,
                          delay: i * 0.2,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                    ))}

                    {/* Icon - MEGA BOUNCING */}
                    <motion.div
                      className={`relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-${capability.color}-500/20 mb-6 text-${capability.color}-400`}
                      initial={{ scale: 0, rotate: -360 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{
                        delay: index * 0.15 + 0.3,
                        type: 'spring',
                        stiffness: 300,
                        damping: 10
                      }}
                      whileHover={{ 
                        rotate: 360,
                        scale: 1.3,
                        transition: { duration: 0.5 }
                      }}
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                          duration: 2,
                          delay: index * 0.3,
                          repeat: Infinity,
                        }}
                      >
                        {capability.icon}
                      </motion.div>
                    </motion.div>

                    {/* Content - FADE IN */}
                    <motion.h3 
                      className="text-xl font-bold text-white mb-3"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.15 + 0.4 }}
                    >
                      {capability.title}
                    </motion.h3>
                    <motion.p 
                      className="text-sm text-white/60 leading-relaxed"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: index * 0.15 + 0.5 }}
                    >
                      {capability.description}
                    </motion.p>

                    {/* Pulse effect on hover */}
                    <motion.div
                      className="absolute inset-0 rounded-3xl"
                      initial={{ opacity: 0 }}
                      whileHover={{
                        opacity: [0, 0.3, 0],
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                      }}
                      style={{
                        background: `radial-gradient(circle, var(--${capability.color}-500), transparent)`,
                      }}
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-white/20 rounded-3xl p-16 text-center overflow-hidden">
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 10, repeat: Infinity }}
            />

            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6">
                READY TO START?
              </h2>
              <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
                Join millions fighting misinformation. Start verifying content today.
              </p>
              <Button
                onClick={onAnalyzeClick}
                className="group px-10 py-7 text-xl font-bold bg-white text-black hover:bg-white/90 rounded-full shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center gap-3">
                  Get Started Now
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </span>
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer Section */}
      <section className="relative py-16 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="text-white/60 text-sm">
              © 2025 VeriFy AI. Fighting misinformation globally.
            </div>
            <div className="flex gap-6 text-white/60 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
