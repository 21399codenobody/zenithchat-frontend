import React from 'react';

interface Props {
    className?: string;
    glow?: boolean;
}

export const ZenithLogo: React.FC<Props> = ({ className = "w-16 h-16", glow = true }) => {
    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>

            {glow && (
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-full blur-xl opacity-40 animate-pulse" />
            )}


            <svg
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full relative z-10 drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
                <defs>

                    <linearGradient id="zenithCyanWing" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="50%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#0284c7" />
                    </linearGradient>


                    <linearGradient id="zenithDeepWing" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0284c7" />
                        <stop offset="100%" stopColor="#1e3a8a" />
                    </linearGradient>


                    <linearGradient id="zenithNavyTail" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#172554" />
                        <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>
                </defs>


                <path d="M50 145 L75 110 L95 155 Z" fill="url(#zenithNavyTail)" />


                <path d="M50 145 L155 45 L110 140 Z" fill="url(#zenithDeepWing)" />


                <path d="M95 155 L155 45 L110 140 Z" fill="#0369a1" />


                <path d="M155 45 L65 105 L115 115 Z" fill="url(#zenithCyanWing)" />


                <line x1="155" y1="45" x2="85" y2="125" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
            </svg>
        </div>
    );
};
