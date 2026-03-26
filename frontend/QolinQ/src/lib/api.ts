import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '');

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle 401 responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// ─── Auth ───
export const authAPI = {
    register: (data: any) => api.post('/auth/register', data),
    login: (data: { email: string; password: string }) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    switchRole: () => api.put('/auth/switch-role'),
};

// ─── Influencer ───
export const influencerAPI = {
    getProfile: () => api.get('/influencer/profile'),
    updateProfile: (data: any) => api.put('/influencer/profile', data),
    connectPlatform: (data: any) => api.put('/influencer/connect-platform', data),
    getDashboard: () => api.get('/influencer/dashboard'),
    getAnalytics: () => api.get('/influencer/analytics'),
    getEarnings: (params?: any) => api.get('/influencer/earnings', { params }),
};

// ─── Brand ───
export const brandAPI = {
    getProfile: () => api.get('/brand/profile'),
    updateProfile: (data: any) => api.put('/brand/profile', data),
    getDashboard: () => api.get('/brand/dashboard'),
    inviteInfluencer: (influencerId: string, data: any) => api.post(`/brand/invite/${influencerId}`, data),
};

// ─── Campaigns ───
export const campaignAPI = {
    create: (data: any) => api.post('/campaigns', data),
    getAll: (params?: any) => api.get('/campaigns', { params }),
    getById: (id: string) => api.get(`/campaigns/${id}`),
    update: (id: string, data: any) => api.put(`/campaigns/${id}`, data),
    delete: (id: string) => api.delete(`/campaigns/${id}`),
    getMyCampaigns: (params?: any) => api.get('/campaigns/brand/my', { params }),
};

// ─── Applications ───
export const applicationAPI = {
    apply: (campaignId: string, data: any) => api.post(`/applications/${campaignId}`, data),
    getCampaignApplications: (campaignId: string, params?: any) => api.get(`/applications/campaign/${campaignId}`, { params }),
    getMyApplications: (params?: any) => api.get('/applications/my', { params }),
    updateStatus: (id: string, data: { status: string }) => api.put(`/applications/${id}/status`, data),
    uploadDeliverable: (id: string, data: any) => api.put(`/applications/${id}/deliverable`, data),
    getContract: (id: string) => api.get(`/applications/${id}/contract`),
};

// ─── Messages ───
export const messageAPI = {
    startConversation: (data: { participantId: string; campaignId?: string }) => api.post('/messages/conversation', data),
    getConversations: (params?: any) => api.get('/messages/conversations', { params }),
    sendMessage: (conversationId: string, data: any) => api.post(`/messages/${conversationId}`, data),
    getMessages: (conversationId: string, params?: any) => api.get(`/messages/${conversationId}`, { params }),
};

// ─── Escrow ───
export const escrowAPI = {
    fund: (campaignId: string, data: any) => api.post(`/escrow/fund/${campaignId}`, data),
    release: (escrowId: string) => api.put(`/escrow/release/${escrowId}`),
    dispute: (escrowId: string, data: { reason: string }) => api.put(`/escrow/dispute/${escrowId}`, data),
    getStatus: (campaignId: string) => api.get(`/escrow/status/${campaignId}`),
};

// ─── Ratings ───
export const ratingAPI = {
    rate: (campaignId: string, data: any) => api.post(`/ratings/${campaignId}`, data),
    getUserRatings: (userId: string, params?: any) => api.get(`/ratings/user/${userId}`, { params }),
};

// ─── Search ───
export const searchAPI = {
    influencers: (params?: any) => api.get('/search/influencers', { params }),
    campaigns: (params?: any) => api.get('/search/campaigns', { params }),
};

// ─── Fraud & Admin ───
export const fraudAPI = {
    runGlobalCheck: () => api.post('/admin/fraud/verify-all'),
    getFlaggedProfiles: () => api.get('/admin/flagged-profiles'),
    verifyUser: (userId: string, data: { trustBadge?: boolean, verificationStatus?: string }) => 
        api.put(`/admin/verify-user/${userId}`, data),
};

// ─── Notifications ───
export const notificationAPI = {
    getAll: (params?: any) => api.get('/notifications', { params }),
    markRead: (id: string) => api.put(`/notifications/${id}/read`),
    markAllRead: () => api.put('/notifications/read-all'),
};

export default api;
