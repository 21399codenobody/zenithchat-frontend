'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Phone,
    Video,
    MoreVertical,
    Paperclip,
    Mic,
    Send,
    Zap,
    CheckCheck,
    Flame,
    Lock,
    ArrowLeft,
    X,
    Smile,
    Trash2,
    Play,
    Pause,
    Square,
    Image as ImageIcon
} from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { ChatDetailsDrawer } from '@/components/chat/ChatDetailsDrawer';
import { CallModal, type CallSession } from '@/components/calls/CallModal';
import { EmojiPicker } from '@/components/chat/EmojiPicker';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';
import { messageService } from '@/services/api';
import { getSocket } from '@/services/socket';

interface Props {
    activeChat: any | null;
    onBack: () => void;
}

export const ChatWindow: React.FC<Props> = ({ activeChat, onBack }) => {
    const [inputText, setInputText] = useState('');
    const [selectedTimer, setSelectedTimer] = useState<string>('none');
    const [showTimerMenu, setShowTimerMenu] = useState(false);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    
    const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
    const [activeCallSession, setActiveCallSession] = useState<CallSession | null>(null);

    
    const [isRecording, setIsRecording] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    
    const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

    
    const [attachmentPreview, setAttachmentPreview] = useState<{ url: string; base64: string; type: 'image' | 'video' | 'file' } | null>(null);
    const [captionText, setCaptionText] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { user } = useAuthStore();
    const currentUserId = user?.id || user?._id;
    const { messages, sendMessage } = useChatStore();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!activeChat || !activeChat._id) return;
        const socket = getSocket();
        socket.emit('join_chat', activeChat._id);
    }, [activeChat]);

    
    useEffect(() => {
        let interval: any;
        if (isRecording) {
            interval = setInterval(() => setRecordingSeconds(prev => prev + 1), 1000);
        } else {
            setRecordingSeconds(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    if (!activeChat) {
        return (
            <div className="flex-1 h-full flex flex-col items-center justify-center bg-[#080c14] p-6 text-center select-none">
                <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-3xl mb-4 shadow-xl shadow-cyan-500/10 animate-pulse">
                    ✈️
                </div>
                <h2 className="text-xl font-bold text-white mb-2 tracking-wide">
                    Select a chat to start messaging
                </h2>
                <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
                    Choose a conversation from the sidebar or search to open an encrypted communication channel.
                </p>
            </div>
        );
    }

    const partner = activeChat.isSavedMessages
        ? { firstName: 'Saved', lastName: 'Messages', avatar: '☁️', username: 'cloud_vault' }
        : activeChat.participants?.find((p: any) => (p._id || p).toString() !== currentUserId?.toString()) || activeChat.participants?.[0];

    
    const startVoiceRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64Audio = reader.result as string;
                    
                    await messageService.sendMessage({
                        chatId: activeChat._id,
                        text: "🎤 Voice Message",
                        mediaUrl: base64Audio,
                        mediaType: 'voice',
                        isSelfDestruct: selectedTimer !== 'none',
                        selfDestructDuration: selectedTimer !== 'none' ? selectedTimer : undefined
                    });
                    useChatStore.getState().fetchMessages(activeChat._id);
                };
                reader.readAsDataURL(audioBlob);

                
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            alert("Microphone permission denied or not available!");
        }
    };

    const stopVoiceRecordingAndSend = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const cancelVoiceRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            audioChunksRef.current = [];
        }
    };

    
    const togglePlayAudio = (msgId: string, audioUrl: string) => {
        if (playingAudioId === msgId) {
            audioPlayerRef.current?.pause();
            setPlayingAudioId(null);
        } else {
            if (audioPlayerRef.current) {
                audioPlayerRef.current.pause();
            }
            const audio = new Audio(audioUrl);
            audioPlayerRef.current = audio;
            audio.play();
            setPlayingAudioId(msgId);
            audio.onended = () => setPlayingAudioId(null);
        }
    };

    
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const success = await sendMessage(inputText.trim(), selectedTimer);
        if (success) {
            setInputText('');
            setSelectedTimer('none');
            setShowEmojiPicker(false);
        }
    };

    return (
        <div className="flex-1 h-full flex bg-[#06090f] relative overflow-hidden select-none">
            
            <div className="flex-1 h-full flex flex-col min-w-0">
                
                
                <div className="px-4 py-3 bg-neutral-950/80 border-b border-neutral-800/80 backdrop-blur-xl flex items-center justify-between shrink-0">
                    <div 
                        onClick={() => setShowDetailsDrawer(true)}
                        className="flex items-center space-x-3 cursor-pointer group min-w-0"
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); onBack(); }}
                            className="md:hidden p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>

                        <Avatar
                            src={partner?.profilePic}
                            name={partner?.firstName || 'Chat'}
                            avatarEmoji={activeChat.isSavedMessages ? '☁️' : undefined}
                            isOnline={partner?.isOnline}
                            size="md"
                        />

                        <div className="min-w-0">
                            <h2 className="text-sm font-bold text-white group-hover:text-cyan-400 transition tracking-wide truncate max-w-[180px] sm:max-w-xs">
                                {activeChat.isSavedMessages
                                    ? "Saved Messages"
                                    : `${partner?.firstName || ''} ${partner?.lastName || ''}`.trim() || `@${partner?.userName || 'user'}`}
                            </h2>
                            <span className="text-[10px] text-neutral-400 font-medium">
                                {activeChat.isSavedMessages ? (
                                    <span className="text-cyan-400 font-semibold">Cloud Storage</span>
                                ) : partner?.isOnline ? (
                                    <span className="text-emerald-400 font-semibold">online</span>
                                ) : (
                                    'click for info'
                                )}
                            </span>
                        </div>
                    </div>

                    
                    <div className="flex items-center space-x-1 sm:space-x-2">
                        {!activeChat.isSavedMessages && (
                            <>
                                <button
                                    onClick={() => {
                                        const socket = getSocket();
                                        socket.emit('call_user', { userToCall: partner?._id || partner?.id, callType: 'audio', chatId: activeChat._id });
                                        setActiveCallSession({ partner, callType: 'audio', isIncoming: false, chatId: activeChat._id });
                                    }}
                                    className="p-2.5 rounded-2xl text-neutral-300 hover:text-cyan-400 hover:bg-neutral-800/60 transition cursor-pointer"
                                    title="Voice Call"
                                >
                                    <Phone className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        const socket = getSocket();
                                        socket.emit('call_user', { userToCall: partner?._id || partner?.id, callType: 'video', chatId: activeChat._id });
                                        setActiveCallSession({ partner, callType: 'video', isIncoming: false, chatId: activeChat._id });
                                    }}
                                    className="p-2.5 rounded-2xl text-neutral-300 hover:text-cyan-400 hover:bg-neutral-800/60 transition cursor-pointer"
                                    title="Video Call"
                                >
                                    <Video className="w-4 h-4" />
                                </button>
                            </>
                        )}
                        <button 
                            onClick={() => setShowDetailsDrawer(true)}
                            className="p-2.5 rounded-2xl text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition cursor-pointer"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
                    {messages.map((msg) => {
                        const senderId = msg.sender?._id || msg.sender;
                        const isMe = senderId?.toString() === currentUserId?.toString();
                        const timeStr = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                        return (
                            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] sm:max-w-[60%] rounded-2xl px-4 py-3 relative ${
                                    isMe 
                                        ? 'bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/10' 
                                        : 'bg-neutral-900 border border-neutral-800 text-neutral-100'
                                }`}>
                                    
                                    
                                    {msg.mediaType === 'voice' && msg.mediaUrl && (
                                        <div className="flex items-center space-x-3 py-1">
                                            <button
                                                type="button"
                                                onClick={() => togglePlayAudio(msg._id, msg.mediaUrl)}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer ${
                                                    isMe ? 'bg-white text-cyan-600' : 'bg-cyan-500 text-neutral-950'
                                                }`}
                                            >
                                                {playingAudioId === msg._id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                                            </button>
                                            <div>
                                                <div className="h-1.5 w-28 sm:w-36 bg-black/20 rounded-full overflow-hidden">
                                                    <div className={`h-full ${playingAudioId === msg._id ? 'bg-white animate-pulse w-full' : 'w-1/3 bg-cyan-200'}`} />
                                                </div>
                                                <span className="text-[10px] opacity-80 mt-1 block">Voice Message</span>
                                            </div>
                                        </div>
                                    )}

                                    
                                    {msg.text && msg.mediaType !== 'voice' && (
                                        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                                    )}

                                    
                                    <div className="flex items-center justify-end space-x-1 mt-1 text-[9px] opacity-75">
                                        <span>{timeStr}</span>
                                        {isMe && <CheckCheck className="w-3 h-3" />}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                
                <div className="p-3 sm:p-4 bg-neutral-950/90 border-t border-neutral-800/80 backdrop-blur-xl shrink-0 relative">
                    
                    
                    {showEmojiPicker && (
                        <EmojiPicker 
                            onSelectEmoji={(emoji) => setInputText(prev => prev + emoji)}
                            onClose={() => setShowEmojiPicker(false)}
                        />
                    )}

                    
                    {isRecording ? (
                        <div className="flex items-center justify-between p-2 rounded-2xl bg-red-500/10 border border-red-500/30 animate-pulse">
                            <div className="flex items-center space-x-3 text-red-400 pl-2">
                                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                                <span className="text-xs font-bold font-mono">
                                    Recording: {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                                </span>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button 
                                    type="button" 
                                    onClick={cancelVoiceRecording}
                                    className="p-2 text-neutral-400 hover:text-red-400 cursor-pointer"
                                    title="Cancel"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <button 
                                    type="button" 
                                    onClick={stopVoiceRecordingAndSend}
                                    className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs flex items-center space-x-1 cursor-pointer"
                                >
                                    <Square className="w-3 h-3 fill-white" />
                                    <span>Send Voice</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        
                        <form onSubmit={handleSend} className="flex items-center space-x-2 sm:space-x-3">
                            
                            
                            <button
                                type="button"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className={`p-2.5 rounded-2xl transition cursor-pointer ${
                                    showEmojiPicker ? 'text-cyan-400 bg-cyan-500/10' : 'text-neutral-400 hover:text-white'
                                }`}
                                title="Emojis & Reactions"
                            >
                                <Smile className="w-5 h-5" />
                            </button>

                            <input
                                type="text"
                                placeholder="Write an encrypted message..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="flex-1 px-4 py-3 bg-neutral-900/80 border border-neutral-800 rounded-2xl text-white placeholder-neutral-600 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 transition"
                            />

                            
                            <button
                                type="button"
                                onClick={startVoiceRecording}
                                className="p-2.5 rounded-2xl text-neutral-400 hover:text-cyan-400 hover:bg-neutral-800/60 transition cursor-pointer"
                                title="Hold/Click to Record Voice Note"
                            >
                                <Mic className="w-5 h-5" />
                            </button>

                            <button
                                type="submit"
                                disabled={!inputText.trim()}
                                className="p-3 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 text-neutral-950 font-bold shadow-lg shadow-cyan-500/25 hover:opacity-95 transition disabled:opacity-40 cursor-pointer"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    )}
                </div>

            </div>

            
            <ChatDetailsDrawer
                activeChat={activeChat}
                isOpen={showDetailsDrawer}
                onClose={() => setShowDetailsDrawer(false)}
            />

            
            <CallModal
                callSession={activeCallSession}
                onEndCall={() => setActiveCallSession(null)}
            />

        </div>
    );
};