import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Settings, LogOut, Camera, Plus, 
  Shield, HelpCircle, ChevronRight, ExternalLink,
  Bell, Lock, Globe, Palette
} from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface GoogleProfileMenuProps {
  user: any;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onClose: () => void;
  onThemeToggle?: () => void;
  onLanguageChange?: (lang: string) => void;
  isDark?: boolean;
}

// Generate gradient avatar based on user ID
const generateAvatarGradient = (userId: string) => {
  const colors = [
    'from-blue-400 via-blue-500 to-blue-600',
    'from-green-400 via-green-500 to-green-600',
    'from-orange-400 via-orange-500 to-orange-600',
    'from-pink-400 via-pink-500 to-pink-600',
    'from-indigo-400 via-indigo-500 to-indigo-600',
    'from-yellow-400 via-yellow-500 to-yellow-600',
    'from-purple-400 via-purple-500 to-purple-600',
    'from-red-400 via-red-500 to-red-600',
  ];
  const index = userId ? userId.charCodeAt(0) % colors.length : 0;
  return colors[index];
};

// Get user initials
const getUserInitials = (user: any) => {
  if (!user) return 'U';
  const name = user.displayName || user.name || user.email || 'User';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export function GoogleProfileMenu({ user, onNavigate, onLogout, onClose, onThemeToggle, onLanguageChange, isDark }: GoogleProfileMenuProps) {
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);

  const gradient = generateAvatarGradient(user?.uid || user?.id || user?.email || 'default');
  const userName = user?.displayName || user?.name || 'User';
  const userEmail = user?.email || 'user@example.com';

  const handleAddAccount = () => {
    setShowAddAccount(true);
    // In a real app, this would open Google account picker
    alert('Add Account feature:\n\nIn production, this would:\n- Open Google account picker\n- Allow switching between accounts\n- Support multiple user sessions');
    setShowAddAccount(false);
  };

  const handleManageAccount = () => {
    onNavigate('Profile');
    onClose();
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const avatarData = {
          type: 'image',
          url: reader.result as string,
        };
        localStorage.setItem(`avatar_${user.uid || user.id || user.email}`, JSON.stringify(avatarData));
        window.location.reload(); // Refresh to show new avatar
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ duration: 0.2 }}
      className="fixed top-20 right-4 z-[100] w-[90vw] max-w-md max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Header with Avatar */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-8 py-8">
        {/* Email Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full border border-gray-200 dark:border-gray-700 text-sm font-medium">
            {userEmail}
          </div>
        </motion.div>

        {/* Avatar */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="relative mx-auto w-24 h-24 mb-4"
          onHoverStart={() => setShowAvatarUpload(true)}
          onHoverEnd={() => setShowAvatarUpload(false)}
        >
          <div className={`w-full h-full rounded-full bg-gradient-to-br ${gradient} p-1 shadow-2xl`}>
            <Avatar className="w-full h-full border-4 border-white dark:border-gray-900">
              {user?.photoURL ? (
                <AvatarImage src={user.photoURL} alt={userName} />
              ) : (
                <AvatarFallback className={`bg-gradient-to-br ${gradient} text-white text-2xl font-bold`}>
                  {getUserInitials(user)}
                </AvatarFallback>
              )}
            </Avatar>
          </div>

          {/* Camera Icon Overlay */}
          <AnimatePresence>
            {showAvatarUpload && (
              <motion.label
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer"
              >
                <Camera className="w-8 h-8 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </motion.label>
            )}
          </AnimatePresence>
        </motion.div>

        {/* User Name */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2"
        >
          Hi, {userName.split(' ')[0]}!
        </motion.h2>

        {/* Manage Account Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center"
        >
          <Button
            onClick={handleManageAccount}
            className="rounded-full px-6 py-2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 backdrop-blur-xl transition-all shadow-sm hover:shadow-md"
          >
            Manage your Account
          </Button>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddAccount}
            className="flex-1 flex flex-col items-center gap-2 px-4 py-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
              <Plus className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add account</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="flex-1 flex flex-col items-center gap-2 px-4 py-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
              <LogOut className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sign out</span>
          </motion.button>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        <MenuItem
          icon={<User className="w-5 h-5" />}
          label="Profile"
          description="View and edit your profile"
          onClick={() => {
            onNavigate('Profile');
            onClose();
          }}
        />
        <MenuItem
          icon={<Settings className="w-5 h-5" />}
          label="Settings"
          description="Manage app preferences"
          onClick={() => {
            onNavigate('Settings');
            onClose();
          }}
        />
        <MenuItem
          icon={<Bell className="w-5 h-5" />}
          label="Notifications"
          description="Manage your alerts"
          onClick={() => {
            alert('Notifications Settings:\n\n✅ Fake news alerts\n✅ Community updates\n✅ Trending topics\n✅ Security notifications\n\nGo to Settings to configure.');
            onNavigate('Settings');
            onClose();
          }}
        />
        <MenuItem
          icon={<Shield className="w-5 h-5" />}
          label="Privacy & Security"
          description="Control your data and security"
          onClick={() => {
            alert('Privacy & Security:\n\n🔒 Two-factor authentication\n🛡️ Login history\n📊 Data export\n🔐 Password change\n🗑️ Delete account\n\nGo to Settings for full options.');
            onNavigate('Settings');
            onClose();
          }}
        />
        <MenuItem
          icon={<Palette className="w-5 h-5" />}
          label="Appearance"
          description="Customize your theme"
          onClick={() => {
            if (onThemeToggle) {
              onThemeToggle();
              const newTheme = !isDark ? 'Dark' : 'Light';
              alert(`Theme changed to ${newTheme} mode! 🎨\n\nYou can also:\n- Auto theme (system)\n- Custom colors\n- Font size\n- Compact mode\n\nVisit Settings for more options.`);
            }
          }}
        />
        <MenuItem
          icon={<Globe className="w-5 h-5" />}
          label="Language"
          description="Change your language"
          onClick={() => {
            const languages = ['English', 'हिंदी (Hindi)', 'বাংলা (Bengali)', 'தமிழ் (Tamil)', 'मराठी (Marathi)', 'తెలుగు (Telugu)'];
            alert(`Available Languages:\n\n${languages.join('\n')}\n\nGo to Settings to change language.`);
            onNavigate('Settings');
            onClose();
          }}
        />
      </div>

      {/* Footer Links */}
      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-600 dark:text-gray-400">
          <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Privacy policy
          </a>
          <span>•</span>
          <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Terms of Service
          </a>
        </div>
      </div>
    </motion.div>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
}

function MenuItem({ icon, label, description, onClick }: MenuItemProps) {
  return (
    <motion.button
      whileHover={{ x: 4 }}
      onClick={onClick}
      className="w-full flex items-center gap-4 px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
    >
      <div className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {icon}
      </div>
      <div className="flex-1 text-left">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </div>
        {description && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {description}
          </div>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  );
}
