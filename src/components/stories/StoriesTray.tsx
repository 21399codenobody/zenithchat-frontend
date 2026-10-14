'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { storyService } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { StoryViewerModal } from './StoryViewerModal';
import { CreateStoryModal } from './CreateStoryModal';

export const StoriesTray: React.FC = () => {
    const [stories, setStories] = useState<any[]>([]);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { user } = useAuthStore();

    const fetchStories = async () => {
        try {
            const res = await storyService.getFeedStories();
            setStories(res.data.stories || []);
        } catch (err) {
            setStories([]);
        }
    };

    useEffect(() => {
        fetchStories();
    }, []);

    const handleOpenStory = (index: number) => {
        setSelectedStoryIndex(index);
        setIsViewerOpen(true);
    };

    return (
        <div className="w-full px-3 py-2.5 border-b border-neutral-800/40 select-none">
            <div className="flex items-center space-x-3 overflow-x-auto custom-scrollbar pb-1">

                
                <div
                    onClick={() => setIsCreateOpen(true)}
                    className="flex flex-col items-center space-y-1 shrink-0 cursor-pointer group"
                >
                    <div className="relative">
                        <Avatar
                            src={user?.profilePic}
                            name={user?.firstName || 'Me'}
                            size="md"
                        />
                        
                        <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-cyan-400 text-neutral-950 font-black text-xs flex items-center justify-center border-2 border-neutral-950 shadow-md">
                            <Plus className="w-3 h-3 stroke-[3]" />
                        </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 group-hover:text-cyan-400 transition font-medium">
                        Your Story
                    </span>
                </div>

                
                {stories.map((story, idx) => {
                    const author = story.user;
                    return (
                        <div
                            key={story._id}
                            onClick={() => handleOpenStory(idx)}
                            className="flex flex-col items-center space-y-1 shrink-0 cursor-pointer group"
                        >
                            
                            <div className="p-0.5 rounded-2xl bg-gradient-to-tr from-sky-400 via-cyan-400 to-blue-500 shadow-sm shadow-cyan-500/20 group-hover:scale-105 transition duration-150">
                                <Avatar
                                    src={author?.profilePic}
                                    name={author?.firstName || 'User'}
                                    size="md"
                                />
                            </div>
                            <span className="text-[10px] text-neutral-300 group-hover:text-cyan-300 transition font-medium truncate max-w-[60px]">
                                {author?.firstName || `@${author?.userName}`}
                            </span>
                        </div>
                    );
                })}

            </div>

            
            <StoryViewerModal
                stories={stories}
                initialIndex={selectedStoryIndex}
                isOpen={isViewerOpen}
                onClose={() => setIsViewerOpen(false)}
            />

            
            <CreateStoryModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={() => fetchStories()}
            />
        </div>
    );
};