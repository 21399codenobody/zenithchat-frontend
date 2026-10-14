import React from 'react';

interface AvatarProps {
    src?: string;
    name?: string;
    avatarEmoji?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isOnline?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
    src,
    name = 'User',
    avatarEmoji = '👤',
    size = 'md',
    isOnline = false
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-2xl'
    };

    const dotSizes = {
        sm: 'w-2.5 h-2.5 border',
        md: 'w-3.5 h-3.5 border-2',
        lg: 'w-4 h-4 border-2',
        xl: 'w-5 h-5 border-2'
    };

    return (
        <div className="relative inline-block shrink-0 select-none">
            <div className={`${sizeClasses[size]} rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-inner`}>
                {src ? (
                    <img src={src} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <span className="select-none">{avatarEmoji}</span>
                )}
            </div>
            {isOnline && (
                <span className={`absolute bottom-0 right-0 ${dotSizes[size]} bg-emerald-500 border-neutral-950 rounded-full`} />
            )}
        </div>
    );
};