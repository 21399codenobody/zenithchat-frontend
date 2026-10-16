'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { storyService } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { StoryViewerModal } from './StoryViewerModal';
import { CreateStoryModal } from './CreateStoryModal';

interface UserStoryGroup {
    user: any;
    stories: any[];
}

export const StoriesTray: React.FC = () => {
    const [groupedStories, setGroupedStories] = useState<UserStoryGroup[]>([]);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [activeStoryGroup, setActiveStoryGroup] = useState<any[]>([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { user } = useAuthStore();
    const currentUserId = user?.id || user?._id;

    const fetchStories = async () => {
        try {
            const res = await storyService.getFeedStories();
            const rawStories: any[] = res.data?.stories || [];


            const groups: UserStoryGroup[] = [];
            rawStories.forEach((story) => {
                const authorId = (story.user?._id || story.user)?.toString();
                if (!authorId) return;

                const existing = groups.find(g => (g.user?._id || g.user)?.toString() === authorId);
                if (existing) {
                    existing.stories.push(story);
                } else {
                    groups.push({
                        user: story.user,
                        stories: [story]
                    });
                }
            });

            setGroupedStories(groups);
        } catch (err) {
            setGroupedStories([]);
        }
    };

    useEffect(() => {
        fetchStories();
    }, [user?.firstName, user?.lastName]);

    const handleOpenUserStories = (userStories: any[]) => {
        setActiveStoryGroup(userStories);
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


                {groupedStories.map((group) => {
                    const author = group.user;
                    const isMe = (author?._id || author)?.toString() === currentUserId?.toString();


                    const displayName = isMe
                        ? (user?.firstName || 'You')
                        : (author?.firstName || `@${author?.userName || 'User'}`);

                    return (
                        <div
                            key={(author?._id || author).toString()}
                            onClick={() => handleOpenUserStories(group.stories)}
                            className="flex flex-col items-center space-y-1 shrink-0 cursor-pointer group"
                        >

                            <div className="p-0.5 rounded-2xl bg-gradient-to-tr from-sky-400 via-cyan-400 to-blue-500 shadow-sm shadow-cyan-500/20 group-hover:scale-105 transition duration-150">
                                <Avatar
                                    src={isMe ? (user?.profilePic || author?.profilePic) : author?.profilePic}
                                    name={displayName}
                                    size="md"
                                />
                            </div>
                            <span className="text-[10px] text-neutral-300 group-hover:text-cyan-300 transition font-medium truncate max-w-[60px]">
                                {displayName}
                            </span>
                        </div>
                    );
                })}

            </div>


            <StoryViewerModal
                stories={activeStoryGroup}
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
