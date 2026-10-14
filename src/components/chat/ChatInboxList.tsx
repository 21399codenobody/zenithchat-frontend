'use client';

import React from 'react';
import { Bookmark, Compass } from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { useAuthStore } from '@/store/useAuthStore';

interface Props {
    chats: any[];
    savedMessagesChat: any | null;
    activeChatId: string | null;
    onSelectChat: (chat: any) => void;
}

export const ChatInboxList: React.FC<Props> = ({ chats, savedMessagesChat, activeChatId, onSelectChat }) => {
    const { user } = useAuthStore();
    const currentUserId = user?.id || user?._id;


    const getOtherParticipant = (chat: any) => {
        if (!chat?.participants || !currentUserId) return null;
        return chat.participants.find((p: any) => {
            const participantId = p?._id || p;
            return participantId?.toString() !== currentUserId?.toString();
        });
    };


    const getUnreadCount = (chat: any) => {
        if (!chat?.participantSettings || !currentUserId) return 0;
        const mySetting = chat.participantSettings.find((s: any) => {
            const settingUserId = s?.user?._id || s?.user;
            return settingUserId?.toString() === currentUserId?.toString();
        });
        return mySetting?.unreadCount || 0;
    };


    const getLastMessagePreview = (lastMsg: any) => {
        if (!lastMsg) return "Started an encrypted conversation";
        if (lastMsg.text && lastMsg.text.trim()) return lastMsg.text;
        if (lastMsg.mediaType === 'image') return "📷 Photo";
        if (lastMsg.mediaType === 'video') return "🎥 Video";
        if (lastMsg.mediaType === 'audio' || lastMsg.mediaType === 'voice') return "🎤 Voice message";
        if (lastMsg.mediaType === 'file') return "📁 Document";
        return "Sent an attachment";
    };

    return (
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-900/60 p-2 space-y-1 select-none custom-scrollbar">


            {savedMessagesChat && (
                <div
                    onClick={() => onSelectChat(savedMessagesChat)}
                    className={`flex items-center space-x-3 p-3 rounded-2xl transition cursor-pointer ${activeChatId === savedMessagesChat._id
                        ? 'bg-cyan-500/15 border border-cyan-500/30'
                        : 'hover:bg-neutral-900/60 border border-transparent'
                        }`}
                >
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xl shadow-inner shrink-0">
                        <Bookmark className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-xs sm:text-sm font-bold text-white truncate">Saved Messages</h3>
                            <span className="text-[9px] text-cyan-400 font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">Cloud</span>
                        </div>
                        <p className="text-xs text-neutral-400 truncate">
                            {savedMessagesChat.lastMessage?.text || "Your encrypted cloud notes & media storage"}
                        </p>
                    </div>
                </div>
            )}


            {chats.map((chat) => {
                const otherUser = getOtherParticipant(chat);
                const isActive = activeChatId === chat._id;
                const lastMsg = chat.lastMessage;
                const unreadCount = getUnreadCount(chat);

                return (
                    <div
                        key={chat._id}
                        onClick={() => onSelectChat(chat)}
                        className={`flex items-center space-x-3 p-3 rounded-2xl transition cursor-pointer group ${isActive
                            ? 'bg-cyan-500/15 border border-cyan-500/30 shadow-lg shadow-cyan-950/30'
                            : 'hover:bg-neutral-900/60 border border-transparent'
                            }`}
                    >
                        <Avatar
                            src={otherUser?.profilePic}
                            name={otherUser?.userName || 'User'}
                            isOnline={otherUser?.isOnline}
                            size="md"
                        />

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition truncate">
                                    {otherUser
                                        ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || `@${otherUser.userName}`
                                        : 'Encrypted Chat'}
                                </h3>
                                <span className="text-[10px] text-neutral-500 font-medium shrink-0 ml-2">
                                    {lastMsg?.createdAt
                                        ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : ''}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <p className={`text-xs truncate pr-2 ${unreadCount > 0 ? 'text-neutral-200 font-semibold' : 'text-neutral-400'}`}>
                                    {getLastMessagePreview(lastMsg)}
                                </p>


                                {unreadCount > 0 && (
                                    <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 text-neutral-950 font-black text-[10px] flex items-center justify-center shadow-md shadow-cyan-500/20">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}


            {chats.length === 0 && !savedMessagesChat && (
                <div className="text-center p-8 text-neutral-500 text-xs space-y-2">
                    <Compass className="w-8 h-8 mx-auto text-neutral-600 mb-2 animate-pulse" />
                    <p className="font-semibold text-neutral-400">Your inbox is quiet</p>
                    <p className="text-[11px] leading-relaxed">
                        Search for real users by <span className="text-cyan-400">@username</span> above to start chatting!
                    </p>
                </div>
            )}

        </div>
    );
};