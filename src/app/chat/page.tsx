'use client';

import React, { useState } from 'react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';

export default function ChatDashboardPage() {
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [activeChatObj, setActiveChatObj] = useState<any | null>(null);

    // ডামি চ্যাট সিলেক্ট হ্যান্ডলার (পরে Zustand স্টোর দিয়ে প্রতিস্থাপন হবে)
    const handleSelectChat = (chatId: string) => {
        setActiveChatId(chatId);

        // ডামি অবজেক্ট সেটআপ
        const dummyMap: Record<string, any> = {
            'saved': { id: 'saved', name: 'Saved Messages', username: 'cloud_vault', avatar: '☁️', isOnline: true },
            '1': { id: '1', name: 'Elon Musk', username: 'elon_musk', avatar: '🚀', isOnline: true },
            '2': { id: '2', name: 'Zenith Core Team', username: 'zenith_devs', avatar: '⚡', isOnline: false },
            '3': { id: '3', name: 'Secret Crush ❤️', username: 'my_heart', avatar: '🌹', isOnline: true },
        };

        setActiveChatObj(dummyMap[chatId] || null);
    };

    return (
        <div className="h-screen w-screen flex overflow-hidden bg-[#080c14]">

            {/* ১. বামপাশের সাইডবার (মোবাইলে চ্যাট ওপেন থাকলে এটি হাইড হবে) */}
            <div className={`${activeChatId ? 'hidden md:flex' : 'flex'} w-full md:w-auto h-full`}>
                <ChatSidebar
                    activeChatId={activeChatId}
                    onSelectChat={handleSelectChat}
                />
            </div>

            {/* ২. ডানপাশের মূল চ্যাট উইন্ডো (মোবাইলে সাইডবার সিলেক্ট করলে এটি ফুলস্ক্রিন হবে) */}
            <div className={`${!activeChatId ? 'hidden md:flex' : 'flex'} flex-1 h-full`}>
                <ChatWindow
                    activeChat={activeChatObj}
                    onBack={() => setActiveChatId(null)}
                />
            </div>

        </div>
    );
}