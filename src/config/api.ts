/**
 * API Configuration for VeriFy AI
 * Backend integration settings
 *
 * --- HARDCODED FIX ---
 * We are temporarily removing the VITE_API_URL variable
 * to force the correct production URL and debug the deployment.
 */

// API Base URL - Hardcoded to your Cloud Run service
export const API_CONFIG = {
  BASE_URL: 'https://verify-ai-backend-1997316706.asia-south1.run.app',
  VERSION: 'v1',
  TIMEOUT: 30000, // 30 seconds
};

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  
  // Detection
  DETECTION: {
    CHECK_TEXT: '/check-text',
    CHECK_IMAGE: '/check-image',
    CHECK_VIDEO: '/check-video',
    CHECK_VOICE: '/check-voice',
    VIDEO_RESULT: '/check-video/result',
    EXPLANATION: '/explanation',
  },
  
  // Reports
  REPORT: {
    SUBMIT: '/report',
    LIST: '/reports',
  },
  
  // Trending
  TRENDING: {
    GET: '/trending',
    MAP: '/trending/map',
  },
  
  // Health
  HEALTH: '/health',
};

/**
 * Get full API URL
 */
export function getApiUrl(endpoint: string): string {
  // This will now build:
  // https://...run.app/api/v1/check-text
  return `${API_CONFIG.BASE_URL}/api/${API_CONFIG.VERSION}${endpoint}`;
}

/**
 * Get authorization headers
 */
export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}
