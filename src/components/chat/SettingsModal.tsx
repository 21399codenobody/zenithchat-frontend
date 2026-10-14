'use client';

import React, { useState } from 'react';
import {
    X,
    User,
    Shield,
    Camera,
    Check,
    Loader2,
    Eye,
    Lock,
    Sparkles,
    Globe,
    Users,
    UserX
} from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { useAuthStore } from '@/store/useAuthStore';
import { userService, authService } from '@/services/api';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: 'profile' | 'privacy';
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose, initialTab = 'profile' }) => {
    const { user, completeProfile } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'profile' | 'privacy'>(initialTab);

    
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [userName, setUserName] = useState(user?.userName || '');
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(user?.profilePic || null);

    
    const [lastSeenVis, setLastSeenVis] = useState<'everyone' | 'contacts' | 'nobody'>(
        (user as any)?.privacySettings?.lastSeenVisibility || 'everyone'
    );
    const [allowSensitive, setAllowSensitive] = useState<boolean>(
        Boolean((user as any)?.privacySettings?.allowSensitiveContent)
    );

    const [isLoading, setIsLoading] = useState(false);
    const [savedMsg, setSavedMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    
    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError("Avatar size must be less than 5MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSavedMsg(null);

        try {
            const success = await completeProfile({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                userName: userName.trim().toLowerCase(),
                bio: bio.trim(),
                profilePic: previewAvatar || ""
            });

            if (success) {
                setSavedMsg("Profile updated successfully!");
                setTimeout(() => setSavedMsg(null), 3000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update profile.");
        } finally {
            setIsLoading(false);
        }
    };

    
    const handleSavePrivacy = async () => {
        setIsLoading(true);
        setError(null);
        setSavedMsg(null);

        try {
            await userService.updatePrivacy({
                lastSeenVisibility: lastSeenVis,
                allowSensitiveContent: allowSensitive
            });

            
            if (user) {
                (user as any).privacySettings = {
                    lastSeenVisibility: lastSeenVis,
                    allowSensitiveContent: allowSensitive
                };
            }

            setSavedMsg("Privacy settings locked & updated!");
            setTimeout(() => setSavedMsg(null), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update privacy settings.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
            <div className="w-full max-w-md h-[580px] bg-neutral-900 border border-cyan-500/25 rounded-3xl p-6 shadow-2xl shadow-cyan-950/80 flex flex-col justify-between">

                
                <div>
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                        <div className="flex items-center space-x-2 text-cyan-400">
                            <Sparkles className="w-4 h-4" />
                            <h3 className="text-sm font-bold text-white tracking-wide">Account & Vault Settings</h3>
                        </div>
                        <button onClick={onClose} className="p-1 rounded-full text-neutral-400 hover:text-white transition cursor-pointer">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    
                    <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-950/80 border border-neutral-800 rounded-2xl mt-4">
                        <button
                            type="button"
                            onClick={() => { setActiveTab('profile'); setError(null); }}
                            className={`flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === 'profile'
                                ? 'bg-cyan-500 text-neutral-950 shadow-md shadow-cyan-500/20'
                                : 'text-neutral-400 hover:text-white'
                                }`}
                        >
                            <User className="w-3.5 h-3.5" />
                            <span>Edit Profile</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => { setActiveTab('privacy'); setError(null); }}
                            className={`flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === 'privacy'
                                ? 'bg-cyan-500 text-neutral-950 shadow-md shadow-cyan-500/20'
                                : 'text-neutral-400 hover:text-white'
                                }`}
                        >
                            <Shield className="w-3.5 h-3.5" />
                            <span>Privacy & Security</span>
                        </button>
                    </div>
                </div>

                
                {savedMsg && (
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center font-medium">
                        {savedMsg}
                    </div>
                )}
                {error && (
                    <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                        {error}
                    </div>
                )}

                
                {activeTab === 'profile' ? (
                    <form onSubmit={handleUpdateProfile} className="flex-1 overflow-y-auto space-y-4 py-2 custom-scrollbar">

                        
                        <div className="flex flex-col items-center justify-center">
                            <label className="relative cursor-pointer group">
                                <Avatar
                                    src={previewAvatar || undefined}
                                    name={firstName || 'User'}
                                    size="xl"
                                />
                                <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition border border-cyan-400">
                                    <Camera className="w-5 h-5 text-white" />
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarSelect}
                                    className="hidden"
                                />
                            </label>
                            <span className="text-[10px] text-neutral-500 mt-1">Tap avatar to change photo</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">First Name</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Last Name</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Username (@handle)</label>
                            <div className="relative flex items-center">
                                <span className="absolute left-3 text-cyan-400 text-xs font-bold">@</span>
                                <input
                                    type="text"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                    className="w-full pl-7 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Bio (Max 150 chars)</label>
                            <textarea
                                rows={2}
                                maxLength={150}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400 resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 cursor-pointer disabled:opacity-40"
                        >
                            {isLoading ? "Saving Changes..." : "Save Profile Changes"}
                        </button>
                    </form>
                ) : (
                    
                    <div className="flex-1 overflow-y-auto space-y-5 py-3 custom-scrollbar text-left">

                        
                        <div>
                            <div className="mb-2">
                                <span className="text-xs font-bold text-white block">Who can see my Last Seen & Online status?</span>
                                <span className="text-[10px] text-neutral-500">Manage who can see when you were last active.</span>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {(['everyone', 'contacts', 'nobody'] as const).map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setLastSeenVis(opt)}
                                        className={`py-2 px-2 rounded-xl text-xs font-bold capitalize transition border cursor-pointer ${lastSeenVis === opt
                                            ? 'bg-cyan-500/15 border-cyan-500 text-cyan-400'
                                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                                            }`}
                                    >
                                        {opt === 'everyone' ? 'Everyone' : opt === 'contacts' ? 'Contacts' : 'Nobody'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        
                        <div className="p-3.5 rounded-2xl bg-neutral-950/70 border border-neutral-800 flex items-center justify-between">
                            <div>
                                <span className="text-xs font-bold text-white block">Sensitive Content (18+)</span>
                                <span className="text-[10px] text-neutral-500">Show mature and unrestricted public channels</span>
                            </div>

                            <button
                                type="button"
                                onClick={() => setAllowSensitive(!allowSensitive)}
                                className={`w-11 h-6 rounded-full transition p-1 cursor-pointer ${allowSensitive ? 'bg-cyan-500' : 'bg-neutral-800'
                                    }`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-neutral-950 transition-all ${allowSensitive ? 'translate-x-5' : 'translate-x-0'
                                    }`} />
                            </button>
                        </div>

                        
                        <div className="p-3 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-neutral-400 text-[11px] leading-relaxed">
                            <span className="text-cyan-400 font-bold block mb-1">🛡️ Phone Number Shield Active:</span>
                            Your phone number is only visible to mutual contacts who already have you saved in their address book.
                        </div>

                        <button
                            type="button"
                            onClick={handleSavePrivacy}
                            disabled={isLoading}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 cursor-pointer disabled:opacity-40"
                        >
                            {isLoading ? "Locking Privacy..." : "Apply Privacy Rules"}
                        </button>
                    </div>
                )}

                
                <div className="pt-2 border-t border-neutral-800 text-center">
                    <span className="text-[10px] text-neutral-500 font-mono">
                        Zenith Sovereign Protocol v1.0.0
                    </span>
                </div>

            </div>
        </div>
    );
};