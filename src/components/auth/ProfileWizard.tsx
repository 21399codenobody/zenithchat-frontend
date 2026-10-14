'use client';

import React, { useState, useRef } from 'react';
import { Camera, Trash2, Loader2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface Props {
    onComplete: () => void;
}

export const ProfileWizard: React.FC<Props> = ({ onComplete }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bio, setBio] = useState('');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { completeProfile, isLoading, error: serverError } = useAuthStore();

    
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setLocalError("Image size must be less than 5MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (!firstName.trim()) {
            setLocalError("First name is mandatory!");
            return;
        }

        const success = await completeProfile({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            bio: bio.trim(),
            profilePic: previewImage || ""
        });

        if (success) {
            onComplete();
        }
    };

    return (
        <div className="w-full max-w-[420px] mx-auto p-5 sm:p-7 rounded-3xl bg-neutral-900/80 backdrop-blur-2xl border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.12)]">

            <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white tracking-wide">
                    Profile Info
                </h2>
                <p className="text-neutral-400 text-xs mt-1">
                    Please provide your name and an optional profile photo.
                </p>
            </div>

            {(localError || serverError) && (
                <div className="mb-4 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                    {localError || serverError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

                
                <div className="text-center mb-4">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        className="hidden"
                    />
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center cursor-pointer transition overflow-hidden relative ${previewImage
                            ? 'border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                            : 'bg-neutral-950/70 border-2 border-dashed border-neutral-700 hover:border-cyan-400'
                            }`}
                    >
                        {previewImage ? (
                            <img src={previewImage} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <Camera className="w-7 h-7 text-neutral-500 hover:text-cyan-400 transition" />
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">First Name *</label>
                    <input
                        type="text"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-neutral-950/70 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400 transition"
                        autoFocus
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Last Name (Optional)</label>
                    <input
                        type="text"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-neutral-950/70 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400 transition"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Bio (Optional)</label>
                    <input
                        type="text"
                        placeholder="Hey there! I am using Zenith."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-neutral-950/70 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400 transition"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !firstName.trim()}
                    className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition disabled:opacity-40 cursor-pointer mt-4"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Setting up Account...</span>
                        </>
                    ) : (
                        <>
                            <span>Finish & Enter Chat</span>
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};