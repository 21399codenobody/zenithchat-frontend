'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';


import { AuthForm } from '@/components/auth/AuthForm';


import { ProfileWizard } from '@/components/auth/ProfileWizard';


import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';


import { CallModal, type CallSession } from '@/components/calls/CallModal';
import { getSocket } from '@/services/socket';

export default function Home() {
  const { isAuthenticated, isProfileComplete } = useAuthStore();
  const { activeChat, setActiveChat, clearActiveChat } = useChatStore();

  
  const [globalCallSession, setGlobalCallSession] = useState<CallSession | null>(null);

  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }

    
    socket.off('incoming_call');
    socket.on('incoming_call', (data: any) => {
      setGlobalCallSession({
        partner: data.from,
        callType: data.callType,
        isIncoming: true,
        chatId: data.chatId,
        signal: data.signal
      });
    });

    return () => {
      socket.off('incoming_call');
    };
  }, [isAuthenticated]);

  
  if (!isMounted) {
    return (
      <div className="h-screen w-screen bg-[#06090f] flex items-center justify-center select-none">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen w-full bg-[#06090f] flex items-center justify-center p-4 relative overflow-hidden select-none">
        
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <AuthForm 
          onSuccess={() => {
            
          }} 
        />
      </main>
    );
  }

  
  if (!isProfileComplete) {
    return (
      <main className="min-h-screen w-full bg-[#06090f] flex items-center justify-center p-4 relative overflow-hidden select-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

        <ProfileWizard 
          onComplete={() => {
            
            useAuthStore.setState({ isProfileComplete: true });
          }} 
        />
      </main>
    );
  }

  
  return (
    <main className="h-screen w-screen flex bg-[#06090f] overflow-hidden select-none relative">
      
      
      <div className={`h-full ${activeChat ? 'hidden md:flex' : 'flex w-full md:w-auto'}`}>
        <ChatSidebar
          activeChatId={activeChat?._id || null}
          onSelectChat={(chat) => setActiveChat(chat)}
        />
      </div>

      
      <div className={`h-full flex-1 ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        <ChatWindow
          activeChat={activeChat}
          onBack={() => clearActiveChat()}
        />
      </div>

      
      <CallModal
        callSession={globalCallSession}
        onEndCall={() => setGlobalCallSession(null)}
      />

    </main>
  );
}