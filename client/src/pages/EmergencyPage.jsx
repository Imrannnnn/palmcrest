import { useNavigate } from 'react-router-dom';

export default function EmergencyPage() {
    const navigate = useNavigate();

    const handleCall = () => {
        window.location.href = 'tel:+2348056913057';
    };

    const handleEmail = () => {
        window.location.href = 'mailto:Palmcrestentspecialisthospital@gmail.com';
    };

    return (
        <div className="min-h-screen text-[#191c1e] bg-gradient-to-br from-[#fffbfa] via-white to-[#fffcfc] flex flex-col font-body-md relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-error/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Navigation Header */}
            <nav className="w-full py-4 px-6 md:px-12 border-b border-outline-variant/10 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-[1440px] mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <img src="/logo-ent.jpeg" alt="PalmCrest ENT Logo" className="h-10 w-auto object-contain rounded-lg shadow-sm" />
                        <span className="font-bold text-primary text-lg">PalmCrest</span>
                    </div>
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-primary font-semibold text-sm hover:text-secondary transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Back to Home
                    </button>
                </div>
            </nav>

            {/* Content Section */}
            <main className="flex-1 max-w-[1100px] w-full mx-auto px-6 py-8 md:py-14 flex flex-col justify-center">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    
                    {/* Left Column: Heading & Urgency Alert */}
                    <div className="lg:col-span-6 space-y-4">
                        <div className="inline-flex items-center gap-1.5 bg-error/10 border border-error/20 text-error px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[14px] animate-pulse">emergency</span>
                            24/7 Priority Emergency Channel
                        </div>
                        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                            Urgent &amp; Emergency <br/>
                            <span className="text-error">ENT Assistance</span>
                        </h1>
                        <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed max-w-[460px]">
                            Acute ear trauma, sudden hearing loss, severe nosebleeds, or airway emergencies require immediate specialist intervention. Our priority unit is standing by.
                        </p>
                        <div className="p-4 rounded-xl bg-error/[0.03] border border-error/10 max-w-[460px]">
                            <p className="text-[10px] font-bold text-error uppercase tracking-wider mb-2">When to seek emergency care:</p>
                            <ul className="text-xs text-on-surface-variant space-y-1.5 list-disc pl-4">
                                <li>Sudden or complete hearing loss in one or both ears</li>
                                <li>Trauma or severe foreign objects lodged in ears, nose, or throat</li>
                                <li>Uncontrolled nasal bleeding or airway blockages</li>
                                <li>Severe dizziness accompanied by severe headache or weakness</li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Contact Cards */}
                    <div className="lg:col-span-6 space-y-4">
                        {/* Emergency Phone Card */}
                        <div 
                            onClick={handleCall}
                            className="group cursor-pointer p-4 sm:p-5 rounded-2xl bg-white border border-outline-variant/30 hover:border-error/30 hover:shadow-xl transition-all duration-300 relative overflow-hidden shadow-sm flex items-start gap-4"
                        >
                            <div className="absolute top-0 right-0 w-28 h-28 bg-error/[0.01] group-hover:bg-error/[0.03] rounded-full translate-x-8 -translate-y-8 transition-colors pointer-events-none"></div>
                            <div className="w-12 h-12 rounded-xl bg-error/10 text-error flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>call</span>
                            </div>
                            <div>
                                <h3 className="text-[10px] font-bold text-error uppercase tracking-widest mb-0.5">Direct Emergency Hotline</h3>
                                <p className="text-xl sm:text-2xl font-display font-bold text-primary group-hover:text-error transition-colors">+234 805 691 3057</p>
                                <p className="text-[11px] text-on-surface-variant mt-1">Tap to call our on-call specialists immediately.</p>
                            </div>
                        </div>

                        {/* Email Card */}
                        <div 
                            onClick={handleEmail}
                            className="group cursor-pointer p-4 sm:p-5 rounded-2xl bg-white border border-outline-variant/30 hover:border-primary/30 hover:shadow-xl transition-all duration-300 relative overflow-hidden shadow-sm flex items-start gap-4"
                        >
                            <div className="absolute top-0 right-0 w-28 h-28 bg-primary/[0.01] group-hover:bg-primary/[0.03] rounded-full translate-x-8 -translate-y-8 transition-colors pointer-events-none"></div>
                            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                <span className="material-symbols-outlined text-[24px]">mail</span>
                            </div>
                            <div>
                                <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-0.5">General &amp; Clinical Email</h3>
                                <p className="text-sm sm:text-base font-semibold text-primary break-all group-hover:text-secondary transition-colors">
                                    Palmcrestentspecialisthospital@gmail.com
                                </p>
                                <p className="text-[11px] text-on-surface-variant mt-1">Tap to email clinical inquiries or documentation.</p>
                            </div>
                        </div>

                        {/* Location & Social Card */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-outline-variant/30 shadow-sm space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-[24px]">location_on</span>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-0.5">Sanctuary Address</h3>
                                    <p className="text-sm font-semibold text-primary">100 Clinical Way, Medical District</p>
                                    <p className="text-[11px] text-on-surface-variant mt-0.5">24-hour physical outpatient emergency unit.</p>
                                </div>
                            </div>

                            <div className="border-t border-outline-variant/10 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-0.5">Connect with us</h4>
                                    <p className="text-[11px] text-on-surface-variant">Stay updated on our clinical updates.</p>
                                </div>
                                <div className="flex gap-2">
                                    <a 
                                        href="https://www.facebook.com/share/1JdiM6CWBq/?mibextid=wwXIfr" 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="w-9 h-9 rounded-full bg-primary/5 hover:bg-primary hover:text-white flex items-center justify-center text-primary transition-all shadow-sm border border-outline-variant/10"
                                        aria-label="Facebook"
                                    >
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                            <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                                        </svg>
                                    </a>
                                    <a 
                                        href="https://www.tiktok.com/@palmcrest.ent.spe?_r=1&_t=ZS-97fnezTeyua" 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="w-9 h-9 rounded-full bg-primary/5 hover:bg-primary hover:text-white flex items-center justify-center text-primary transition-all shadow-sm border border-outline-variant/10"
                                        aria-label="TikTok"
                                    >
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.8 1 1.89 1.73 3.11 2.14v3.83c-1.46-.07-2.88-.63-4.04-1.57-.42-.34-.78-.73-1.1-1.16v6.4c.03 2.14-.65 4.31-2.03 5.92-1.6 1.86-4.06 2.94-6.52 2.87-2.6-.08-5.11-1.43-6.52-3.66-1.52-2.39-1.57-5.56-.16-8 1.34-2.35 3.84-3.86 6.55-3.95v3.87c-1.28.1-2.48.83-3.13 1.94-.71 1.22-.64 2.89.2 4.02.83 1.12 2.27 1.76 3.66 1.55 1.48-.22 2.68-1.52 2.89-3v-12.2c.01-1.34 0-2.68.01-4.02z"/>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* Footer */}
            <footer className="py-6 border-t border-outline-variant/10 text-center bg-white">
                <p className="text-xs text-on-surface-variant">© 2026 PalmCrest ENT Hospital. Advanced Sanctuary of Care.</p>
            </footer>
        </div>
    );
}
