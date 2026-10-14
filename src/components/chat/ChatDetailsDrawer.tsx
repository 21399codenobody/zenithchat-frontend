'use client';

import React, { useState } from 'react';
import {
    X,
    Bell,
    BellOff,
    ShieldAlert,
    Trash2,
    Users,
    Radio,
    Lock,
    Link as LinkIcon,
    Copy,
    Check,
    ShieldCheck,
    UserMinus,
    Crown,
    Clock,
    UserX,
    LogOut,
    Sparkles
} from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { userService, groupService, channelService, inviteService } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';

interface Props {
    activeChat: any;
    isOpen: boolean;
    onClose: () => void;
}

export const ChatDetailsDrawer: React.FC<Props> = ({ activeChat, isOpen, onClose }) => {
    const { user } = useAuthStore();
    const { fetchChats, clearActiveChat } = useChatStore();
    const currentUserId = user?.id || user?._id;

    const [isMuted, setIsMuted] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);

    
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    
    const [slowMode, setSlowMode] = useState<string>(activeChat?.slowMode || 'off');

    if (!isOpen || !activeChat) return null;

    const isGroup = activeChat.chatType === 'group';
    const isChannel = activeChat.chatType === 'channel';
    const isDirect = !isGroup && !isChannel;

    
    const isOwner = (activeChat.owner?._id || activeChat.owner)?.toString() === currentUserId?.toString();
    const isAdmin = isOwner || activeChat.admins?.some((a: any) => (a.user?._id || a.user)?.toString() === currentUserId?.toString());

    const partner = isDirect ? (activeChat.participants?.[0] || {}) : null;

    
    const handleGenerateInviteLink = async () => {
        setIsActionLoading(true);
        try {
            const res = await inviteService.createInviteLink({
                entityType: isGroup ? 'Group' : 'Channel',
                entityId: activeChat._id,
                linkName: `${activeChat.name} Invite`
            });
            const code = res.data.inviteLink?.linkCode;
            if (code) {
                const fullUrl = `${window.location.origin}/invite/${code}`;
                setInviteLink(fullUrl);
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to generate invite link.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleCopyInvite = () => {
        if (!inviteLink) return;
        navigator.clipboard.writeText(inviteLink);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    
    const handleUpdateSlowMode = async (mode: string) => {
        setSlowMode(mode);
        try {
            await groupService.updateSettings(activeChat._id, { slowMode: mode });
        } catch (err) {
            console.error("Slow mode update failed:", err);
        }
    };

    
    const handleManageMember = async (targetUserId: string, action: 'ban' | 'remove') => {
        if (!confirm(`Are you sure you want to ${action} this user?`)) return;
        try {
            await groupService.manageMembers(activeChat._id, { targetUserId, action });
            await fetchChats();
            alert(`User ${action}ned successfully.`);
        } catch (err: any) {
            alert(err.response?.data?.message || `Failed to ${action} user.`);
        }
    };

    const handlePromoteAdmin = async (targetUserId: string) => {
        if (!confirm("Promote this user to Admin?")) return;
        try {
            await groupService.manageAdmins(activeChat._id, { targetUserId, action: 'promote' });
            await fetchChats();
            alert("User promoted to Admin!");
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to promote admin.");
        }
    };

    
    const handleLeaveEntity = async () => {
        if (!confirm(`Are you sure you want to leave ${activeChat.name}?`)) return;
        try {
            if (isGroup) {
                await groupService.leaveGroup(activeChat._id);
            } else {
                await channelService.toggleSubscribe(activeChat._id);
            }
            await fetchChats();
            clearActiveChat();
            onClose();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to leave.");
        }
    };

    const handleDeleteEntity = async () => {
        if (!confirm(`DANGER: Permanently delete ${activeChat.name}? This cannot be undone.`)) return;
        try {
            if (isGroup) {
                await groupService.deleteGroup(activeChat._id);
            } else {
                await channelService.deleteChannel(activeChat._id);
            }
            await fetchChats();
            clearActiveChat();
            onClose();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to delete.");
        }
    };

    return (
        <aside className="w-full sm:w-[380px] h-full flex flex-col bg-neutral-950/98 border-l border-neutral-800/80 backdrop-blur-2xl z-40 select-none animate-in slide-in-from-right duration-200">

            
            <div className="p-4 flex items-center justify-between border-b border-neutral-800/60">
                <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-white tracking-wide">
                        {isGroup ? "Supergroup Governance" : isChannel ? "Channel Dashboard" : "Encrypted User Info"}
                    </h3>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer">
                    <X className="w-5 h-5" />
                </button>
            </div>

            
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar text-left">

                
                <div className="flex flex-col items-center text-center space-y-3">
                    <Avatar
                        src={activeChat.profilePic || partner?.profilePic}
                        name={activeChat.name || partner?.firstName || 'Chat'}
                        size="xl"
                        isOnline={partner?.isOnline}
                    />

                    <div>
                        <div className="flex items-center justify-center space-x-1.5">
                            <h2 className="text-lg font-bold text-white tracking-wide truncate max-w-xs">
                                {isDirect
                                    ? `${partner?.firstName || ''} ${partner?.lastName || ''}`.trim() || `@${partner?.userName}`
                                    : activeChat.name}
                            </h2>
                            {isOwner && (<span title='You are Owner' className='shrink-0 flex items-center'><Crown className='w-4 h-4 text-amber-400' /></span>)}
                        </div>

                        <p className="text-xs text-neutral-400 mt-0.5">
                            {isDirect && (partner?.phoneNumber || `@${partner?.userName}`)}
                            {isGroup && `${activeChat.members?.length || 0} members • ${isOwner ? 'Owner' : isAdmin ? 'Admin' : 'Member'}`}
                            {isChannel && `${activeChat.subscribers?.length || 0} subscribers • Broadcast Channel`}
                        </p>
                    </div>

                    
                    <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold tracking-wider uppercase">
                        <Lock className="w-3 h-3" />
                        <span>{isOwner ? "Sovereign Creator" : isAdmin ? "Authorized Admin" : "Verified Participant"}</span>
                    </div>
                </div>

                
                {(partner?.bio || activeChat.description) && (
                    <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 space-y-1">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">About / Description</span>
                        <p className="text-xs text-neutral-300 leading-relaxed">
                            {partner?.bio || activeChat.description}
                        </p>
                    </div>
                )}

                
                {(isGroup || isChannel) && isAdmin && (
                    <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">10-Digit Smart Invite Link</span>
                            <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full">Zero-Trace</span>
                        </div>

                        {inviteLink ? (
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={inviteLink}
                                    className="flex-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white truncate font-mono"
                                />
                                <button
                                    onClick={handleCopyInvite}
                                    className="p-2.5 rounded-xl bg-cyan-500 text-neutral-950 hover:bg-cyan-400 font-bold transition cursor-pointer"
                                    title="Copy Link"
                                >
                                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleGenerateInviteLink}
                                disabled={isActionLoading}
                                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold transition cursor-pointer"
                            >
                                <LinkIcon className="w-3.5 h-3.5" />
                                <span>{isActionLoading ? "Generating..." : "Generate 10-Char Link"}</span>
                            </button>
                        )}
                    </div>
                )}

                
                {isGroup && isOwner && (
                    <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 space-y-2">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
                                <Clock className="w-3.5 h-3.5 text-amber-400" />
                                <span>Slow Mode Interval</span>
                            </div>
                            <span className="text-[10px] text-neutral-400 uppercase font-bold">{slowMode}</span>
                        </div>
                        <p className="text-[10px] text-neutral-500 leading-relaxed">Limit how often members can send messages.</p>

                        <div className="grid grid-cols-5 gap-1 pt-1">
                            {['off', '5s', '10s', '30s', '1m'].map((mode) => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => handleUpdateSlowMode(mode)}
                                    className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition border cursor-pointer ${slowMode === mode
                                        ? 'bg-amber-500 text-neutral-950 border-amber-500'
                                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                                        }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                
                {isGroup && activeChat.members && (
                    <div className="space-y-2">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-1 block">
                            Community Members ({activeChat.members.length})
                        </span>

                        <div className="space-y-1.5 bg-neutral-900/40 border border-neutral-800/60 rounded-2xl p-2.5 max-h-56 overflow-y-auto custom-scrollbar">
                            {activeChat.members.map((m: any) => {
                                const mId = (m._id || m).toString();
                                const isMemberOwner = (activeChat.owner?._id || activeChat.owner)?.toString() === mId;
                                const isMemberAdmin = isMemberOwner || activeChat.admins?.some((a: any) => (a.user?._id || a.user)?.toString() === mId);

                                return (
                                    <div key={mId} className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-800/50 transition group">
                                        <div className="flex items-center space-x-2.5 min-w-0">
                                            <Avatar src={m.profilePic} name={m.firstName || 'User'} size="sm" isOnline={m.isOnline} />
                                            <div className="min-w-0">
                                                <div className="flex items-center space-x-1">
                                                    <p className="text-xs font-bold text-white truncate">{m.firstName || 'User'}</p>
                                                    {isMemberOwner && (<span title='Owner' className='flex items-center'> <Crown className="w-3 h-3 text-amber-400" /></span>)}
                                                    {!isMemberOwner && isMemberAdmin && (<span title='Admin' className='flex items-center'><ShieldCheck className="w-3 h-3 text-cyan-400" /></span>)}
                                                </div>
                                                <p className="text-[10px] text-neutral-400 truncate">@{m.userName || 'user'}</p>
                                            </div>
                                        </div>

                                        
                                        {isAdmin && !isMemberOwner && mId !== currentUserId?.toString() && (
                                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition">
                                                
                                                {isOwner && !isMemberAdmin && (
                                                    <button
                                                        onClick={() => handlePromoteAdmin(mId)}
                                                        className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-neutral-950 transition"
                                                        title="Promote to Admin"
                                                    >
                                                        <ShieldCheck className="w-3 h-3" />
                                                    </button>
                                                )}
                                                
                                                <button
                                                    onClick={() => handleManageMember(mId, 'remove')}
                                                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition"
                                                    title="Remove Member"
                                                >
                                                    <UserMinus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                
                <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900/40 hover:bg-neutral-900 border border-neutral-800/60 transition cursor-pointer"
                >
                    <div className="flex items-center space-x-3 text-neutral-300">
                        {isMuted ? <BellOff className="w-4 h-4 text-amber-400" /> : <Bell className="w-4 h-4 text-cyan-400" />}
                        <span className="text-xs font-medium">Notifications</span>
                    </div>
                    <span className={`text-[11px] font-bold ${isMuted ? 'text-amber-400' : 'text-neutral-500'}`}>
                        {isMuted ? 'Muted' : 'Enabled'}
                    </span>
                </button>

                
                <div className="pt-2 border-t border-neutral-800/60 space-y-2">
                    {(isGroup || isChannel) && (
                        <button
                            onClick={handleLeaveEntity}
                            className="w-full flex items-center justify-center space-x-2 p-3 rounded-2xl text-amber-400 hover:bg-amber-500/10 border border-amber-500/20 transition cursor-pointer font-bold text-xs"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Leave {isGroup ? 'Group' : 'Channel'}</span>
                        </button>
                    )}

                    
                    {(isGroup || isChannel) && isOwner && (
                        <button
                            onClick={handleDeleteEntity}
                            className="w-full flex items-center justify-center space-x-2 p-3 rounded-2xl text-red-400 hover:bg-red-500/10 border border-red-500/20 transition cursor-pointer font-bold text-xs"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Destroy {isGroup ? 'Group' : 'Channel'} Permanently</span>
                        </button>
                    )}
                </div>

            </div>

        </aside>
    );
};