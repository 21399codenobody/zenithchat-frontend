'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { storyService } from '@/services/api';

interface Story {
    _id: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    duration?: number;
    caption?: string;
    createdAt: string;
    user: any;
}

interface Props {
    stories: Story[];
    initialIndex?: number;
    isOpen: boolean;
    onClose: () => void;
}

export const StoryViewerModal: React.FC<Props> = ({
    stories,
    initialIndex = 0,
    isOpen,
    onClose
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [progress, setProgress] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const currentStory = stories[currentIndex];

    
    useEffect(() => {
        if (!isOpen || !currentStory) return;
        storyService.viewStory(currentStory._id).catch(() => { });
        setProgress(0);
    }, [currentIndex, isOpen, currentStory]);

    
    useEffect(() => {
        if (!isOpen || !currentStory) return;

        
        if (currentStory.mediaType === 'image') {
            const stepDuration = 50;
            const totalDuration = 5000;
            const increment = (stepDuration / totalDuration) * 100;

            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        handleNext();
                        return 0;
                    }
                    return prev + increment;
                });
            }, stepDuration);

            return () => clearInterval(interval);
        }
    }, [currentIndex, isOpen, currentStory]);

    if (!isOpen || !currentStory) return null;

    const author = currentStory.user;

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(idx => idx - 1);
            setProgress(0);
        }
    };

    const handleNext = () => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(idx => idx + 1);
            setProgress(0);
        } else {
            onClose();
        }
    };

    
    const handleVideoTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const total = videoRef.current.duration || 1;
            setProgress((current / total) * 100);
        }
    };

    return (
        
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4 select-none animate-in fade-in duration-200">

            <div className="relative w-full max-w-sm h-full max-h-[88vh] bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl shadow-cyan-950/80 flex flex-col justify-between">

                
                <div className="absolute top-3 inset-x-3 z-30 flex items-center space-x-1.5">
                    {stories.map((s, idx) => (
                        <div key={s._id} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-cyan-400 transition-all duration-75 ease-linear"
                                style={{
                                    width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? '100%' : '0%'
                                }}
                            />
                        </div>
                    ))}
                </div>

                
                <div className="absolute top-6 inset-x-4 z-30 flex items-center justify-between text-white">
                    <div className="flex items-center space-x-2.5">
                        <Avatar
                            src={author?.profilePic}
                            name={author?.firstName || 'User'}
                            size="sm"
                        />
                        <div>
                            <h4 className="text-xs font-bold truncate max-w-[140px]">
                                {author ? `${author.firstName || ''} ${author.lastName || ''}`.trim() || `@${author.userName}` : 'User'}
                            </h4>
                            <span className="text-[10px] text-neutral-400">
                                {new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {currentStory.mediaType === 'video' && (
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 cursor-pointer"
                            >
                                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-full bg-black/50 text-neutral-300 hover:text-white hover:bg-black/70 cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                
                <div className="w-full h-full flex items-center justify-center bg-black">
                    {currentStory.mediaType === 'video' ? (
                        <video
                            ref={videoRef}
                            src={currentStory.mediaUrl}
                            autoPlay
                            playsInline
                            muted={isMuted}
                            onTimeUpdate={handleVideoTimeUpdate}
                            onEnded={handleNext}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <img
                            src={currentStory.mediaUrl}
                            alt="Story"
                            className="w-full h-full object-contain"
                        />
                    )}
                </div>

                
                {currentStory.caption && (
                    <div className="absolute bottom-6 inset-x-4 z-30 p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-center">
                        <p className="text-xs text-white leading-relaxed">{currentStory.caption}</p>
                    </div>
                )}

                
                <button
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 z-20 cursor-pointer"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 z-20 cursor-pointer"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>

            </div>
        </div>
    );
};