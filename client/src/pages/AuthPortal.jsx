import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthPortal() {
    const navigate = useNavigate();
    const [tab, setTab] = useState('login'); // 'login' | 'register'
    const [step, setStep] = useState('form'); // 'form' | 'verify'
    const [role, setRole] = useState('patient'); // 'patient' | 'doctor' | 'admin'
    
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [rememberMe, setRememberMe] = useState(false);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState({});
    
    const [focusedFields, setFocusedFields] = useState({
        fullName: false,
        email: false,
        password: false
    });

    useEffect(() => {
        const handleMouseMove = (e) => {
            const blobs = document.querySelectorAll('.wave-blob');
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;

            blobs.forEach((blob, index) => {
                const shift = (index + 1) * 20;
                blob.style.transform = `translate(${mouseX * shift}px, ${mouseY * shift}px)`;
            });
        };

        document.addEventListener('mousemove', handleMouseMove);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const validateField = (field, value) => {
        let newErrors = { ...errors };
        let newSuccess = { ...success };
        
        if (field === 'email') {
            if (!value) {
                newErrors.email = "Email is required";
                newSuccess.email = false;
            } else if (!/\S+@\S+\.\S+/.test(value)) {
                newErrors.email = "Enter a valid email address";
                newSuccess.email = false;
            } else {
                delete newErrors.email;
                newSuccess.email = true;
            }
        }
        
        if (field === 'password') {
            if (!value) {
                newErrors.password = "Password is required";
                newSuccess.password = false;
            } else if (value.length < 8) {
                newErrors.password = "Minimum 8 characters required";
                newSuccess.password = false;
            } else {
                delete newErrors.password;
                newSuccess.password = true;
            }
        }
        
        if (field === 'fullName' && tab === 'register') {
            if (!value) {
                newErrors.fullName = "Full name is required";
                newSuccess.fullName = false;
            } else {
                delete newErrors.fullName;
                newSuccess.fullName = true;
            }
        }
        
        setErrors(newErrors);
        setSuccess(newSuccess);
    };

    const handleFocus = (field) => {
        setFocusedFields(prev => ({ ...prev, [field]: true }));
    };

    const handleBlur = (field, value) => {
        setFocusedFields(prev => ({ ...prev, [field]: false }));
        validateField(field, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        validateField('email', email);
        validateField('password', password);
        if (tab === 'register') {
            validateField('fullName', fullName);
        }
        
        if (errors.email || errors.password || (tab === 'register' && errors.fullName) || !email || !password || (tab === 'register' && !fullName)) {
            return;
        }

        setIsSubmitting(true);

        setTimeout(() => {
            setIsSubmitting(false);
            setStep('verify');
        }, 1500);
    };

    const handleVerify = (e) => {
        e.preventDefault();
        if (otp.join('').length < 6) return;
        
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            if (role === 'patient') navigate('/patient');
            else if (role === 'doctor') navigate('/doctor');
            else if (role === 'admin') navigate('/admin');
        }, 1500);
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) value = value.slice(-1);
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const getInputClasses = (field) => {
        let baseClasses = "w-full bg-white border border-outline-variant/65 rounded-xl py-3 px-4 pr-12 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-body-md text-body-md text-on-surface outline-none ";
        if (errors[field]) {
            return baseClasses + "border-error focus:border-error focus:ring-error/10 text-error";
        }
        if (success[field]) {
            return baseClasses + "border-tertiary-fixed-dim focus:border-tertiary-fixed-dim focus:ring-tertiary-fixed-dim/10";
        }
        return baseClasses;
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative z-0 px-4 py-8 md:py-12 md:px-6 font-body-md text-body-md">
            {/* Atmospheric Background */}
            <div className="bg-wave z-[-2]">
                <div className="wave-blob bg-primary top-[-10%]" style={{ width: '800px', height: '800px' }}></div>
                <div className="wave-blob bg-secondary bottom-[-10%] right-[-10%]" style={{ width: '600px', height: '600px', animationDelay: '-5s' }}></div>
            </div>

            {/* Main Container */}
            <main className="w-full max-w-[1000px] grid md:grid-cols-2 glass rounded-3xl overflow-hidden shadow-2xl relative bg-white/80 md:bg-white/70 backdrop-blur-xl border border-white/20">
                {/* Left Side: Branding & Image */}
                <section className="hidden md:flex flex-col justify-between p-12 bg-primary relative overflow-hidden">
                    <div className="relative z-10 text-left">
                        <h1 className="font-headline-lg text-headline-lg text-white mb-2">PalmCrest ENT</h1>
                        <p className="font-body-md text-body-md text-primary-fixed-dim font-medium">Clinical Excellence in Advanced Sanctuary of Care.</p>
                    </div>
                    <div className="relative z-10 space-y-4 text-left">
                        <div className="flex items-center gap-3 text-white">
                            <span className="material-symbols-outlined text-tertiary-fixed">verified</span>
                            <span className="font-label-md text-label-md uppercase tracking-wider">Board Certified Specialists</span>
                        </div>
                        <div className="flex items-center gap-3 text-white">
                            <span className="material-symbols-outlined text-tertiary-fixed">shield_with_heart</span>
                            <span className="font-label-md text-label-md uppercase tracking-wider">Patient-Centric Technology</span>
                        </div>
                        <div className="flex items-center gap-3 text-white">
                            <span className="material-symbols-outlined text-tertiary-fixed">lock</span>
                            <span className="font-label-md text-label-md uppercase tracking-wider">HIPAA Compliant Security</span>
                        </div>
                    </div>
                </section>

                {/* Right Side: Auth Form */}
                <section className="p-6 sm:p-10 md:p-12 flex flex-col justify-center text-left h-full bg-transparent relative z-10">
                    
                    {step === 'form' ? (
                        <>
                            {/* Toggle */}
                            <div className="relative flex bg-surface-container rounded-full p-1 mb-6 w-full max-w-[280px] mx-auto md:mx-0 shadow-sm border border-outline-variant/30">
                                <div 
                                    className="absolute top-1 bottom-1 left-1 rounded-full bg-white shadow-sm transition-all duration-300 ease-out"
                                    style={{
                                        width: 'calc(50% - 4px)',
                                        transform: tab === 'login' ? 'translateX(0)' : 'translateX(100%)'
                                    }}
                                />
                                <button
                                    type="button"
                                    className={`relative z-10 py-2 rounded-full text-label-md font-label-md transition-colors duration-300 flex-1 text-center font-bold ${
                                        tab === 'login' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                                    }`}
                                    onClick={() => { setTab('login'); setErrors({}); setSuccess({}); }}
                                >
                                    Login
                                </button>
                                <button
                                    type="button"
                                    className={`relative z-10 py-2 rounded-full text-label-md font-label-md transition-colors duration-300 flex-1 text-center font-bold ${
                                        tab === 'register' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                                    }`}
                                    onClick={() => { setTab('register'); setErrors({}); setSuccess({}); }}
                                >
                                    Register
                                </button>
                            </div>

                            <div className="mb-6">
                                <h2 className="font-headline-md text-headline-md text-on-surface mb-2 font-bold tracking-tight">
                                    {tab === 'login' ? 'Welcome Back' : 'Join Our Sanctuary'}
                                </h2>
                                <p className="font-body-md text-body-md text-on-surface-variant">
                                    {tab === 'login' ? 'Sign in securely to access your clinical dashboard.' : 'Register today to manage your healthcare journey with highest security.'}
                                </p>
                            </div>

                            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                                {/* Role Selector */}
                                <div className="space-y-2">
                                    <label className="font-label-md text-caption text-on-surface-variant ml-1 font-semibold uppercase tracking-wider">Access Role</label>
                                    <div className="flex gap-1.5 xs:gap-2 sm:gap-3">
                                        {['patient', 'doctor', 'admin'].map((r) => (
                                            <label key={r} className="flex-1 cursor-pointer group">
                                                <input 
                                                    className="hidden peer" 
                                                    name="role" 
                                                    type="radio" 
                                                    value={r} 
                                                    checked={role === r}
                                                    onChange={() => setRole(r)}
                                                />
                                                <div className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border transition-all text-center ${
                                                    role === r 
                                                    ? 'border-primary bg-primary/5 text-primary shadow-sm font-bold' 
                                                    : 'border-outline-variant/40 text-on-surface-variant hover:bg-white hover:border-outline-variant/80 hover:shadow-sm'
                                                }`}>
                                                    <span className="material-symbols-outlined mb-1 text-[20px] sm:text-[24px]" style={{ fontVariationSettings: role === r ? "'FILL' 1" : "'FILL' 0" }}>
                                                        {r === 'patient' ? 'person' : r === 'doctor' ? 'stethoscope' : 'admin_panel_settings'}
                                                    </span>
                                                    <span className="text-[11px] sm:text-caption capitalize font-bold tracking-wide">{r}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-4">
                                    {tab === 'register' && (
                                        <div className="space-y-1">
                                            <label className="font-label-md text-caption text-on-surface-variant ml-1 font-semibold uppercase tracking-wider block">Full Legal Name</label>
                                            <div className="relative flex items-center">
                                                <input
                                                    className={getInputClasses('fullName')}
                                                    placeholder="e.g. Jane Doe"
                                                    type="text"
                                                    value={fullName}
                                                    onChange={(e) => {
                                                        setFullName(e.target.value);
                                                        if (errors.fullName) validateField('fullName', e.target.value);
                                                    }}
                                                    onFocus={() => handleFocus('fullName')}
                                                    onBlur={(e) => handleBlur('fullName', e.target.value)}
                                                />
                                                {success.fullName && <span className="material-symbols-outlined absolute right-4 text-tertiary-fixed-dim select-none">check_circle</span>}
                                                {errors.fullName && <span className="material-symbols-outlined absolute right-4 text-error select-none">error</span>}
                                            </div>
                                            {errors.fullName && (
                                                <p className="text-error text-caption mt-1 ml-1 font-medium animate-slide-up flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">error</span>
                                                    {errors.fullName}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        <label className="font-label-md text-caption text-on-surface-variant ml-1 font-semibold uppercase tracking-wider block">Email Address</label>
                                        <div className="relative flex items-center">
                                            <input
                                                className={getInputClasses('email')}
                                                placeholder="e.g. jane.doe@example.com"
                                                type="email"
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value);
                                                    if (errors.email) validateField('email', e.target.value);
                                                }}
                                                onFocus={() => handleFocus('email')}
                                                onBlur={(e) => handleBlur('email', e.target.value)}
                                            />
                                            {success.email && <span className="material-symbols-outlined absolute right-4 text-tertiary-fixed-dim select-none">check_circle</span>}
                                            {errors.email && <span className="material-symbols-outlined absolute right-4 text-error select-none">error</span>}
                                        </div>
                                        {errors.email && (
                                            <p className="text-error text-caption mt-1 ml-1 font-medium animate-slide-up flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">error</span>
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <label className="font-label-md text-caption text-on-surface-variant ml-1 font-semibold uppercase tracking-wider block">Password</label>
                                        <div className="relative flex items-center">
                                            <input
                                                className={getInputClasses('password')}
                                                placeholder="••••••••"
                                                type="password"
                                                value={password}
                                                onChange={(e) => {
                                                    setPassword(e.target.value);
                                                    if (errors.password) validateField('password', e.target.value);
                                                }}
                                                onFocus={() => handleFocus('password')}
                                                onBlur={(e) => handleBlur('password', e.target.value)}
                                            />
                                            {success.password && <span className="material-symbols-outlined absolute right-4 text-tertiary-fixed-dim select-none">check_circle</span>}
                                            {errors.password && <span className="material-symbols-outlined absolute right-4 text-error select-none">error</span>}
                                        </div>
                                        {errors.password && (
                                            <p className="text-error text-caption mt-1 ml-1 font-medium animate-slide-up flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">error</span>
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {tab === 'login' && (
                                    <div className="flex justify-between items-center pt-1">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className="relative flex items-center justify-center">
                                                <input 
                                                    className="peer appearance-none w-4 h-4 border border-outline rounded-md checked:bg-primary checked:border-primary transition-all cursor-pointer focus:ring-2 focus:ring-primary/20 focus:ring-offset-1"
                                                    type="checkbox" 
                                                    checked={rememberMe}
                                                    onChange={(e) => setRememberMe(e.target.checked)}
                                                />
                                                <span className="material-symbols-outlined absolute text-white text-[12px] pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">check</span>
                                            </div>
                                            <span className="font-body-md text-caption text-on-surface group-hover:text-primary transition-colors font-medium select-none">Remember me</span>
                                        </label>
                                        <a className="font-label-md text-caption text-primary hover:text-secondary transition-colors font-semibold underline-offset-4 hover:underline" href="#">Forgot Password?</a>
                                    </div>
                                )}

                                {/* CTA Button */}
                                <button
                                    className="w-full py-3.5 rounded-xl text-white font-label-md text-label-md btn-gradient uppercase tracking-widest mt-4 flex items-center justify-center min-h-[48px] shadow-lg shadow-primary/10 hover:shadow-primary/30 focus:ring-4 focus:ring-primary/20 transition-all font-bold"
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-3">
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Authenticating...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            {tab === 'login' ? 'Login Securely' : 'Create Account'}
                                            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                        </span>
                                    )}
                                </button>
                                
                                {/* Security Indicator */}
                                <div className="flex items-center justify-center gap-2 mt-4 text-on-surface-variant bg-surface-container-low py-2.5 rounded-xl border border-outline-variant/30">
                                    <span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim">lock</span>
                                    <span className="font-caption text-caption font-semibold">256-bit Secure Encryption</span>
                                </div>

                                {tab === 'register' && (
                                    <p className="font-caption text-caption text-on-surface-variant text-center mt-4 px-4 leading-relaxed">
                                        By registering, you agree to PalmCrest's <a className="text-primary font-semibold hover:underline" href="#">Terms of Service</a> and <a className="text-primary font-semibold hover:underline" href="#">Privacy Protocol</a>.
                                    </p>
                                )}
                            </form>
                        </>
                    ) : (
                        /* Verification Flow */
                        <div className="flex flex-col h-full justify-center animate-slide-up">
                            <button 
                                onClick={() => setStep('form')}
                                className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors w-fit mb-6 font-label-md"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                                Back
                            </button>
                            
                            <div className="text-center mb-6">
                                <div className="mx-auto w-14 h-14 bg-primary-container/10 text-primary rounded-full flex items-center justify-center mb-3">
                                    <span className="material-symbols-outlined text-2xl">mark_email_read</span>
                                </div>
                                <h2 className="font-headline-md text-headline-md text-on-surface mb-2 font-bold">
                                    Two-Factor Verification
                                </h2>
                                <p className="font-body-md text-caption text-on-surface-variant max-w-sm mx-auto px-2">
                                    We've sent a secure 6-digit code to <span className="font-semibold text-on-surface">{email || 'your email'}</span>. Please enter it below.
                                </p>
                            </div>

                            <form onSubmit={handleVerify} className="space-y-6">
                                <div className="flex justify-center gap-1.5 sm:gap-3">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="w-9 h-11 sm:w-12 sm:h-14 text-center font-headline-md text-headline-md font-bold text-on-surface border border-outline-variant/60 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-white"
                                        />
                                    ))}
                                </div>
                                
                                <button
                                    className="w-full py-3.5 rounded-xl text-white font-label-md text-label-md btn-gradient uppercase tracking-widest flex items-center justify-center min-h-[48px] shadow-lg shadow-primary/10 hover:shadow-primary/30 focus:ring-4 focus:ring-primary/20 transition-all font-bold mt-4"
                                    type="submit"
                                    disabled={isSubmitting || otp.join('').length < 6}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-3">
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Verifying...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Verify Identity
                                            <span className="material-symbols-outlined text-[20px]">verified_user</span>
                                        </span>
                                    )}
                                </button>
                                
                                <div className="text-center mt-4">
                                    <p className="text-caption text-on-surface-variant font-medium">
                                        Didn't receive the code?{' '}
                                        <button type="button" className="text-primary font-bold hover:underline">
                                            Resend Secure Code
                                        </button>
                                    </p>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="mt-auto border-t border-outline-variant/20 pt-4 text-center">
                        <p className="font-body-md text-caption text-on-surface-variant">
                            Authorized Healthcare Portal
                            <span className="block text-[10px] font-caption mt-1 opacity-70 font-semibold uppercase tracking-wider font-label">PalmCrest ENT | Clinical Data Security v4.2</span>
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}
