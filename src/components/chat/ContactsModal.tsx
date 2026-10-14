'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    X,
    Search,
    Loader2,
    MessageSquare,
    Phone,
    Sparkles
} from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { userService } from '@/services/api';
import { useChatStore } from '@/store/useChatStore';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSelectUser: (user: any) => void;
}

export const ContactsModal: React.FC<Props> = ({ isOpen, onClose, onSelectUser }) => {
    const [contacts, setContacts] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    
    const [newPhone, setNewPhone] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);

    const { accessOrCreateDirectChat } = useChatStore();

    
    const fetchContacts = async () => {
        setIsLoading(true);
        try {
            const res = await userService.getContacts();
            setContacts(res.data.contacts || []);
        } catch (err) {
            console.error("Failed to load contacts:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchContacts();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    
    const handleAddContact = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddError(null);

        const cleanPhone = newPhone.trim().replace(/\D/g, '');
        if (cleanPhone.length < 6) {
            setAddError("Please enter a valid phone number.");
            return;
        }

        setIsAdding(true);
        try {
            
            const res = await userService.syncContacts([cleanPhone]);
            const foundUsers = res.data.users || res.data.contacts || [];

            if (foundUsers.length > 0) {
                setNewPhone('');
                await fetchContacts();
                alert(`Found ${foundUsers[0].firstName || 'User'} on Zenith! Added to contacts.`);
            } else {
                setAddError("No registered user found with this number.");
            }
        } catch (err: any) {
            setAddError(err.response?.data?.message || "Failed to add contact.");
        } finally {
            setIsAdding(false);
        }
    };

    
    const handleStartChat = async (targetUserId: string) => {
        const chat = await accessOrCreateDirectChat(targetUserId);
        if (chat) {
            onSelectUser(chat);
            onClose();
        }
    };

    
    const filteredContacts = contacts.filter((c: any) => {
        const name = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
        const username = (c.userName || '').toLowerCase();
        const phone = (c.phoneNumber || '').toLowerCase();
        const q = searchQuery.toLowerCase();
        return name.includes(q) || username.includes(q) || phone.includes(q);
    });

    return (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
            <div className="w-full max-w-md h-[580px] bg-neutral-900 border border-cyan-500/25 rounded-3xl p-6 shadow-2xl shadow-cyan-950/80 flex flex-col justify-between">

                
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <div className="flex items-center space-x-2 text-cyan-400">
                        <Users className="w-5 h-5" />
                        <h3 className="text-sm font-bold text-white tracking-wide">Contacts Directory</h3>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-neutral-400 hover:text-white transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                
                <form onSubmit={handleAddContact} className="mt-3">
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                            <input
                                type="tel"
                                placeholder="Add friend by phone (e.g. 017...)"
                                value={newPhone}
                                onChange={(e) => setNewPhone(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 text-xs focus:outline-none focus:border-cyan-400 transition"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isAdding || newPhone.trim().length < 6}
                            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs transition disabled:opacity-40 cursor-pointer shrink-0 flex items-center space-x-1"
                        >
                            {isAdding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                            <span>Add</span>
                        </button>
                    </div>
                    {addError && <p className="text-[10px] text-red-400 mt-1 pl-1">{addError}</p>}
                </form>

                
                <div className="relative my-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Filter contacts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-neutral-950/60 border border-neutral-800/80 rounded-xl text-white placeholder-neutral-600 text-xs focus:outline-none focus:border-cyan-400 transition"
                    />
                </div>

                
                <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-12 text-cyan-400">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            <span className="text-xs">Loading directory...</span>
                        </div>
                    ) : filteredContacts.length > 0 ? (
                        filteredContacts.map((c: any) => (
                            <div
                                key={c._id}
                                className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-neutral-800/60 transition group"
                            >
                                <div className="flex items-center space-x-3 min-w-0">
                                    <Avatar
                                        src={c.profilePic}
                                        name={c.firstName || 'User'}
                                        size="sm"
                                        isOnline={c.isOnline}
                                    />
                                    <div className="min-w-0">
                                        <h4 className="text-xs font-bold text-white truncate">
                                            {`${c.firstName || ''} ${c.lastName || ''}`.trim() || `@${c.userName}`}
                                        </h4>
                                        <p className="text-[10px] text-neutral-400 truncate">
                                            {c.phoneNumber || `@${c.userName || 'user'}`}
                                        </p>
                                    </div>
                                </div>

                                
                                <button
                                    onClick={() => handleStartChat(c._id)}
                                    className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-neutral-950 transition cursor-pointer shrink-0 ml-2"
                                    title="Message"
                                >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center p-8 text-neutral-500 text-xs space-y-1">
                            <Users className="w-6 h-6 mx-auto text-neutral-600 mb-1" />
                            <p className="font-semibold text-neutral-400">No contacts found</p>
                            <p className="text-[10px]">Add your friends by entering their phone number above!</p>
                        </div>
                    )}
                </div>

                
                <div className="pt-3 border-t border-neutral-800 text-center">
                    <span className="text-[10px] text-neutral-500 font-medium">
                        Total {contacts.length} Contacts Synced
                    </span>
                </div>

            </div>
        </div>
    );
};