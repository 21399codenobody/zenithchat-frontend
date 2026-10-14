'use client';

import React, { useState, useEffect } from 'react';
import {
    Phone,
    PhoneOff,
    Mic,
    MicOff,
    Video,
    VideoOff,
    ShieldCheck
} from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { getSocket } from '@/services/socket';

export interface CallSession {
    partner: any;
    callType: 'audio' | 'video';
    isIncoming: boolean;
    chatId?: string;
    signal?: any;
}

interface Props {
    callSession: CallSession | null;
    onEndCall: () => void;
}

export const CallModal: React.FC<Props> = ({ callSession, onEndCall }) => {
    const [callStatus, setCallStatus] = useState<'ringing' | 'connected'>('ringing');
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    useEffect(() => {
        let interval: any;
        if (callStatus === 'connected') {
            interval = setInterval(() => setDuration(prev => prev + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [callStatus]);

    useEffect(() => {
        if (!callSession) return;
        const socket = getSocket();

        socket.on('call_accepted', () => setCallStatus('connected'));
        socket.on('call_ended', () => onEndCall());
        socket.on('call_rejected', () => { alert("Call declined."); onEndCall(); });
        socket.on('call_busy', () => { alert("User is busy."); onEndCall(); });

        return () => {
            socket.off('call_accepted');
            socket.off('call_ended');
            socket.off('call_rejected');
            socket.off('call_busy');
        };
    }, [callSession, onEndCall]);

    if (!callSession) return null;

    const { partner, callType, isIncoming } = callSession;

    const handleAcceptCall = () => {
        const socket = getSocket();
        socket.emit('answer_call', {
            to: partner?._id || partner?.id,
            signal: { accepted: true }
        });
        setCallStatus('connected');
    };

    const handleHangup = () => {
        const socket = getSocket();
        if (isIncoming && callStatus === 'ringing') {
            socket.emit('reject_call', { to: partner?._id || partner?.id });
        } else {
            socket.emit('end_call', {
                to: partner?._id || partner?.id,
                duration,
                callType,
                chatId: callSession.chatId
            });
        }
        onEndCall();
    };

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
            <div className="w-full max-w-sm sm:max-w-md h-[540px] rounded-3xl bg-neutral-900/90 border border-cyan-500/25 shadow-2xl shadow-cyan-950/80 flex flex-col items-center justify-between p-6 relative overflow-hidden">

                
                <div className="w-full flex items-center justify-between text-neutral-400 text-xs">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold uppercase tracking-wider text-[10px]">
                        <ShieldCheck className="w-3 h-3" />
                        <span>E2EE {callType} Call</span>
                    </span>
                    <span className="font-semibold text-neutral-300">
                        {callStatus === 'connected' ? formatTime(duration) : (isIncoming ? 'Incoming...' : 'Ringing...')}
                    </span>
                </div>

                
                <div className="flex flex-col items-center justify-center my-auto space-y-4">
                    <Avatar
                        src={partner?.profilePic}
                        name={partner?.firstName || partner?.userName || 'User'}
                        size="xl"
                    />
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-white tracking-wide truncate max-w-xs">
                            {partner ? `${partner.firstName || ''} ${partner.lastName || ''}`.trim() || `@${partner.userName}` : 'Zenith User'}
                        </h2>
                        <p className="text-xs text-neutral-400 mt-1">
                            {partner?.phoneNumber || `@${partner?.userName || 'user'}`}
                        </p>
                    </div>
                </div>

                
                <div className="w-full pt-4 border-t border-neutral-800/80 flex items-center justify-center space-x-4">
                    {isIncoming && callStatus === 'ringing' ? (
                        <>
                            <button
                                onClick={handleHangup}
                                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30 transition hover:scale-105 active:scale-95 cursor-pointer"
                            >
                                <PhoneOff className="w-6 h-6" />
                            </button>
                            <button
                                onClick={handleAcceptCall}
                                className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 transition hover:scale-105 active:scale-95 cursor-pointer animate-bounce"
                            >
                                <Phone className="w-6 h-6" />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className={`p-3.5 rounded-full border transition cursor-pointer ${isMuted ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-neutral-800 border-neutral-700 text-neutral-200'
                                    }`}
                            >
                                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>

                            {callType === 'video' && (
                                <button
                                    onClick={() => setIsVideoOff(!isVideoOff)}
                                    className={`p-3.5 rounded-full border transition cursor-pointer ${isVideoOff ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-neutral-800 border-neutral-700 text-neutral-200'
                                        }`}
                                >
                                    {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                                </button>
                            )}

                            <button
                                onClick={handleHangup}
                                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30 transition hover:scale-105 active:scale-95 cursor-pointer ml-2"
                            >
                                <PhoneOff className="w-6 h-6" />
                            </button>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};