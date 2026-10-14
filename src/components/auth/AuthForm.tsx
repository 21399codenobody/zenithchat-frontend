'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Loader2, Sparkles, ArrowLeft, RefreshCw } from 'lucide-react';
import { ZenithLogo } from '@/components/common/ZenithLogo';
import { useAuthStore } from '@/store/useAuthStore';
import { POPULAR_COUNTRIES, type ICountryInfo } from '@/utils/countryData';

interface Props {
    onSuccess: (isNewUser: boolean, isProfileComplete: boolean) => void;
}

export const AuthForm: React.FC<Props> = ({ onSuccess }) => {
    
    const [step, setStep] = useState<1 | 2>(1);

    
    const [selectedCountry, setSelectedCountry] = useState<ICountryInfo>(POPULAR_COUNTRIES[0]);
    const [phoneNumber, setPhoneNumber] = useState('');

    
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const { sendOtp, verifyOtp, isLoading, error: serverError, debugOtp } = useAuthStore();

    
    useEffect(() => {
        let interval: any;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawDigits = e.target.value.replace(/\D/g, '');

        
        const hasPrefix = Boolean(selectedCountry.nationalPrefix && rawDigits.startsWith(selectedCountry.nationalPrefix));

        
        const maxAllowed = hasPrefix
            ? selectedCountry.maxLength + 1  
            : selectedCountry.maxLength;      

        
        setPhoneNumber(rawDigits.slice(0, maxAllowed));
    };

    
    const handleSendPhone = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        let cleanNumber = phoneNumber.trim().replace(/\D/g, '');

        
        if (selectedCountry.nationalPrefix && cleanNumber.startsWith(selectedCountry.nationalPrefix)) {
            cleanNumber = cleanNumber.slice(selectedCountry.nationalPrefix.length);
        }

        
        if (cleanNumber.length < selectedCountry.minLength || cleanNumber.length > selectedCountry.maxLength) {
            setLocalError(
                `Phone number must be exactly ${selectedCountry.minLength} digits for ${selectedCountry.name}.`
            );
            return;
        }

        const fullE164Number = `${selectedCountry.dialCode}${cleanNumber}`;
        const ok = await sendOtp(fullE164Number, selectedCountry.code);

        if (ok) {
            setStep(2);
            setTimer(60);
            setCanResend(false);
            setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
        }
    };

    
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); 
        setOtp(newOtp);

        
        if (value && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }

        
        const fullCode = newOtp.join('');
        if (fullCode.length === 6) {
            submitOtp(fullCode);
        }
    };

    
    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    
    const submitOtp = async (code: string) => {
        setLocalError(null);
        const res = await verifyOtp(code);
        if (res.success) {
            onSuccess(Boolean(res.isNewUser), Boolean(res.isProfileComplete));
        }
    };

    return (
        <div className="w-full max-w-[420px] mx-auto p-5 sm:p-7 rounded-3xl bg-neutral-900/80 backdrop-blur-2xl border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.12)] transition-all">

            
            <div className="text-center mb-5">
                <ZenithLogo className="w-14 h-14 mx-auto mb-2.5" />
                <h1 className="text-2xl font-black tracking-[0.2em] bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent uppercase">
                    ZENITH
                </h1>
                <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold tracking-wider uppercase mt-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Instant Phone Verification</span>
                </div>
            </div>

            
            {(localError || serverError) && (
                <div className="mb-4 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center animate-in shake duration-150">
                    {localError || serverError}
                </div>
            )}

            
            {step === 1 ? (
                <form onSubmit={handleSendPhone} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                            Country / Region
                        </label>
                        <select
                            value={selectedCountry.code}
                            onChange={(e) => {
                                const found = POPULAR_COUNTRIES.find(c => c.code === e.target.value);
                                if (found) {
                                    setSelectedCountry(found);
                                    
                                    const hasPrefix = Boolean(found.nationalPrefix && phoneNumber.startsWith(found.nationalPrefix));
                                    const max = hasPrefix ? found.maxLength + 1 : found.maxLength;
                                    setPhoneNumber(prev => prev.slice(0, max));
                                }
                            }}
                            className="w-full px-3.5 py-2.5 bg-neutral-950/70 border border-neutral-800 rounded-xl text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-cyan-400 transition cursor-pointer"
                        >
                            {POPULAR_COUNTRIES.map((country) => (
                                <option key={country.code} value={country.code} className="bg-neutral-900 text-white">
                                    {country.flag} {country.name} ({country.dialCode})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                Phone Number
                            </label>
                            <span className="text-[10px] text-neutral-500 font-medium">
                                Ex: {selectedCountry.formatPlaceholder}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            
                            <span className="px-3.5 py-2.5 bg-neutral-950/70 border border-neutral-800 rounded-xl text-cyan-400 font-bold text-sm select-none shrink-0">
                                {selectedCountry.dialCode}
                            </span>
                            <input
                                type="tel"
                                placeholder={selectedCountry.formatPlaceholder}
                                value={phoneNumber}
                                onChange={handlePhoneChange}
                                maxLength={selectedCountry.nationalPrefix ? selectedCountry.maxLength + 1 : selectedCountry.maxLength}
                                className="w-full px-3.5 py-2.5 bg-neutral-950/70 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 text-sm font-medium focus:outline-none focus:border-cyan-400 transition tracking-wider"
                                autoFocus
                            />
                        </div>
                    </div>

                    <p className="text-[11px] text-neutral-500 leading-relaxed text-center pt-1">
                        We will send a 6-digit confirmation code via SMS. Carrier rates may apply.
                    </p>

                    <button
                        type="submit"
                        disabled={isLoading || phoneNumber.trim().length === 0}
                        className="w-full flex items-center justify-center space-x-2 py-3.5 px-5 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600 text-white font-bold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:opacity-95 transition disabled:opacity-40 cursor-pointer mt-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Sending SMS Code...</span>
                            </>
                        ) : (
                            <>
                                <span>Continue</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>
            ) : (
                
                <div className="space-y-5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                        <button
                            type="button"
                            onClick={() => {
                                setStep(1);
                                setOtp(['', '', '', '', '', '']);
                            }}
                            className="flex items-center space-x-1 text-xs text-neutral-400 hover:text-cyan-400 transition cursor-pointer"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Change Number</span>
                        </button>
                        <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                            Enter Code
                        </span>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-neutral-400">
                            We've sent a 6-digit code to <br />
                            <span className="text-white font-bold text-sm tracking-wider">
                                {selectedCountry.dialCode} {phoneNumber}
                            </span>
                        </p>

                        {debugOtp && (
                            <div className="mt-2 p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-bold">
                                Dev OTP: {debugOtp}
                            </div>
                        )}
                    </div>

                    
                    <div className="flex justify-between space-x-2">
                        {otp.map((digit, idx) => (
                            <input
                                key={idx}
                                ref={(el) => { otpInputRefs.current[idx] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(idx, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                className="w-12 h-14 bg-neutral-950/80 border border-neutral-800 rounded-xl text-center text-xl font-black text-white focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition"
                            />
                        ))}
                    </div>

                    
                    <div className="text-center pt-2">
                        {canResend ? (
                            <button
                                type="button"
                                onClick={handleSendPhone}
                                className="inline-flex items-center space-x-1.5 text-xs text-cyan-400 hover:underline font-semibold cursor-pointer"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Resend Code</span>
                            </button>
                        ) : (
                            <p className="text-[11px] text-neutral-500">
                                Resend code in <span className="text-neutral-300 font-bold">{timer}s</span>
                            </p>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
};