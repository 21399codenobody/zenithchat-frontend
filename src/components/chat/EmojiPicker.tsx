'use client';

import React, { useState } from 'react';
import { Smile, Heart, Flame, Sparkles } from 'lucide-react';

interface Props {
    onSelectEmoji: (emoji: string) => void;
    onClose: () => void;
}

const EMOJI_CATEGORIES = [
    {
        name: "Popular",
        icon: Sparkles,
        emojis: ["😀", "😂", "🔥", "❤️", "👍", "😍", "🥳", "😎", "🚀", "⚡", "💯", "👏", "🎉", "😭", "🙏", "🤯"]
    },
    {
        name: "Faces",
        icon: Smile,
        emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😋", "😛", "😜", "🤪", "😝", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑"]
    },
    {
        name: "Gestures",
        icon: Flame,
        emojis: ["👍", "👎", "👊", "✊", "🤛", "🤜", "🤞", "✌️", "🤟", "🤘", "👌", "🤌", "🤏", "👈", "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐️", "🖖", "👋", "🤙", "💪", "🦾", "🖕"]
    },
    {
        name: "Love & Hearts",
        icon: Heart,
        emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"]
    }
];

export const EmojiPicker: React.FC<Props> = ({ onSelectEmoji, onClose }) => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className="absolute bottom-16 right-4 sm:right-16 w-72 sm:w-80 h-72 rounded-3xl bg-neutral-900/95 border border-cyan-500/25 shadow-2xl shadow-cyan-950/80 backdrop-blur-xl z-40 flex flex-col overflow-hidden select-none animate-in zoom-in-95 duration-150">

            
            <div className="flex items-center justify-around p-2 border-b border-neutral-800 bg-neutral-950/40">
                {EMOJI_CATEGORIES.map((cat, idx) => {
                    const Icon = cat.icon;
                    return (
                        <button
                            key={cat.name}
                            onClick={() => setActiveTab(idx)}
                            className={`p-2 rounded-xl transition cursor-pointer ${activeTab === idx
                                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                                : 'text-neutral-400 hover:text-white'
                                }`}
                            title={cat.name}
                        >
                            <Icon className="w-4 h-4" />
                        </button>
                    );
                })}
            </div>

            
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-2 px-1">
                    {EMOJI_CATEGORIES[activeTab].name}
                </span>

                <div className="grid grid-cols-6 sm:grid-cols-7 gap-1">
                    {EMOJI_CATEGORIES[activeTab].emojis.map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => onSelectEmoji(emoji)}
                            className="w-9 h-9 flex items-center justify-center text-xl hover:bg-neutral-800/80 rounded-xl hover:scale-125 transition cursor-pointer"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>

            
            <div className="p-2 border-t border-neutral-800/60 bg-neutral-950/40 text-center">
                <span className="text-[9px] text-neutral-500 font-semibold tracking-wider uppercase">
                    Zenith Reactive Emojis
                </span>
            </div>

        </div>
    );
};