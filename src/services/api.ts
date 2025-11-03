import { getApiUrl } from '../lib/utils';
import { ApiError } from '../types';

// --- Community Feature Dummy Data ---

const DUMMY_LEADERBOARD = [
  { rank: 1, user: { name: 'Pravda Guardian', avatar: '' }, score: 1500 },
  { rank: 2, user: { name: 'FactFinder', avatar: '' }, score: 1250 },
  { rank: 3, user: { name: 'TruthSeeker', avatar: '' }, score: 1100 },
];

const DUMMY_BADGES = [
  { id: '1', name: 'First Catch', description: 'Reported your first piece of misinformation.' },
  { id: '2', name: 'Community Helper', description: 'Helped 10 others with verifications.' },
  { id: '3', name: 'Sharp Eye', description: 'Detected 5 deepfakes with high accuracy.' },
];

const DUMMY_STATS = {
  reports_submitted: 25,
  verifications_assisted: 42,
  accuracy_rating: 98.5,
};

const DUMMY_DISCUSSIONS = [
  { id: '1', title: 'New viral video about elections - is it real?', author: 'FactFinder', replies: 5, last_activity: '3h ago' },
  { id: '2', title: 'Discussion: Best practices for spotting fake text messages', author: 'Admin', replies: 12, last_activity: '1d ago' },
];


export class ApiClient {
  static async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = getApiUrl(endpoint);
    const token = localStorage.getItem('access_token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };
    
    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Request failed',
        detail: response.statusText,
      }));
      throw { ...error, status: response.status } as ApiError;
    }
    
    return await response.json();
  }
  
  // Auth
  static async login(data: { email?: string; password?: string; provider?: string; code?: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async register(data: { name: string; email: string; password?: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async verifyEmail(token: string) {
    return this.request(`/auth/verify-email?token=${token}`, {
      method: 'GET',
    });
  }

  static async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  static async resetPassword(data: { token: string; password_hash: string }) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  // Text Detection
  static async checkText(text: string) {
    return this.request('/check-text', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }
  
  // Image Detection
  static async checkImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const url = getApiUrl('/check-image');
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Request failed',
        detail: response.statusText,
      }));
      throw { ...error, status: response.status } as ApiError;
    }
    
    return await response.json();
  }
  
  // Video Detection
  static async checkVideo(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const url = getApiUrl('/check-video');
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Request failed',
        detail: response.statusText,
      }));
      throw { ...error, status: response.status } as ApiError;
    }
    
    return await response.json() as {
      job_id: string;
      status: string;
      progress: number;
      message: string;
    };
  }
  
  // Get Video Result
  static async getVideoResult(jobId: string) {
    return this.request<{
      job_id: string;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      progress: number;
      verdict: 'real' | 'fake' | 'unverified' | null;
      confidence: number | null;
      explanation: string | null;
      error_message: string | null;
    }>(`/check-video/result/${jobId}`, {
      method: 'GET',
    });
  }
  
  // Voice Detection
  static async checkVoice(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const url = getApiUrl('/check-voice');
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Request failed',
        detail: response.statusText,
      }));
      throw { ...error, status: response.status } as ApiError;
    }
    
    return await response.json();
  }
  
  // Get Explanation
  static async getExplanation(detectionId: number) {
    return this.request(`/explanation/${detectionId}`, {
      method: 'GET',
    });
  }
  
  // Submit Report
  static async submitReport(data: {
    content_url?: string;
    content_text?: string;
    report_reason: string;
    report_category?: string;
    user_location?: string;
  }) {
    return this.request('/report', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  // Get Trending
  static async getTrending(params?: {
    time_window?: number;
    country?: string;
    category?: string;
  }) {
    const queryParams = new URLSearchParams(params as any);
    return this.request(`/trending?${queryParams}`, {
      method: 'GET',
    });
  }
  
  // Get Trending Map
  static async getTrendingMap() {
    return this.request('/trending/map', {
      method: 'GET',
    });
  }

  // --- Community Endpoints (Now with Dummy Data) ---
  static async getDiscussions() {
    console.warn("Using dummy data for getDiscussions");
    return Promise.resolve(DUMMY_DISCUSSIONS);
  }

  static async getLeaderboard() {
    console.warn("Using dummy data for getLeaderboard");
    return Promise.resolve(DUMMY_LEADERBOARD);
  }

  static async getBadges() {
    console.warn("Using dummy data for getBadges");
    return Promise.resolve(DUMMY_BADGES);
  }

  static async getMyStats() {
    console.warn("Using dummy data for getMyStats");
    return Promise.resolve(DUMMY_STATS);
  }
  
  // Health Check
  static async healthCheck() {
    return this.request('/health', {
      method: 'GET',
    });
  }
}
