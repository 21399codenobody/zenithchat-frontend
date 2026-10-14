import { create } from 'zustand';
import { chatService, messageService, userService } from '@/services/api';
import { getSocket } from '@/services/socket';

interface ChatState {
    chats: any[];
    savedMessagesChat: any | null;
    activeChat: any | null;
    messages: any[];
    searchResults: { users: any[]; groups: any[]; channels: any[] };
    isLoading: boolean;
    isSearching: boolean;
    error: string | null;

    addIncomingMessage: (message: any) => void;
    initRealtime: () => void;
    fetchChats: () => Promise<void>;
    fetchSavedMessages: () => Promise<void>;
    setActiveChat: (chat: any) => Promise<void>;
    fetchMessages: (chatId: string) => Promise<void>;
    sendMessage: (text: string, selfDestructDuration?: string) => Promise<boolean>;
    searchGlobal: (query: string, category?: string) => Promise<void>;
    clearSearch: () => void;
    accessOrCreateDirectChat: (recipientId: string) => Promise<any>;
    clearActiveChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    chats: [],
    savedMessagesChat: null,
    activeChat: null,
    messages: [],
    searchResults: { users: [], groups: [], channels: [] },
    isLoading: false,
    isSearching: false,
    error: null,


    addIncomingMessage: (message: any) => {
        const { activeChat, messages } = get();
        if (activeChat && activeChat._id.toString() === message.chatId.toString()) {
            const exists = messages.some(m => m._id.toString() === message._id.toString());
            if (!exists) {
                set({ messages: [...messages, message] });
            }
        }
        get().fetchChats();
    },


    initRealtime: () => {
        const socket = getSocket();


        socket.off('receive_message');
        socket.on('receive_message', (incomingMsg: any) => {
            get().addIncomingMessage(incomingMsg);
        });


        socket.off('user_status_change');
        socket.on('user_status_change', ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
            set((state) => {
                const updatedChats = state.chats.map(chat => {
                    const updatedParticipants = chat.participants?.map((p: any) =>
                        p._id === userId ? { ...p, isOnline } : p
                    );
                    return { ...chat, participants: updatedParticipants };
                });

                let updatedActiveChat = state.activeChat;
                if (state.activeChat?.participants) {
                    updatedActiveChat = {
                        ...state.activeChat,
                        participants: state.activeChat.participants.map((p: any) =>
                            p._id === userId ? { ...p, isOnline } : p
                        )
                    };
                }

                return { chats: updatedChats, activeChat: updatedActiveChat };
            });
        });
    },

    fetchChats: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await chatService.getChats();
            set({ chats: res.data.chats || [], isLoading: false });
        } catch (err: any) {
            set({ isLoading: false, error: err.response?.data?.message || "Failed to load chats." });
        }
    },

    fetchSavedMessages: async () => {
        try {
            const res = await chatService.getSavedMessages();
            set({ savedMessagesChat: res.data.chat });
        } catch (err) {
            console.error("Failed to load Saved Messages:", err);
        }
    },

    setActiveChat: async (chat: any) => {
        const prevChat = get().activeChat;
        const socket = getSocket();


        if (prevChat && prevChat._id && prevChat._id !== chat?._id) {
            socket.emit('leave_chat', prevChat._id);
        }

        set({ activeChat: chat, messages: [] });

        if (chat && chat._id) {
            socket.emit('join_chat', chat._id);
            await get().fetchMessages(chat._id);
        }
    },

    fetchMessages: async (chatId: string) => {
        try {
            const res = await messageService.getMessages(chatId);
            set({ messages: res.data.messages || [] });
        } catch (err) {
            console.error("Failed to load messages:", err);
        }
    },

    sendMessage: async (text: string, selfDestructDuration = 'none') => {
        const { activeChat } = get();
        if (!activeChat || !text.trim()) return false;

        try {
            const payload = {
                chatId: activeChat._id,
                text: text.trim(),
                isSelfDestruct: selfDestructDuration !== 'none',
                selfDestructDuration: selfDestructDuration !== 'none' ? selfDestructDuration : undefined
            };

            const res = await messageService.sendMessage(payload);
            const createdMsg = res.data.message;

            set((state) => ({
                messages: [...state.messages, createdMsg]
            }));

            const socket = getSocket();
            socket.emit('send_message', { chatId: activeChat._id, message: createdMsg });

            get().fetchChats();
            return true;
        } catch (err) {
            console.error("Send message failed:", err);
            return false;
        }
    },

    searchGlobal: async (query: string, category = 'all') => {
        if (!query.trim() && category === 'all') {
            set({ searchResults: { users: [], groups: [], channels: [] } });
            return;
        }
        set({ isSearching: true });
        try {
            const res = await userService.globalSearch(query, category);
            set({ searchResults: res.data.results, isSearching: false });
        } catch (err) {
            set({ isSearching: false });
        }
    },

    clearSearch: () => set({ searchResults: { users: [], groups: [], channels: [] } }),

    accessOrCreateDirectChat: async (recipientId: string) => {
        try {
            const res = await chatService.accessOrCreateChat(recipientId);
            const chat = res.data.chat;
            await get().fetchChats();
            await get().setActiveChat(chat);
            return chat;
        } catch (err) {
            console.error("Direct chat access failed:", err);
            return null;
        }
    },

    clearActiveChat: () => {
        const { activeChat } = get();
        if (activeChat?._id) {
            getSocket().emit('leave_chat', activeChat._id);
        }
        set({ activeChat: null, messages: [] });
    }
}));