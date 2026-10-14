'use client';

import React, { useState } from 'react';
import { Users, Radio, X, Loader2, Sparkles, Globe, Lock, Hash } from 'lucide-react';
import { groupService, channelService } from '@/services/api';
import { useChatStore } from '@/store/useChatStore';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const CATEGORIES = [
    'general', 'tech', 'crypto', 'business', 'gaming',
    'movies', 'music', 'fitness', 'education'
];

export const CreateEntityModal: React.FC<Props> = ({ isOpen, onClose }) => {
    
    const [entityType, setEntityType] = useState<'group' | 'channel'>('group');

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [userName, setUserName] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [category, setCategory] = useState('general');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { fetchChats, setActiveChat } = useChatStore();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError(`${entityType === 'group' ? 'Group' : 'Channel'} name is required.`);
            return;
        }

        if (isPublic && userName.trim() && userName.trim().length < 4) {
            setError("Public username must be at least 4 characters.");
            return;
        }

        setIsLoading(true);

        try {
            const payload: any = {
                name: name.trim(),
                description: description.trim(),
                category,
                userName: isPublic && userName.trim() ? userName.trim().toLowerCase() : undefined
            };

            let res;
            if (entityType === 'group') {
                payload.groupType = isPublic ? 'public' : 'private';
                res = await groupService.createGroup(payload);
            } else {
                payload.channelType = isPublic ? 'public' : 'private';
                res = await channelService.createChannel(payload);
            }

            const createdChat = res.data.group || res.data.channel;

            await fetchChats();
            if (createdChat) {
                setActiveChat({ ...createdChat, chatType: entityType });
            }

            
            setName('');
            setDescription('');
            setUserName('');
            setIsLoading(false);
            onClose();

        } catch (err: any) {
            setIsLoading(false);
            setError(err.response?.data?.message || `Failed to create ${entityType}.`);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-neutral-900 border border-cyan-500/25 rounded-3xl p-6 shadow-2xl shadow-cyan-950/80 space-y-5">

                
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <div className="flex items-center space-x-2 text-cyan-400">
                        <Sparkles className="w-4 h-4" />
                        <h3 className="text-sm font-bold text-white tracking-wide">
                            Create New {entityType === 'group' ? 'Supergroup' : 'Broadcast Channel'}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                
                {error && (
                    <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                        {error}
                    </div>
                )}

                
                <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-950/80 border border-neutral-800 rounded-2xl">
                    <button
                        type="button"
                        onClick={() => { setEntityType('group'); setError(null); }}
                        className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${entityType === 'group'
                            ? 'bg-cyan-500 text-neutral-950 shadow-md shadow-cyan-500/20'
                            : 'text-neutral-400 hover:text-white'
                            }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>Supergroup</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => { setEntityType('channel'); setError(null); }}
                        className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${entityType === 'channel'
                            ? 'bg-cyan-500 text-neutral-950 shadow-md shadow-cyan-500/20'
                            : 'text-neutral-400 hover:text-white'
                            }`}
                    >
                        <Radio className="w-4 h-4" />
                        <span>Channel</span>
                    </button>
                </div>

                
                <form onSubmit={handleSubmit} className="space-y-4">

                    
                    <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                            {entityType === 'group' ? 'Group' : 'Channel'} Name *
                        </label>
                        <input
                            type="text"
                            placeholder={entityType === 'group' ? 'e.g. Cyber Security Hub' : 'e.g. Daily Tech Radar'}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-cyan-400 transition"
                            autoFocus
                        />
                    </div>

                    
                    <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                            Description (Optional)
                        </label>
                        <textarea
                            rows={2}
                            placeholder="What is this community about?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400 transition resize-none"
                        />
                    </div>

                    
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                                Privacy Mode
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsPublic(!isPublic)}
                                className={`w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${isPublic
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                    : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                                    }`}
                            >
                                {isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                <span>{isPublic ? 'Public' : 'Private'}</span>
                            </button>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                                Category
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs capitalize focus:outline-none focus:border-cyan-400 cursor-pointer"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat} className="bg-neutral-900">{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    
                    {isPublic && (
                        <div>
                            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                                Public Link / Handle (@username)
                            </label>
                            <div className="relative flex items-center">
                                <span className="absolute left-3 text-cyan-400 font-bold text-xs">@</span>
                                <input
                                    type="text"
                                    placeholder="unique_handle"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                    className="w-full pl-7 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400 transition"
                                />
                            </div>
                        </div>
                    )}

                    
                    <button
                        type="submit"
                        disabled={isLoading || !name.trim()}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 hover:opacity-95 transition disabled:opacity-40 cursor-pointer mt-2"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center space-x-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Creating {entityType}...</span>
                            </span>
                        ) : (
                            `Launch ${entityType === 'group' ? 'Supergroup' : 'Broadcast Channel'} 🚀`
                        )}
                    </button>

                </form>

            </div>
        </div>
    );
};