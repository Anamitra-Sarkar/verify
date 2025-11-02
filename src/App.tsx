import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HeaderWithSettings } from './components/HeaderWithSettings';
import { ScrollingHomePage } from './components/ScrollingHomePage';
import { AnalyzePageWithDragDrop } from './components/AnalyzePageWithDragDrop';
import { TrendingPage } from './components/TrendingPage';
import { CommunityPage } from './components/CommunityPage';
import { AboutPage } from './components/AboutPage';
import { SettingsPage } from './components/SettingsPage';
import { ProfilePage } from './components/ProfilePage';
import { LoginDialog } from './components/LoginDialogFirebase';
import { Footer } from './components/Footer';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { useAuth } from './context/AuthContext';
import { 
  PrivacyPolicyPage, 
  TermsOfServicePage, 
  CookiePolicyPage, 
  ContactUsPage,
  FeaturesPage,
  HelpCenterPage
} from './components/pages';

type Page = 'Home' | 'Analyze' | 'Trending' | 'Community' | 'About' | 'Profile' | 'Settings' | 
  'Privacy' | 'Terms' | 'Cookies' | 'Contact' | 'Features' | 'Help';

export default function App() {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('Home');
  const [language, setLanguage] = useState('en');
  const [isDark, setIsDark] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Initialize theme from system preference or localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleThemeToggle = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.info('You have been logged out');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const pageTransition = {
    duration: 0.3,
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-500 relative overflow-hidden">
      {/* Animated background particles - only show on non-home pages */}
      {currentPage !== 'Home' && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-blue-400/30 dark:bg-blue-400/20 rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                }}
                animate={{
                  x: [
                    Math.random() * window.innerWidth,
                    Math.random() * window.innerWidth,
                    Math.random() * window.innerWidth,
                  ],
                  y: [
                    Math.random() * window.innerHeight,
                    Math.random() * window.innerHeight,
                    Math.random() * window.innerHeight,
                  ],
                }}
                transition={{
                  duration: Math.random() * 20 + 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
          
          {/* Animated gradient orbs */}
          <motion.div
            className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-400/10 dark:to-purple-400/10 blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          <motion.div
            className="absolute bottom-0 right-0 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 dark:from-purple-400/10 dark:to-pink-400/10 blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, -50, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          <motion.div
            className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-cyan-400/15 to-blue-400/15 dark:from-cyan-400/8 dark:to-blue-400/8 blur-3xl -translate-x-1/2 -translate-y-1/2"
            animate={{
              scale: [1, 1.5, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      )}
      
      <div className="relative z-10">
        <HeaderWithSettings
          currentPage={currentPage}
          onNavigate={(page: string) => handleNavigate(page as Page)}
          language={language}
          onLanguageChange={setLanguage}
          isDark={isDark}
          onThemeToggle={handleThemeToggle}
          user={user}
          onLogout={handleLogout}
          onLoginClick={() => setShowLoginDialog(true)}
        />

      <AnimatePresence mode="wait">
        {currentPage === 'Home' && (
          <motion.div
            key="home"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <ScrollingHomePage 
              onAnalyzeClick={() => handleNavigate('Analyze')}
              language={language}
            />
          </motion.div>
        )}

        {currentPage === 'Analyze' && (
          <motion.div
            key="analyze"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <AnalyzePageWithDragDrop language={language} />
          </motion.div>
        )}

        {currentPage === 'Trending' && (
          <motion.div
            key="trending"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <TrendingPage language={language} />
          </motion.div>
        )}

        {currentPage === 'Community' && (
          <motion.div
            key="community"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <CommunityPage language={language} />
          </motion.div>
        )}

        {currentPage === 'Settings' && (
          <motion.div
            key="settings"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            {user ? (
              <SettingsPage 
                user={user} 
                onThemeToggle={handleThemeToggle}
                onLanguageChange={setLanguage}
                isDark={isDark}
                currentLanguage={language}
              />
            ) : (
              <div className="min-h-screen pt-28 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Please log in to access settings</h3>
                  <button
                    onClick={() => setShowLoginDialog(true)}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    Login
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {currentPage === 'About' && (
          <motion.div
            key="about"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <AboutPage language={language} />
          </motion.div>
        )}

        {currentPage === 'Profile' && (
          <motion.div
            key="profile"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            {user ? (
              <ProfilePage user={user} />
            ) : (
              <div className="min-h-screen pt-28 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="mb-4">Please log in to view your profile</h3>
                  <button
                    onClick={() => setShowLoginDialog(true)}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                  >
                    Login
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {currentPage === 'Privacy' && (
          <motion.div
            key="privacy"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <PrivacyPolicyPage />
          </motion.div>
        )}

        {currentPage === 'Terms' && (
          <motion.div
            key="terms"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <TermsOfServicePage />
          </motion.div>
        )}

        {currentPage === 'Cookies' && (
          <motion.div
            key="cookies"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <CookiePolicyPage />
          </motion.div>
        )}

        {currentPage === 'Contact' && (
          <motion.div
            key="contact"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <ContactUsPage />
          </motion.div>
        )}

        {currentPage === 'Features' && (
          <motion.div
            key="features"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <FeaturesPage />
          </motion.div>
        )}

        {currentPage === 'Help' && (
          <motion.div
            key="help"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <HelpCenterPage />
          </motion.div>
        )}

      </AnimatePresence>
      </div>

      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
      />

      {/* Footer */}
      <Footer language={language} onNavigate={(page: string) => handleNavigate(page as Page)} />

      <Toaster />
    </div>
  );
}
