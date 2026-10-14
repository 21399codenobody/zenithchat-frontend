import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className={`w-full ${maxWidth} rounded-3xl bg-neutral-900/95 border border-cyan-500/25 shadow-2xl shadow-cyan-950/50 overflow-hidden flex flex-col max-h-[85vh]`}>

                
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
                    <h2 className="text-base font-bold text-white tracking-wide">{title}</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>

            </div>
        </div>
    );
};