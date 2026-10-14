'use client';

import React, { useState, useEffect } from 'react';
import {
    Search,
    X,
    Loader2,
    Users,
    Radio
} from 'lucide-react';


import { SidebarHeader } from '@/components/chat/SidebarHeader';
import { StoriesTray } from '@/components/stories/StoriesTray';
import { ChatInboxList } from '@/components/chat/ChatInboxList';
import { Avatar } from '@/components/common/Avatar';

import { useChatStore } from '@/store/useChatStore';

interface Props {
    activeChatId: string | null;
    onSelectChat: (chat: any) => void;
}

export const ChatSidebar: React.FC<Props> = ({ activeChatId, onSelectChat }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'direct' | 'groups' | 'channels'>('all');

    const {
        chats,
        savedMessagesChat,
        fetchChats,
        fetchSavedMessages,
        searchResults,
        searchGlobal,
        clearSearch,
        isSearching,
        accessOrCreateDirectChat,
        initRealtime
    } = useChatStore();

    
    useEffect(() => {
        fetchChats();
        fetchSavedMessages();
        initRealtime();
    }, []);

    
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchQuery.trim().length > 0) {
                searchGlobal(searchQuery.trim(), activeTab);
            } else {
                clearSearch();
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery, activeTab]);

    
    const filteredChats = chats.filter((chat) => {
        if (activeTab === 'all') return true;
        if (activeTab === 'direct') return chat.chatType === 'direct' || !chat.chatType;
        if (activeTab === 'groups') return chat.chatType === 'group';
        if (activeTab === 'channels') return chat.chatType === 'channel';
        return true;
    });

    const hasSearchResults = searchQuery.trim().length > 0;
    const hasAnySearchResult =
        searchResults.users?.length > 0 ||
        searchResults.groups?.length > 0 ||
        searchResults.channels?.length > 0;

    return (
        <aside className="w-full md:w-[360px] lg:w-[400px] h-full flex flex-col bg-neutral-950/95 border-r border-neutral-800/80 backdrop-blur-2xl select-none relative">

            
            <SidebarHeader />

            
            <StoriesTray />

            
            <div className="p-3 border-b border-neutral-800/40">
                <div className="relative flex items-center">
                    <Search className="absolute left-3.5 w-4 h-4 text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Search users, groups, channels..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-9 py-2.5 bg-neutral-900/80 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 text-xs focus:outline-none focus:border-cyan-400 transition"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 text-neutral-500 hover:text-white cursor-pointer">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            
            <div className="flex items-center space-x-1.5 px-3 py-2.5 border-b border-neutral-800/40 text-xs font-semibold overflow-x-auto custom-scrollbar">
                {(['all', 'direct', 'groups', 'channels'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 rounded-xl capitalize transition cursor-pointer shrink-0 text-xs ${activeTab === tab
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
                            }`}
                    >
                        {tab === 'all' ? 'All Chats' : tab}
                    </button>
                ))}
            </div>

            
            {hasSearchResults ? (
                <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                    {isSearching ? (
                        <div className="flex items-center justify-center p-8 text-cyan-400">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            <span className="text-xs">Searching global database...</span>
                        </div>
                    ) : (
                        <>
                            
                            {searchResults.users?.length > 0 && (
                                <div>
                                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-2 mb-2 block">
                                        People
                                    </span>
                                    <div className="space-y-1">
                                        {searchResults.users.map((u: any) => (
                                            <div
                                                key={u._id}
                                                onClick={async () => {
                                                    const chat = await accessOrCreateDirectChat(u._id);
                                                    if (chat) onSelectChat(chat);
                                                    setSearchQuery('');
                                                }}
                                                className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-neutral-900/80 transition cursor-pointer"
                                            >
                                                <Avatar src={u.profilePic} name={u.userName} isOnline={u.isOnline} size="sm" />
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-xs font-bold text-white truncate">
                                                        {`${u.firstName || ''} ${u.lastName || ''}`.trim() || `@${u.userName}`}
                                                    </h4>
                                                    <p className="text-[10px] text-cyan-400 truncate">@{u.userName}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            
                            {searchResults.groups?.length > 0 && (
                                <div>
                                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-2 mb-2 block">
                                        Public Groups
                                    </span>
                                    <div className="space-y-1">
                                        {searchResults.groups.map((g: any) => (
                                            <div
                                                key={g._id}
                                                onClick={() => {
                                                    onSelectChat({ ...g, chatType: 'group' });
                                                    setSearchQuery('');
                                                }}
                                                className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-neutral-900/80 transition cursor-pointer"
                                            >
                                                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                                                    <Users className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-xs font-bold text-white truncate">{g.name}</h4>
                                                    <p className="text-[10px] text-neutral-400 truncate">{g.members?.length || 0} members</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            
                            {searchResults.channels?.length > 0 && (
                                <div>
                                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-2 mb-2 block">
                                        Broadcast Channels
                                    </span>
                                    <div className="space-y-1">
                                        {searchResults.channels.map((c: any) => (
                                            <div
                                                key={c._id}
                                                onClick={() => {
                                                    onSelectChat({ ...c, chatType: 'channel' });
                                                    setSearchQuery('');
                                                }}
                                                className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-neutral-900/80 transition cursor-pointer"
                                            >
                                                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                                    <Radio className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-xs font-bold text-white truncate">{c.name}</h4>
                                                    <p className="text-[10px] text-neutral-400 truncate">{c.subscribers?.length || 0} subscribers</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!hasAnySearchResult && (
                                <div className="text-center p-8 text-neutral-500 text-xs">
                                    No results found matching "{searchQuery}"
                                </div>
                            )}
                        </>
                    )}
                </div>
            ) : (
                
                <ChatInboxList
                    chats={filteredChats}
                    savedMessagesChat={savedMessagesChat}
                    activeChatId={activeChatId}
                    onSelectChat={onSelectChat}
                />
            )}

        </aside>
    );
};