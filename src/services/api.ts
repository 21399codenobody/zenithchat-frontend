import axios from "axios";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});


api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('zenith_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
},
    (error) => {
        return Promise.reject(error);
    });


api.interceptors.response.use((response) => response, (error) => {
    if (error.response && error.response.status === 401) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('zenith_token');
            localStorage.removeItem('zenith_user');
            window.location.href = '/';
        }
    }
    return Promise.reject(error);
});


export const authService = {
    
    sendOtp: (data: { phoneNumber: string; countryCode?: string }) =>
        api.post('/auth/send-otp', data),

    
    verifyOtp: (data: { phoneNumber: string; otp: string; deviceId?: string }) =>
        api.post('/auth/verify-otp', data),

    
    completeProfile: (data: { firstName: string; lastName?: string; userName?: string; bio?: string; profilePic?: string }) =>
        api.post('/auth/complete-profile', data)
};


export const chatService = {
    getChats: () => api.get('/chats'),
    accessOrCreateChat: (recipientId: string) => api.post('/chats', { recipientId }),
    getSavedMessages: () => api.get('/chats/saved/me'),
    updateSettings: (chatId: string,
        settings: any
    ) => api.patch(`/chats/${chatId}/settings`, settings)
};


export const messageService = {
    sendMessage: (messageData: any) => api.post('/messages/send', messageData),
    getMessages: (chatId: string) => api.get(`/messages/${chatId}`),
    deleteMessage: (messageId: string, deleteForEveryone: boolean) => api.delete(`/messages/${messageId}`, { data: { deleteForEveryone } }),
    reactToMessage: (messageId: string, emoji: string) => api.post(`/messages/${messageId}/react`, { emoji })
};

export const userService = {
    getProfile: (userId: string) => api.get(`/users/profile/${userId}`),
    updatePrivacy: (privacySettings: any) => api.patch('/users/privacy', privacySettings),
    blockUser: (targetUserId: string) => api.post('/users/block', { targetUserId }),
    globalSearch: (query: string, category?: string) => {
        let url = `/search?q=${encodeURIComponent(query)}`;
        if (category && category !== 'all') {
            url += `&category=${encodeURIComponent(category)}`;
        }
        return api.get(url);
    },
    getContacts: () => api.get('/users/contacts'),
    syncContacts: (phoneNumbers: string[], countryCode?: string) => api.post('/users/sync-contacts', { phoneNumbers, countryCode })
};


export const storyService = {
    createStory: (storyData: any) => api.post('/stories', storyData),
    getFeedStories: () => api.get('/stories/feed'),
    getUserArchive: (userId: string) => api.get(`/stories/archive/${userId}`),
    viewStory: (storyId: string) => api.post(`/stories/${storyId}/view`),
    deleteStory: (storyId: string) => api.delete(`/stories/${storyId}`)
};


export const groupService = {
    createGroup: (groupData: any) => api.post('/groups', groupData),
    getGroupDetails: (groupId: string) => api.get(`/groups/${groupId}`),
    updateSettings: (groupId: string, settings: any) => api.patch(`/groups/${groupId}/settings`, settings),
    manageMembers: (groupId: string, memberData: any) => api.post(`/groups/${groupId}/members`, memberData),
    manageAdmins: (groupId: string, adminData: any) => api.post(`/groups/${groupId}/admins`, adminData),
    leaveGroup: (groupId: string, data?: any) => api.post(`/groups/${groupId}/leave`, data || {}),
    deleteGroup: (groupId: string) => api.delete(`/groups/${groupId}`)
};


export const channelService = {
    createChannel: (channelData: any) => api.post('/channels', channelData),
    getChannelDetails: (channelId: string) => api.get(`/channels/${channelId}`),
    updateSettings: (channelId: string, settings: any) => api.patch(`/channels/${channelId}/settings`, settings),
    toggleSubscribe: (channelId: string) => api.post(`/channels/${channelId}/subscribe`),
    manageAdmins: (channelId: string, adminData: any) => api.post(`/channels/${channelId}/admins`, adminData),
    deleteChannel: (channelId: string) => api.delete(`/channels/${channelId}`)
};


export const inviteService = {
    createInviteLink: (linkData: any) => api.post('/invites', linkData),
    consumeInviteLink: (linkCode: string) => api.post(`/invites/consume/${linkCode}`),
    handleRequest: (linkId: string, requestData: any) => api.post(`/invites/${linkId}/requests`, requestData),
    revokeInviteLink: (linkId: string) => api.patch(`/invites/${linkId}/revoke`)
};