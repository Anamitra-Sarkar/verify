import { getApiUrl } from '../config/api';
import { ApiError } from '../types';

// --- Dummy Data Definitions ---

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

const DUMMY_TRENDING = [
    { id: '1', topic: 'Fake Holiday Giveaway on Social Media', category: 'Scam', detection_count: 1204, last_detected_at: '2025-11-03T14:00:00Z', sample_content: 'Click here to claim your free vacation! Limited time offer!', average_confidence: 95.4 },
    { id: '2', topic: 'AI-Generated Celebrity Endorsement for Crypto', category: 'Deepfake', detection_count: 856, last_detected_at: '2025-11-03T13:30:00Z', sample_content: 'Invest in this new coin, I am using it myself and have made millions...', average_confidence: 99.1 },
    { id: '3', topic: 'Misleading Health Claims About a New "Superfood"', category: 'Misinformation', detection_count: 672, last_detected_at: '2025-11-03T12:00:00Z', sample_content: 'This one fruit from the Amazon cures all diseases. Doctors are shocked!', average_confidence: 88.9 },
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
    
    // For live API, return this
    // return await response.json();

    // For dummy data, we bypass the json parsing if the response might be empty
     try {
        return await response.json();
    } catch (e) {
        // If parsing fails (e.g., empty body), return an empty object 
        // to prevent downstream errors, but log it.
        console.error("Failed to parse JSON response, returning empty object.", e);
        return {} as T;
    }
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
  
  // Get Trending (Now with Dummy Data)
  static async getTrending(params?: {
    time_window?: number;
    country?: string;
    category?: string;
  }) {
    console.warn("Using dummy data for getTrending");
    return Promise.resolve(DUMMY_TRENDING);
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
