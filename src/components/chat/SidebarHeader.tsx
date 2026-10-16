'use client';

import React, { useState, useEffect } from 'react';
import {
    ShieldCheck,
    Settings,
    LogOut,
    Lock,
    Plus,
    User,
    Users,
    Sun,
    Moon
} from 'lucide-react';
import { ZenithLogo } from '@/components/common/ZenithLogo';
import { CreateEntityModal } from '@/components/entities/CreateEntityModal';
import { SettingsModal } from '@/components/chat/SettingsModal';
import { ContactsModal } from '@/components/chat/ContactsModal';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';

export const SidebarHeader: React.FC = () => {
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showContactsModal, setShowContactsModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [settingsTab, setSettingsTab] = useState<'profile' | 'privacy'>('profile');


    const [isDarkMode, setIsDarkMode] = useState(true);

    const { user, logout } = useAuthStore();
    const { setActiveChat } = useChatStore();

    const displayUsername = user?.userName || 'user';


    const toggleTheme = () => {
        const root = document.documentElement;
        if (isDarkMode) {
            root.classList.remove('dark');
            setIsDarkMode(false);
        } else {
            root.classList.add('dark');
            setIsDarkMode(true);
        }
    };

    return (
        <div className="p-4 flex items-center justify-between border-b border-neutral-800/60 relative select-none">


            <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 p-1 flex items-center justify-center shadow-lg shadow-cyan-500/10 shrink-0">
                    <ZenithLogo className="w-8 h-8" glow={false} />
                </div>
                <div className="min-w-0">
                    <h2 className="text-sm font-bold text-white tracking-wide truncate max-w-[120px] sm:max-w-[150px]">
                        @{displayUsername}
                    </h2>
                    <span className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase flex items-center">
                        <Lock className="w-3 h-3 inline mr-1 text-cyan-400 shrink-0" />
                        <span>E2E Encrypted</span>
                    </span>
                </div>
            </div>


            <div className="flex items-center space-x-1.5 relative">


                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-2xl text-neutral-400 hover:text-cyan-400 hover:bg-neutral-800/60 transition cursor-pointer"
                    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
                </button>


                <button
                    onClick={() => setShowCreateModal(true)}
                    className="p-2.5 rounded-2xl text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 transition cursor-pointer"
                    title="Create Group or Channel"
                >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>


                <button
                    onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                    className="p-2.5 rounded-2xl text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition cursor-pointer"
                    title="Settings"
                >
                    <Settings className="w-5 h-5" />
                </button>


                {showSettingsMenu && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowSettingsMenu(false)} />

                        <div className="absolute right-0 top-12 w-56 rounded-2xl bg-neutral-900 border border-cyan-500/20 shadow-2xl shadow-cyan-950/80 p-2 z-50 divide-y divide-neutral-800/60 animate-in fade-in zoom-in-95 duration-150">
                            <div className="px-3 py-2">
                                <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Active Identity</p>
                                <p className="text-xs font-semibold text-cyan-400 truncate">@{displayUsername}</p>
                            </div>

                            <div className="py-1 space-y-0.5">
                                <button
                                    onClick={() => { setShowSettingsMenu(false); setShowContactsModal(true); }}
                                    className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/80 rounded-xl transition cursor-pointer font-medium"
                                >
                                    <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                    <span>Contacts Directory</span>
                                </button>

                                <button
                                    onClick={() => { setShowSettingsMenu(false); setSettingsTab('profile'); setShowSettingsModal(true); }}
                                    className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/80 rounded-xl transition cursor-pointer font-medium"
                                >
                                    <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                    <span>Edit Profile</span>
                                </button>

                                <button
                                    onClick={() => { setShowSettingsMenu(false); setSettingsTab('privacy'); setShowSettingsModal(true); }}
                                    className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/80 rounded-xl transition cursor-pointer font-medium"
                                >
                                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                    <span>Privacy & Security</span>
                                </button>
                            </div>

                            <div className="pt-1">
                                <button
                                    onClick={() => { setShowSettingsMenu(false); logout(); }}
                                    className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition cursor-pointer font-semibold"
                                >
                                    <LogOut className="w-3.5 h-3.5 shrink-0" />
                                    <span>Log Out</span>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>


            <CreateEntityModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
            <SettingsModal isOpen={showSettingsModal} initialTab={settingsTab} onClose={() => setShowSettingsModal(false)} />
            <ContactsModal isOpen={showContactsModal} onClose={() => setShowContactsModal(false)} onSelectUser={(chat) => setActiveChat(chat)} />

        </div>
    );
};
