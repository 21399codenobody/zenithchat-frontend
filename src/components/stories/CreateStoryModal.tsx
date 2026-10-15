'use client';

import React, { useState, useRef } from 'react';
import { Camera, Video, X, Loader2, Sparkles } from 'lucide-react';
import { storyService } from '@/services/api';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateStoryModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [mediaBase64, setMediaBase64] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
    const [videoDuration, setVideoDuration] = useState<number>(5);
    const [caption, setCaption] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    // 🎯 বুলেটপ্রুফ ফাইল সিলেক্টর (মুহূর্তেই প্রিভিউ আসবে)
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // সাইজ লিমিট (সর্বোচ্চ 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError("File size exceeds 10MB limit.");
            return;
        }

        const isVideo = file.type.startsWith('video/');
        const tempBlobUrl = URL.createObjectURL(file);
        
        // ১. ইনস্ট্যান্ট স্ক্রিন প্রিভিউ সেট করা (কোনো অপেক্ষা নেই!)
        setMediaPreview(tempBlobUrl);
        setMediaType(isVideo ? 'video' : 'image');
        setError(null);

        // ২. প্যারালালে আসল Base64 ডাটা তৈরি
        const reader = new FileReader();
        reader.onloadend = () => {
            setMediaBase64(reader.result as string);
        };
        reader.readAsDataURL(file);

        // ৩. ভিডিও হলে দৈর্ঘ্য মেপে নেওয়া
        if (isVideo) {
            const videoEl = document.createElement('video');
            videoEl.preload = 'metadata';
            videoEl.src = tempBlobUrl;
            videoEl.onloadedmetadata = () => {
                const dur = Math.round(videoEl.duration) || 15;
                if (dur > 60) {
                    setError("Video duration must be under 60 seconds.");
                    setMediaPreview(null);
                    setMediaBase64(null);
                    return;
                }
                setVideoDuration(dur);
            };
        } else {
            setVideoDuration(5);
        }

        // ইনপুট রিসেট করা যাতে বারবার ফাইল সিলেক্ট করা যায়
        e.target.value = '';
    };

    // স্টোরি পাবলিশ করা
    const handlePostStory = async () => {
        if (!mediaBase64 && !mediaPreview) {
            setError("Please choose an image or video first.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await storyService.createStory({
                mediaUrl: mediaBase64 || mediaPreview,
                mediaType,
                duration: videoDuration,
                caption: caption.trim()
            });

            setIsLoading(false);
            setMediaPreview(null);
            setMediaBase64(null);
            setCaption('');
            onSuccess();
            onClose();
        } catch (err: any) {
            setIsLoading(false);
            setError(err.response?.data?.message || "Failed to publish story.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-cyan-500/25 p-5 shadow-2xl shadow-cyan-950/80 space-y-4">
                
                {/* টপ হেডার */}
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <div className="flex items-center space-x-2 text-cyan-400">
                        <Sparkles className="w-4 h-4" />
                        <h3 className="text-sm font-bold text-white tracking-wide">Publish 24h Story</h3>
                    </div>
                    <button 
                        onClick={() => {
                            setMediaPreview(null);
                            setMediaBase64(null);
                            onClose();
                        }} 
                        className="p-1.5 rounded-full text-neutral-400 hover:text-white transition cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {error && (
                    <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium">
                        {error}
                    </div>
                )}

                {/* ফাইল ইনপুট */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    accept="image/*,video/*" 
                    className="hidden" 
                />

                {/* 🎯 ক্লিকেবল প্রিভিউ বক্স */}
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full h-64 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition overflow-hidden border-2 relative ${
                        mediaPreview 
                            ? 'border-cyan-400/50 bg-black' 
                            : 'border-dashed border-neutral-700 bg-neutral-950/70 hover:border-cyan-400'
                    }`}
                >
                    {mediaPreview ? (
                        mediaType === 'video' ? (
                            <video 
                                src={mediaPreview} 
                                autoPlay 
                                loop 
                                muted 
                                playsInline
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <img src={mediaPreview} alt="Story Preview" className="w-full h-full object-contain" />
                        )
                    ) : (
                        <div className="flex flex-col items-center space-y-2 text-neutral-500 hover:text-cyan-400 transition">
                            <div className="flex space-x-3">
                                <Camera className="w-8 h-8" />
                                <Video className="w-8 h-8" />
                            </div>
                            <span className="text-xs font-semibold">Tap to select Photo or Video</span>
                            <span className="text-[10px] text-neutral-600">Video max 60s • Media max 10MB</span>
                        </div>
                    )}
                </div>

                {/* ক্যাপশন ইনপুট */}
                <input 
                    type="text"
                    maxLength={150}
                    placeholder="Add a story caption (optional)..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 text-xs focus:outline-none focus:border-cyan-400 transition"
                />

                {/* পাবলিশ বাটন */}
                <button
                    onClick={handlePostStory}
                    disabled={isLoading || !mediaPreview}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition disabled:opacity-40 cursor-pointer"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Uploading Story...</span>
                        </span>
                    ) : (
                        `Post ${mediaType === 'video' ? 'Video' : 'Photo'} Story (24h) 🚀`
                    )}
                </button>

            </div>
        </div>
    );
};
