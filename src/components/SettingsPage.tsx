import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, Save, Upload, Trash2, Shield, Mail, Calendar,
  Bell, Lock, Palette, Globe, Eye,
  Smartphone, Monitor, Sun, Moon, Laptop, Check,
  Volume2, MessageSquare, TrendingUp, Users, Key,
  Download, Database, AlertCircle, LogOut as LogOutIcon
} from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const AVATAR_PRESETS = [
  { id: 1, emoji: '😊', label: 'Happy' },
  { id: 2, emoji: '😎', label: 'Cool' },
  { id: 3, emoji: '🤓', label: 'Nerdy' },
  { id: 4, emoji: '🥳', label: 'Party' },
  { id: 5, emoji: '🤖', label: 'Robot' },
  { id: 6, emoji: '👨‍💻', label: 'Developer' },
  { id: 7, emoji: '👩‍🔬', label: 'Scientist' },
  { id: 8, emoji: '🦸', label: 'Hero' },
  { id: 9, emoji: '🧙', label: 'Wizard' },
  { id: 10, emoji: '🐱', label: 'Cat' },
  { id: 11, emoji: '🐶', label: 'Dog' },
  { id: 12, emoji: '🦊', label: 'Fox' },
  { id: 13, emoji: '🐼', label: 'Panda' },
  { id: 14, emoji: '🦁', label: 'Lion' },
  { id: 15, emoji: '🐺', label: 'Wolf' },
  { id: 16, emoji: '🦄', label: 'Unicorn' },
];

const GRADIENT_COLORS = [
  { id: 1, name: 'Ocean', colors: ['#6366f1', '#8b5cf6'] },
  { id: 2, name: 'Sunset', colors: ['#f97316', '#ec4899'] },
  { id: 3, name: 'Forest', colors: ['#10b981', '#14b8a6'] },
  { id: 4, name: 'Fire', colors: ['#ef4444', '#f59e0b'] },
  { id: 5, name: 'Sky', colors: ['#3b82f6', '#06b6d4'] },
  { id: 6, name: 'Purple', colors: ['#8b5cf6', '#d946ef'] },
  { id: 7, name: 'Rose', colors: ['#e11d48', '#f472b6'] },
  { id: 8, name: 'Emerald', colors: ['#059669', '#10b981'] },
];

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
];

interface SettingsPageProps {
  user: any;
  onThemeToggle?: () => void;
  onLanguageChange?: (lang: string) => void;
  isDark?: boolean;
  currentLanguage?: string;
}

export function SettingsPage({ 
  user: propUser, 
  onThemeToggle,
  onLanguageChange,
  isDark = false,
  currentLanguage = 'en'
}: SettingsPageProps) {
  const { user: authUser } = useAuth();
  const user = propUser || authUser;
  
  // Avatar settings
  const [customImage, setCustomImage] = useState<string | null>(
    user ? localStorage.getItem(`user_avatar_${user.uid}`) : null
  );
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(
    user ? localStorage.getItem(`user_avatar_emoji_${user.uid}`) : null
  );
  const [selectedGradient, setSelectedGradient] = useState<number>(
    user ? parseInt(localStorage.getItem(`user_avatar_gradient_${user.uid}`) || '1') : 1
  );
  const [avatarType, setAvatarType] = useState<'image' | 'emoji' | 'gradient'>(
    user ? (localStorage.getItem(`user_avatar_type_${user.uid}`) as any) || 'gradient' : 'gradient'
  );

  // Active section
  const [activeSection, setActiveSection] = useState<'profile' | 'notifications' | 'privacy' | 'appearance' | 'language'>('profile');

  // Notification settings
  const [notifications, setNotifications] = useState({
    fakeNewsAlerts: JSON.parse(localStorage.getItem('notif_fakeNews') || 'true'),
    communityUpdates: JSON.parse(localStorage.getItem('notif_community') || 'true'),
    trendingTopics: JSON.parse(localStorage.getItem('notif_trending') || 'true'),
    securityNotifications: JSON.parse(localStorage.getItem('notif_security') || 'true'),
    emailNotifications: JSON.parse(localStorage.getItem('notif_email') || 'false'),
    soundEnabled: JSON.parse(localStorage.getItem('notif_sound') || 'true'),
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    twoFactorAuth: JSON.parse(localStorage.getItem('privacy_2fa') || 'false'),
    showProfile: JSON.parse(localStorage.getItem('privacy_showProfile') || 'true'),
    showActivity: JSON.parse(localStorage.getItem('privacy_showActivity') || 'true'),
    dataCollection: JSON.parse(localStorage.getItem('privacy_dataCollection') || 'true'),
  });

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: localStorage.getItem('theme') || 'system',
    fontSize: localStorage.getItem('fontSize') || 'medium',
    compactMode: JSON.parse(localStorage.getItem('compactMode') || 'false'),
    animations: JSON.parse(localStorage.getItem('animations') || 'true'),
  });

  // Language setting
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">Please Log In</h2>
          <p className="text-gray-600 dark:text-gray-400">
            You need to be logged in to access settings
          </p>
        </div>
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setCustomImage(imageData);
      setAvatarType('image');
      toast.success('Image uploaded successfully');
    };
    reader.readAsDataURL(file);
  };

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    setAvatarType('emoji');
  };

  const handleGradientSelect = (id: number) => {
    setSelectedGradient(id);
    setAvatarType('gradient');
  };

  const handleSave = () => {
    if (!user) return;

    localStorage.setItem(`user_avatar_type_${user.uid}`, avatarType);

    if (avatarType === 'image' && customImage) {
      localStorage.setItem(`user_avatar_${user.uid}`, customImage);
    } else {
      localStorage.removeItem(`user_avatar_${user.uid}`);
    }

    if (avatarType === 'emoji' && selectedEmoji) {
      localStorage.setItem(`user_avatar_emoji_${user.uid}`, selectedEmoji);
    } else {
      localStorage.removeItem(`user_avatar_emoji_${user.uid}`);
    }

    if (avatarType === 'gradient') {
      localStorage.setItem(`user_avatar_gradient_${user.uid}`, selectedGradient.toString());
    }

    toast.success('Avatar settings saved! Refresh to see changes.');
    
    // Trigger a custom event to update the header
    window.dispatchEvent(new Event('avatarUpdated'));
  };

  const handleRemoveImage = () => {
    setCustomImage(null);
    setAvatarType('gradient');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getPreviewAvatar = () => {
    if (avatarType === 'image' && customImage) {
      return (
        <img
          src={customImage}
          alt="Avatar Preview"
          className="w-full h-full object-cover"
        />
      );
    }

    if (avatarType === 'emoji' && selectedEmoji) {
      return (
        <div className="w-full h-full flex items-center justify-center text-6xl">
          {selectedEmoji}
        </div>
      );
    }

    // Gradient avatar
    const gradient = GRADIENT_COLORS.find(g => g.id === selectedGradient) || GRADIENT_COLORS[0];
    const initials = user.displayName
      ? user.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
      : user.email?.slice(0, 2).toUpperCase();

    return (
      <div
        className="w-full h-full flex items-center justify-center text-4xl font-bold text-white"
        style={{
          background: `linear-gradient(135deg, ${gradient.colors[0]}, ${gradient.colors[1]})`
        }}
      >
        {initials}
      </div>
    );
  };

  // Save notification settings
  const saveNotificationSettings = () => {
    Object.entries(notifications).forEach(([key, value]) => {
      localStorage.setItem(`notif_${key}`, JSON.stringify(value));
    });
    toast.success('Notification settings saved!');
  };

  // Save privacy settings
  const savePrivacySettings = () => {
    Object.entries(privacy).forEach(([key, value]) => {
      localStorage.setItem(`privacy_${key}`, JSON.stringify(value));
    });
    toast.success('Privacy settings saved!');
  };

  // Save appearance settings
  const saveAppearanceSettings = () => {
    localStorage.setItem('theme', appearance.theme);
    localStorage.setItem('fontSize', appearance.fontSize);
    localStorage.setItem('compactMode', JSON.stringify(appearance.compactMode));
    localStorage.setItem('animations', JSON.stringify(appearance.animations));
    
    // Apply theme change
    if (appearance.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (appearance.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    toast.success('Appearance settings saved!');
  };

  // Save language setting
  const saveLanguageSettings = () => {
    localStorage.setItem('language', selectedLanguage);
    if (onLanguageChange) {
      onLanguageChange(selectedLanguage);
    }
    toast.success(`Language changed to ${LANGUAGES.find(l => l.code === selectedLanguage)?.name}!`);
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-display font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Settings
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Manage your account, preferences, and privacy
          </p>
        </motion.div>

        {/* Settings Navigation */}
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          <motion.button
            onClick={() => setActiveSection('profile')}
            className={`glass-card p-6 text-left transition-all ${
              activeSection === 'profile' 
                ? 'ring-2 ring-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Camera className="w-8 h-8 mb-2 text-blue-600" />
            <h3 className="font-bold text-lg mb-1">Profile</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avatar & account info</p>
          </motion.button>

          <motion.button
            onClick={() => setActiveSection('notifications')}
            className={`glass-card p-6 text-left transition-all ${
              activeSection === 'notifications' 
                ? 'ring-2 ring-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Bell className="w-8 h-8 mb-2 text-purple-600" />
            <h3 className="font-bold text-lg mb-1">Notifications</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Alerts & updates</p>
          </motion.button>

          <motion.button
            onClick={() => setActiveSection('privacy')}
            className={`glass-card p-6 text-left transition-all ${
              activeSection === 'privacy' 
                ? 'ring-2 ring-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Lock className="w-8 h-8 mb-2 text-green-600" />
            <h3 className="font-bold text-lg mb-1">Privacy & Security</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Data & authentication</p>
          </motion.button>

          <motion.button
            onClick={() => setActiveSection('appearance')}
            className={`glass-card p-6 text-left transition-all ${
              activeSection === 'appearance' 
                ? 'ring-2 ring-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Palette className="w-8 h-8 mb-2 text-pink-600" />
            <h3 className="font-bold text-lg mb-1">Appearance</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Theme & display</p>
          </motion.button>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 mb-8">
          <motion.button
            onClick={() => setActiveSection('language')}
            className={`glass-card p-6 text-left transition-all ${
              activeSection === 'language' 
                ? 'ring-2 ring-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Globe className="w-8 h-8 mb-2 text-orange-600" />
            <h3 className="font-bold text-lg mb-1">Language</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Change language</p>
          </motion.button>
        </div>

        {/* Settings Content */}
        <AnimatePresence mode="wait">
          {/* PROFILE SECTION */}
          {activeSection === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid lg:grid-cols-3 gap-6"
            >
              {/* Profile Info Sidebar */}
              <div className="lg:col-span-1">
                <div className="glass-card p-6 sticky top-32">
                  <div className="text-center">
                    {/* Avatar Preview */}
                    <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 shadow-2xl ring-4 ring-gray-200 dark:ring-gray-700">
                      {getPreviewAvatar()}
                    </div>

                    <h3 className="text-xl font-bold mb-1">
                      {user.displayName || 'User'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 break-all">
                      {user.email}
                    </p>

                    {/* Account Info */}
                    <div className="space-y-3 text-sm text-left border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Email:</span>
                        <span className={user.emailVerified ? 'text-green-600' : 'text-yellow-600'}>
                          {user.emailVerified ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Member since:</span>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">User ID:</span>
                        <span className="text-xs truncate">{user.uid.slice(0, 8)}...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Avatar Customization */}
              <div className="lg:col-span-2 space-y-6">
                {/* Upload Custom Image */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card p-6"
                >
                  <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <Camera className="w-6 h-6 mr-2" />
                    Custom Image
                  </h2>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  <div className="space-y-4">
                    {customImage ? (
                      <div className="relative">
                        <img
                          src={customImage}
                          alt="Custom Avatar"
                          className="w-32 h-32 rounded-full object-cover mx-auto shadow-lg"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveImage}
                          className="absolute top-0 right-1/2 translate-x-16"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="w-full py-8"
                      >
                        <Upload className="w-6 h-6 mr-2" />
                        Upload Custom Image (Max 5MB)
                      </Button>
                    )}
                  </div>
                </motion.div>

                {/* Emoji Avatars */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card p-6"
                >
                  <h2 className="text-2xl font-bold mb-4">Emoji Avatars</h2>
                  <div className="grid grid-cols-8 gap-2">
                    {AVATAR_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handleEmojiSelect(preset.emoji)}
                        className={`aspect-square rounded-lg text-3xl hover:scale-110 transition-transform ${
                          avatarType === 'emoji' && selectedEmoji === preset.emoji
                            ? 'ring-4 ring-blue-600 bg-blue-50 dark:bg-blue-900/20'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        title={preset.label}
                      >
                        {preset.emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* Gradient Avatars */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card p-6"
                >
                  <h2 className="text-2xl font-bold mb-4">Gradient Backgrounds</h2>
                  <div className="grid grid-cols-4 gap-4">
                    {GRADIENT_COLORS.map((gradient) => (
                      <button
                        key={gradient.id}
                        onClick={() => handleGradientSelect(gradient.id)}
                        className={`aspect-square rounded-xl transition-transform hover:scale-105 ${
                          avatarType === 'gradient' && selectedGradient === gradient.id
                            ? 'ring-4 ring-blue-600'
                            : ''
                        }`}
                        style={{
                          background: `linear-gradient(135deg, ${gradient.colors[0]}, ${gradient.colors[1]})`
                        }}
                        title={gradient.name}
                      >
                        <span className="text-white font-bold text-sm">{gradient.name}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* Save Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    onClick={handleSave}
                    className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Save Avatar Settings
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* NOTIFICATIONS SECTION */}
          {activeSection === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="glass-card p-8">
                <div className="flex items-center mb-6">
                  <Bell className="w-8 h-8 mr-3 text-purple-600" />
                  <div>
                    <h2 className="text-3xl font-bold">Notification Preferences</h2>
                    <p className="text-gray-600 dark:text-gray-400">Control what alerts you receive</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Fake News Alerts */}
                  <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex items-center gap-4">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                      <div>
                        <h3 className="font-semibold text-lg">Fake News Alerts</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when suspicious content is detected</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, fakeNewsAlerts: !notifications.fakeNewsAlerts })}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        notifications.fakeNewsAlerts ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <motion.div
                        className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full"
                        animate={{ x: notifications.fakeNewsAlerts ? 28 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>

                  {/* Community Updates */}
                  <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex items-center gap-4">
                      <Users className="w-6 h-6 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-lg">Community Updates</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Stay updated with community posts and discussions</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, communityUpdates: !notifications.communityUpdates })}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        notifications.communityUpdates ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <motion.div
                        className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full"
                        animate={{ x: notifications.communityUpdates ? 28 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>

                  {/* Trending Topics */}
                  <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex items-center gap-4">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-lg">Trending Topics</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Get alerts about viral stories and trending news</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, trendingTopics: !notifications.trendingTopics })}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        notifications.trendingTopics ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <motion.div
                        className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full"
                        animate={{ x: notifications.trendingTopics ? 28 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>

                  {/* Security Notifications */}
                  <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex items-center gap-4">
                      <Shield className="w-6 h-6 text-orange-600" />
                      <div>
                        <h3 className="font-semibold text-lg">Security Notifications</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Important security alerts and login notifications</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, securityNotifications: !notifications.securityNotifications })}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        notifications.securityNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <motion.div
                        className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full"
                        animate={{ x: notifications.securityNotifications ? 28 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>

                  {/* Email Notifications */}
                  <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex items-center gap-4">
                      <Mail className="w-6 h-6 text-purple-600" />
                      <div>
                        <h3 className="font-semibold text-lg">Email Notifications</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via email</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, emailNotifications: !notifications.emailNotifications })}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        notifications.emailNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <motion.div
                        className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full"
                        animate={{ x: notifications.emailNotifications ? 28 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>

                  {/* Sound Enabled */}
                  <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex items-center gap-4">
                      <Volume2 className="w-6 h-6 text-pink-600" />
                      <div>
                        <h3 className="font-semibold text-lg">Notification Sounds</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Play sound when receiving notifications</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, soundEnabled: !notifications.soundEnabled })}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        notifications.soundEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <motion.div
                        className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full"
                        animate={{ x: notifications.soundEnabled ? 28 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
                </div>

                <Button
                  onClick={saveNotificationSettings}
                  className="w-full mt-8 py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Notification Settings
                </Button>
              </div>
            </motion.div>
          )}

          {/* PRIVACY & SECURITY SECTION */}
          {activeSection === 'privacy' && (
            <motion.div
              key="privacy"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="glass-card p-8">
                <div className="flex items-center mb-6">
                  <Lock className="w-8 h-8 mr-3 text-green-600" />
                  <div>
                    <h2 className="text-3xl font-bold">Privacy & Security</h2>
                    <p className="text-gray-600 dark:text-gray-400">Protect your account and data</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Two-Factor Authentication */}
                  <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex items-center gap-4">
                      <Key className="w-6 h-6 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-lg">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security to your account</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setPrivacy({ ...privacy, twoFactorAuth: !privacy.twoFactorAuth });
                        if (!privacy.twoFactorAuth) {
                          toast.success('Two-Factor Authentication enabled! 🔐');
                        } else {
                          toast.info('Two-Factor Authentication disabled');
                        }
                      }}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        privacy.twoFactorAuth ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <motion.div
                        className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full"
                        animate={{ x: privacy.twoFactorAuth ? 28 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>

                  {/* Show Profile */}
                  <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex items-center gap-4">
                      <Eye className="w-6 h-6 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-lg">Public Profile</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Make your profile visible to other users</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPrivacy({ ...privacy, showProfile: !privacy.showProfile })}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        privacy.showProfile ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <motion.div
                        className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full"
                        animate={{ x: privacy.showProfile ? 28 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>

                  {/* Show Activity */}
                  <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex items-center gap-4">
                      <MessageSquare className="w-6 h-6 text-purple-600" />
                      <div>
                        <h3 className="font-semibold text-lg">Activity Status</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Show when you're active on the platform</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPrivacy({ ...privacy, showActivity: !privacy.showActivity })}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        privacy.showActivity ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <motion.div
                        className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full"
                        animate={{ x: privacy.showActivity ? 28 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>

                  {/* Data Collection */}
                  <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex items-center gap-4">
                      <Database className="w-6 h-6 text-orange-600" />
                      <div>
                        <h3 className="font-semibold text-lg">Analytics & Data Collection</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Allow collection of usage data to improve services</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPrivacy({ ...privacy, dataCollection: !privacy.dataCollection })}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        privacy.dataCollection ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <motion.div
                        className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full"
                        animate={{ x: privacy.dataCollection ? 28 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>

                  {/* Data Export */}
                  <div className="p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <div className="flex items-center gap-4 mb-3">
                      <Download className="w-6 h-6 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-lg">Export Your Data</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Download all your account data and activity</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => toast.info("Data export will be ready in 24 hours. You'll receive an email.")}>
                      <Download className="w-4 h-4 mr-2" />
                      Request Data Export
                    </Button>
                  </div>

                  {/* Delete Account */}
                  <div className="p-4 rounded-lg border-2 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                    <div className="flex items-center gap-4 mb-3">
                      <LogOutIcon className="w-6 h-6 text-red-600" />
                      <div>
                        <h3 className="font-semibold text-lg text-red-600">Danger Zone</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Permanently delete your account and all data</p>
                      </div>
                    </div>
                    <Button 
                      variant="destructive" 
                      className="w-full" 
                      onClick={() => {
                        if (window.confirm('⚠️ Are you sure? This action cannot be undone!')) {
                          toast.error('Account deletion requested. Contact support to proceed.');
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={savePrivacySettings}
                  className="w-full mt-8 py-6 text-lg bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Privacy Settings
                </Button>
              </div>
            </motion.div>
          )}

          {/* APPEARANCE SECTION */}
          {activeSection === 'appearance' && (
            <motion.div
              key="appearance"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="glass-card p-8">
                <div className="flex items-center mb-6">
                  <Palette className="w-8 h-8 mr-3 text-pink-600" />
                  <div>
                    <h2 className="text-3xl font-bold">Appearance Settings</h2>
                    <p className="text-gray-600 dark:text-gray-400">Customize how VeriFy looks to you</p>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Theme Selection */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                      <Palette className="w-5 h-5 mr-2" />
                      Theme Mode
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        onClick={() => setAppearance({ ...appearance, theme: 'light' })}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          appearance.theme === 'light'
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                        }`}
                      >
                        <Sun className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                        <div className="text-center font-semibold">Light</div>
                        {appearance.theme === 'light' && (
                          <Check className="w-5 h-5 mx-auto mt-2 text-blue-600" />
                        )}
                      </button>

                      <button
                        onClick={() => setAppearance({ ...appearance, theme: 'dark' })}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          appearance.theme === 'dark'
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                        }`}
                      >
                        <Moon className="w-8 h-8 mx-auto mb-2 text-indigo-500" />
                        <div className="text-center font-semibold">Dark</div>
                        {appearance.theme === 'dark' && (
                          <Check className="w-5 h-5 mx-auto mt-2 text-blue-600" />
                        )}
                      </button>

                      <button
                        onClick={() => setAppearance({ ...appearance, theme: 'system' })}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          appearance.theme === 'system'
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                        }`}
                      >
                        <Laptop className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                        <div className="text-center font-semibold">System</div>
                        {appearance.theme === 'system' && (
                          <Check className="w-5 h-5 mx-auto mt-2 text-blue-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Font Size */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                      <Monitor className="w-5 h-5 mr-2" />
                      Font Size
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {['small', 'medium', 'large'].map((size) => (
                        <button
                          key={size}
                          onClick={() => setAppearance({ ...appearance, fontSize: size })}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            appearance.fontSize === size
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                          }`}
                        >
                          <div className={`text-center font-semibold ${
                            size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : ''
                          }`}>
                            {size.charAt(0).toUpperCase() + size.slice(1)}
                          </div>
                          {appearance.fontSize === size && (
                            <Check className="w-5 h-5 mx-auto mt-2 text-blue-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Compact Mode */}
                  <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex items-center gap-4">
                      <Smartphone className="w-6 h-6 text-purple-600" />
                      <div>
                        <h3 className="font-semibold text-lg">Compact Mode</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Reduce spacing for a denser layout</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAppearance({ ...appearance, compactMode: !appearance.compactMode })}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        appearance.compactMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <motion.div
                        className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full"
                        animate={{ x: appearance.compactMode ? 28 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>

                  {/* Animations */}
                  <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex items-center gap-4">
                      <motion.div
                        animate={{ rotate: appearance.animations ? 360 : 0 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Palette className="w-6 h-6 text-pink-600" />
                      </motion.div>
                      <div>
                        <h3 className="font-semibold text-lg">Enable Animations</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Show smooth transitions and effects</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAppearance({ ...appearance, animations: !appearance.animations })}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        appearance.animations ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <motion.div
                        className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full"
                        animate={{ x: appearance.animations ? 28 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
                </div>

                <Button
                  onClick={saveAppearanceSettings}
                  className="w-full mt-8 py-6 text-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Appearance Settings
                </Button>
              </div>
            </motion.div>
          )}

          {/* LANGUAGE SECTION */}
          {activeSection === 'language' && (
            <motion.div
              key="language"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="glass-card p-8">
                <div className="flex items-center mb-6">
                  <Globe className="w-8 h-8 mr-3 text-orange-600" />
                  <div>
                    <h2 className="text-3xl font-bold">Language Preferences</h2>
                    <p className="text-gray-600 dark:text-gray-400">Choose your preferred language</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        selectedLanguage === lang.code
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-4xl">{lang.flag}</span>
                          <div>
                            <h3 className="font-semibold text-lg">{lang.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{lang.nativeName}</p>
                          </div>
                        </div>
                        {selectedLanguage === lang.code && (
                          <Check className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Note:</strong> Changing the language will update the interface text and content throughout the application. Some features may require a page refresh to fully apply the changes.
                  </p>
                </div>

                <Button
                  onClick={saveLanguageSettings}
                  className="w-full mt-8 py-6 text-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Language Settings
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
