import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: React.ReactNode;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, icon, error, className = '', ...props }) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative flex items-center">
                {icon && (
                    <span className="absolute left-3.5 text-neutral-500 flex items-center select-none">
                        {icon}
                    </span>
                )}
                <input
                    className={`w-full py-3 bg-neutral-950/70 border rounded-2xl text-white placeholder-neutral-600 font-medium text-xs sm:text-sm focus:outline-none transition tracking-wide ${icon ? 'pl-10 pr-4' : 'px-4'
                        } ${error ? 'border-red-500/60 focus:border-red-500' : 'border-neutral-800 focus:border-cyan-400'
                        } ${className}`}
                    {...props}
                />
            </div>
            {error && <p className="text-[10px] text-red-400 mt-1 pl-1">{error}</p>}
        </div>
    );
};