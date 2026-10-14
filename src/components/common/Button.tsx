import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    isLoading = false,
    variant = 'primary',
    children,
    disabled,
    className = '',
    ...props
}) => {
    let baseStyles = "w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider transition active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:pointer-events-none ";

    if (variant === 'primary') {
        baseStyles += "bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40";
    } else if (variant === 'secondary') {
        baseStyles += "bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700";
    } else if (variant === 'danger') {
        baseStyles += "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20";
    } else if (variant === 'outline') {
        baseStyles += "bg-transparent border border-neutral-700 hover:border-cyan-400 text-neutral-300 hover:text-white";
    }

    return (
        <button
            disabled={disabled || isLoading}
            className={`${baseStyles} ${className}`}
            {...props}
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                </>
            ) : (
                children
            )}
        </button>
    );
};