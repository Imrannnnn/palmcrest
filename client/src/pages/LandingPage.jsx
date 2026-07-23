import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Animated counter hook removed

export default function LandingPage() {
    const navigate = useNavigate();
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [activeExploreTab, setActiveExploreTab] = useState('ear');
    const [scrolled, setScrolled] = useState(false);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await fetch(`${backendUrl}/api/reviews`);
                if (res.ok) {
                    const data = await res.json();
                    setReviews(data);
                }
            } catch (err) {
                console.error('Error fetching reviews:', err);
            }
        };
        fetchReviews();
    }, []);

    useEffect(() => {
        const observerOptions = { threshold: 0.1 };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, observerOptions);

        const reveals = document.querySelectorAll('.reveal');
        reveals.forEach(el => observer.observe(el));

        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        const handleMouseMove = (e) => {
            const blobs = document.querySelectorAll('.wave-blob');
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            blobs.forEach((blob, index) => {
                const shift = (index + 1) * 20;
                blob.style.transform = `translate(${mouseX * shift}px, ${mouseY * shift}px)`;
            });
        };

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            reveals.forEach(el => observer.unobserve(el));
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const toggleMobileNav = () => setIsMobileNavOpen(!isMobileNavOpen);
    const handleBookClick = () => navigate('/portal');

    const deptData = {
        ear: {
            label: 'OTOLOGY DEPARTMENT',
            title: 'Sensory Hearing & Microsurgery',
            desc: 'Specializing in middle ear pathology, ear drum repair, hearing loss, and chronic infection treatments ensuring complete sensory recovery.',
            symptoms: ['Hearing loss', 'Ringing / Tinnitus', 'Fluid discharge', 'Ear canal pain'],
            diagnostics: [
                { name: 'Pure-Tone Audiometry', desc: 'Computerized testing to determine precise hearing thresholds.' },
                { name: 'High-Res Tympanometry', desc: 'Measures acoustic mobility of the eardrum and middle ear bones.' },
            ],
            therapeutics: [
                { name: 'Microsurgical Tympanoplasty', desc: 'Repairs punctured membranes using autologous grafting materials.' },
                { name: 'Cochlear Implant Integration', desc: 'Electronic audiology processors for advanced deafness cases.' },
            ],
        },
        nose: {
            label: 'RHINOLOGY DEPARTMENT',
            title: 'Sinus Ventilation & Reconstruction',
            desc: 'Providing advanced airflow solutions for deviated septums, chronic sinus inflammation, and nasal balloon dilation procedures.',
            symptoms: ['Sinus pressure', 'Nasal blockages', 'Loss of smell', 'Allergic congestion'],
            diagnostics: [
                { name: 'HD Nasal Endoscopy', desc: 'Flexible fiber-optic visualization of complex sinus passages.' },
                { name: '3D Sinus CT Reconstruction', desc: 'Dynamic volumetric imaging for accurate sinus mapping.' },
            ],
            therapeutics: [
                { name: 'In-Office Balloon Sinuplasty', desc: 'Fast-recovery catheter expansion of sinus pathways.' },
                { name: 'Robotic FESS Navigation', desc: 'AI-assisted precision tissue debridement for inflammation.' },
            ],
        },
        throat: {
            label: 'LARYNGOLOGY DEPARTMENT',
            title: 'Vocal Diagnostics & Pharyngeal Care',
            desc: 'Dedicated to diagnosing speech pathologies, vocal cord lesions, swallowing disorders, and head/neck tumor screenings.',
            symptoms: ['Hoarse voice', 'Sore throat', 'Difficulty swallowing', 'Tonsil swelling'],
            diagnostics: [
                { name: 'Digital Videostroboscopy', desc: 'High-speed vocal fold vibration analysis via slow-motion capture.' },
                { name: 'Pharyngeal Manometry', desc: 'Assesses muscular pressures during the swallowing cycle.' },
            ],
            therapeutics: [
                { name: 'Micro-Laryngeal Phonosurgery', desc: 'Minimally invasive removal of polyps from vocal cords.' },
                { name: 'Targeted Vocal Cord Injection', desc: 'Suspension therapeutics for paralyzed or weak vocal folds.' },
            ],
        },
        audiology: {
            label: 'VESTIBULAR CLINIC',
            title: 'Balance Diagnostics & Rehabilitation',
            desc: 'Focused on diagnostic vestibular testing, vertigo rehabilitation, and custom computerized balance assessments.',
            symptoms: ['Vertigo spells', 'Balance issues', 'Dizziness episodes', 'Loud noise pain'],
            diagnostics: [
                { name: 'Videonystagmography (VNG)', desc: 'Infrared eye tracking to check vestibular balance loop health.' },
                { name: 'Vestibular Evoked Potentials', desc: 'Measures muscle response to determine otolith organ functionality.' },
            ],
            therapeutics: [
                { name: 'Vestibular Adaptation Programs', desc: 'Focused neural training to eliminate vertigo sensation.' },
                { name: 'Canalith Repositioning', desc: 'Physical alignments (Epley maneuver) to clear balance crystals.' },
            ],
        },
    };

    const dept = deptData[activeExploreTab];

    const tabs = [
        { id: 'ear', label: 'Ear Care', icon: 'hearing' },
        { id: 'nose', label: 'Nasal & Sinus', icon: 'air' },
        { id: 'throat', label: 'Throat & Voice', icon: 'voice_over_off' },
        { id: 'audiology', label: 'Audiology', icon: 'room_preferences' },
    ];

    return (
        <div className="font-body-md text-body-md text-[#191c1e] min-h-screen relative z-0 overflow-x-hidden bg-gradient-to-br from-[#f8fdff] via-white to-[#f4fcff]">



            {/* ── NAVBAR ── */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled
                ? 'bg-white/80 backdrop-blur-2xl border-b border-white/50 shadow-sm py-2'
                : 'bg-transparent py-4'
                }`}>
                <div className="flex justify-between items-center px-6 md:px-12 max-w-[1440px] mx-auto">
                    <div className="flex items-center">
                        <img src="/logo-ent.jpeg" alt="PalmCrest ENT Logo" className="h-12 sm:h-14 w-auto object-contain rounded-lg shadow-sm" />
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        {[
                            { label: 'Services', onClick: () => {
                                const el = document.getElementById('services');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }},
                            { label: 'Specialists', onClick: () => navigate('/specialists') },
                            { label: 'Emergency', onClick: () => navigate('/emergency') },
                            { label: 'About', onClick: () => navigate('/about') }
                        ].map(item => (
                            <button
                                key={item.label}
                                className="text-on-surface-variant hover:text-primary font-medium transition-colors text-sm tracking-wide bg-transparent border-none cursor-pointer p-0"
                                onClick={item.onClick}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="md:hidden w-11 h-11 flex items-center justify-center rounded-lg hover:bg-primary/5 text-primary transition-colors" onClick={toggleMobileNav}>
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <button
                            onClick={handleBookClick}
                            className="hidden md:flex btn-primary text-white px-5 sm:px-7 py-2.5 rounded-full font-semibold text-sm uppercase tracking-wider min-h-[44px] items-center gap-2 shadow-md"
                        >
                            <span className="hidden sm:inline">Book Appointment</span>
                            <span className="inline sm:hidden">Book</span>
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── HERO SECTION ── */}
            <section className="relative min-h-screen flex flex-col justify-center pt-24 pb-16 overflow-hidden">
                {/* Background image + overlays */}
                <div className="absolute inset-0 z-0 pointer-events-none select-none bg-white">
                    <img src="/bgpalm.jpeg" alt="" className="w-full h-full object-cover object-[70%_top] md:object-[right_top] opacity-100" />
                    {/* Frosted Glass Overlay */}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-[3px]"></div>
                    {/* Gradient for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-white/90 via-white/50 to-transparent md:via-white/40 md:to-transparent"></div>
                    <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-primary/[0.05] rounded-full blur-[130px]"></div>
                    <div className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] bg-[#00c3da]/[0.08] rounded-full blur-[100px]"></div>
                </div>

                {/* Decorative concentric circles (Half visible on the right edge of the Hero) */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] md:w-[600px] md:h-[600px] border-[12px] sm:border-[16px] md:border-[50px] border-primary/[0.15] rounded-full pointer-events-none translate-x-1/2 z-0"></div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[100px] h-[100px] sm:w-[130px] sm:h-[130px] md:w-[400px] md:h-[400px] border-[8px] sm:border-[12px] md:border-[40px] border-primary/[0.10] rounded-full pointer-events-none translate-x-1/2 z-0"></div>

                <div className="max-w-[1440px] mx-auto px-6 md:px-12 w-full relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

                        {/* Left Column */}
                        <div className="lg:col-span-6 xl:col-span-7 space-y-7 animate-slide-up flex flex-col items-center text-center lg:items-start lg:text-left mt-8 lg:mt-0">

                            {/* Headline */}
                            <div>
                                <h1 className="font-display leading-[1.04] tracking-tight font-bold">
                                    <span className="block text-[40px] sm:text-[52px] md:text-[60px] lg:text-[64px] text-gradient-primary">Advanced Ear, Nose</span>
                                    <span className="block text-[40px] sm:text-[52px] md:text-[60px] lg:text-[64px]">
                                        &amp; <span className="bg-gradient-to-r from-secondary via-[#b87800] to-secondary bg-clip-text text-transparent">Throat Care</span>
                                    </span>
                                </h1>
                                <p className="mt-6 text-base sm:text-lg text-on-surface-variant leading-relaxed max-w-[540px]">
                                    Experience world-class otolaryngology — where state-of-the-art diagnostic imaging, board-certified surgical precision, and a calming therapeutic sanctuary unite to restore your senses.
                                </p>
                            </div>

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-1 w-full max-w-sm mx-auto lg:mx-0 lg:max-w-none">
                                <button
                                    onClick={handleBookClick}
                                    className="btn-primary w-full text-white px-6 py-4 rounded-xl font-bold text-sm uppercase tracking-wider min-h-[52px] shadow-lg shadow-primary/15 hover:shadow-primary/30 flex items-center justify-center gap-2.5 transition-all duration-300"
                                >
                                    <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                                    Book Appointment
                                </button>
                                <button 
                                    onClick={() => navigate('/specialists')}
                                    className="bg-white/75 w-full backdrop-blur-md border border-outline-variant/30 text-primary px-6 py-4 rounded-xl font-bold text-sm hover:bg-white hover:border-primary/20 hover:shadow-lg transition-all min-h-[52px] flex items-center justify-center gap-2.5"
                                >
                                    <span className="material-symbols-outlined text-[20px]">groups</span>
                                    Meet Our Specialists
                                </button>
                            </div>

                        </div>

                        {/* Right Column — Visual Sandbox */}
                        <div className="hidden lg:flex lg:col-span-6 xl:col-span-5 relative w-full justify-center items-center mt-8 lg:mt-0">
                            {/* Main image card */}
                            <div className="relative z-10 w-full max-w-[370px] sm:max-w-[400px]">
                                <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-[0_32px_80px_-12px_rgba(0,75,80,0.25)] bg-primary border-4 border-white/90 group">
                                    <img src="/ent_hero.png" alt="PalmCrest Clinical Facility" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/10 to-transparent"></div>
                                    <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
                                        <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.15em] mb-1">Sanctuary Facility</p>
                                        <p className="text-white text-sm font-semibold leading-snug">State-of-the-art diagnostic & clinical consultation suites.</p>
                                    </div>
                                </div>

                                {/* Floating Widget 3 — Rating */}
                                <div className="absolute -left-4 sm:-left-8 bottom-20 z-20 bg-white/95 backdrop-blur-xl px-4 py-3 rounded-xl shadow-xl border border-white/70 animate-float-slow" style={{ animationDelay: '2s' }}>
                                    <div className="flex gap-0.5 mb-1">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <span key={s} className="material-symbols-outlined text-[14px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        ))}
                                    </div>
                                    <p className="text-[10px] font-bold text-primary">4.9 / 5.0 Rating</p>
                                    <p className="text-[9px] text-on-surface-variant">2,400+ reviews</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll cue */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 animate-bounce">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-primary">Explore</span>
                    <span className="material-symbols-outlined text-primary text-[20px]">keyboard_arrow_down</span>
                </div>
            </section>

            {/* ── BENTO GRID ── */}
            <section className="py-16 md:py-24 reveal relative overflow-hidden">
                {/* Decorative concentric circles (Half visible on the right edge) */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] md:w-[600px] md:h-[600px] border-[12px] sm:border-[16px] md:border-[50px] border-primary/[0.15] rounded-full pointer-events-none translate-x-1/2 z-[-1]"></div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[100px] h-[100px] sm:w-[130px] sm:h-[130px] md:w-[400px] md:h-[400px] border-[8px] sm:border-[12px] md:border-[40px] border-primary/[0.10] rounded-full pointer-events-none translate-x-1/2 z-[-1]"></div>

                <div className="px-6 md:px-12 max-w-[1440px] mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        {/* Large image */}
                        <div className="md:col-span-7 rounded-2xl overflow-hidden glass-card h-[280px] sm:h-[400px] md:h-[520px] relative group">
                            <img alt="Specialist" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="/1p.jpeg" />
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent"></div>
                            <div className="absolute bottom-6 left-6 right-6">
                                <span className="inline-block bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 border border-white/20">Our Specialists</span>
                                <p className="text-white font-bold text-lg leading-tight">Board-Certified Otolaryngologists<br />with Decades of Surgical Excellence</p>
                            </div>
                        </div>

                        <div className="md:col-span-5 flex flex-col gap-5">
                            {/* Tech card */}
                            <div className="glass-card p-6 rounded-2xl flex-1 flex flex-col justify-between glow-card">
                                <div>
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                                        <span className="material-symbols-outlined text-primary text-[24px]">biotech</span>
                                    </div>
                                    <h4 className="font-bold text-primary text-xl mb-2">Pioneering Technology</h4>
                                    <p className="text-on-surface-variant text-sm leading-relaxed">3D endoscopy and robotic-assisted surgical systems ensuring the highest precision with minimal recovery times.</p>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-secondary text-sm font-bold cursor-pointer hover:gap-4 transition-all w-fit">
                                    Learn more <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </div>
                            </div>

                            {/* Ethics card */}
                            <div className="glass-card p-6 rounded-2xl flex-1 flex flex-col justify-between glow-card">
                                <div>
                                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-5">
                                        <span className="material-symbols-outlined text-secondary text-[24px]">verified_user</span>
                                    </div>
                                    <h4 className="font-bold text-primary text-xl mb-2">Patient-First Ethics</h4>
                                    <p className="text-on-surface-variant text-sm leading-relaxed">Personalized care plans tailored to your unique biological needs, ensuring comfort throughout your entire journey.</p>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-secondary text-sm font-bold cursor-pointer hover:gap-4 transition-all w-fit">
                                    Our values <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SERVICES ── */}
            <section id="services" className="py-16 md:py-24 reveal relative overflow-hidden">
                {/* Decorative concentric circles (Half visible on the left edge) */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] md:w-[600px] md:h-[600px] border-[12px] sm:border-[16px] md:border-[50px] border-primary/[0.15] rounded-full pointer-events-none -translate-x-1/2 z-[-1]"></div>
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[100px] h-[100px] sm:w-[130px] sm:h-[130px] md:w-[400px] md:h-[400px] border-[8px] sm:border-[12px] md:border-[40px] border-primary/[0.10] rounded-full pointer-events-none -translate-x-1/2 z-[-1]"></div>

                <div className="px-6 md:px-12 max-w-[1440px] mx-auto">
                    <div className="text-center mb-12 md:mb-16">
                        <span className="inline-block text-secondary text-[11px] font-bold uppercase tracking-[0.22em] mb-3">Our Expertise</span>
                        <h2 className="font-display text-2xl md:text-4xl font-bold text-primary leading-tight">Specialized ENT Solutions</h2>
                        <p className="text-on-surface-variant mt-4 max-w-xl mx-auto text-base leading-relaxed">Comprehensive care spanning the full spectrum of ear, nose, and throat medicine — from routine checks to complex surgical interventions.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: 'hearing', title: 'Ear Care', color: 'bg-primary/8', iconColor: 'text-primary', desc: 'Comprehensive diagnostics for hearing loss, tinnitus management, and advanced middle-ear microsurgery with precision grafting.', tag: 'Otology' },
                            { icon: 'air', title: 'Nasal Health', color: 'bg-secondary/8', iconColor: 'text-secondary', desc: 'Expert treatment for chronic sinusitis, allergic rhinitis, and functional rhinoplasty using minimally invasive endoscopy.', tag: 'Rhinology' },
                            { icon: 'record_voice_over', title: 'Throat & Voice', color: 'bg-tertiary/8', iconColor: 'text-tertiary', desc: 'Specialized care for vocal fold disorders, swallowing difficulties, and comprehensive head and neck oncology screening.', tag: 'Laryngology' },
                        ].map((svc) => (
                            <div key={svc.title} className="glow-card glass-card p-6 rounded-2xl flex flex-col gap-6 group">
                                <div>
                                    <div className="flex items-center justify-between mb-5">
                                        <div className={`w-14 h-14 ${svc.color} rounded-xl flex items-center justify-center`}>
                                            <span className={`material-symbols-outlined text-[28px] ${svc.iconColor}`}>{svc.icon}</span>
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border border-outline-variant/30 px-3 py-1 rounded-full">{svc.tag}</span>
                                    </div>
                                    <h3 className="font-bold text-primary text-xl mb-3">{svc.title}</h3>
                                    <p className="text-on-surface-variant text-sm leading-relaxed">{svc.desc}</p>
                                </div>
                                <a className="text-secondary font-bold text-sm flex items-center gap-2 group-hover:gap-4 transition-all w-fit" href="#">
                                    Explore Treatment <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── DEPARTMENT EXPLORER ── */}
            <section className="py-16 md:py-24 reveal relative overflow-hidden">
                {/* Decorative concentric circles (Half visible on the right edge) */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] md:w-[600px] md:h-[600px] border-[12px] sm:border-[16px] md:border-[50px] border-primary/[0.15] rounded-full pointer-events-none translate-x-1/2 z-[-1]"></div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[100px] h-[100px] sm:w-[130px] sm:h-[130px] md:w-[400px] md:h-[400px] border-[8px] sm:border-[12px] md:border-[40px] border-primary/[0.10] rounded-full pointer-events-none translate-x-1/2 z-[-1]"></div>

                <div className="px-6 md:px-12 max-w-[1440px] mx-auto">
                    <div className="text-center mb-10 md:mb-14">
                        <span className="inline-block text-secondary text-[11px] font-bold uppercase tracking-[0.22em] mb-3">Clinical Deep-Dive</span>
                        <h2 className="font-display text-2xl md:text-4xl font-bold text-primary">Interactive Department Explorer</h2>
                        <p className="text-on-surface-variant mt-4 max-w-lg mx-auto text-base">Explore cutting-edge diagnostic tools and board-certified treatments at PalmCrest.</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex flex-wrap justify-center gap-2 mb-10">
                        {tabs.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveExploreTab(t.id)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${activeExploreTab === t.id
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.03]'
                                    : 'bg-white/70 backdrop-blur-md text-on-surface-variant hover:text-primary hover:bg-white border border-outline-variant/20 hover:shadow-md'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                        {/* Left card */}
                        <div className="lg:col-span-5">
                            <div className="glass-card rounded-2xl p-6 h-full border border-white/60 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full pointer-events-none"></div>
                                <span className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest inline-block mb-5">{dept.label}</span>
                                <h3 className="font-display text-2xl font-bold text-primary mb-3">{dept.title}</h3>
                                <p className="text-on-surface-variant text-sm leading-relaxed mb-6">{dept.desc}</p>
                                <div className="border-t border-primary/8 pt-5">
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary mb-3">Common Symptom Indicators</h4>
                                    <ul className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                                        {dept.symptoms.map(s => (
                                            <li key={s} className="flex items-center gap-2 text-xs font-semibold text-on-surface">
                                                <span className="material-symbols-outlined text-secondary text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Right cards */}
                        <div className="lg:col-span-7 flex flex-col gap-5">
                            {/* Diagnostics */}
                            <div>
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-secondary text-[16px]">biotech</span>
                                    Advanced Diagnostic Stack
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {dept.diagnostics.map(d => (
                                        <div key={d.name} className="bg-white rounded-xl p-5 border border-outline-variant/20 hover:border-primary/20 hover:shadow-md transition-all cursor-default">
                                            <p className="font-bold text-primary text-sm mb-1.5">{d.name}</p>
                                            <p className="text-on-surface-variant text-[11px] leading-relaxed">{d.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Therapeutics */}
                            <div>
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-secondary text-[16px]">healing</span>
                                    Advanced Therapeutics & Interventions
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {dept.therapeutics.map(t => (
                                        <div key={t.name} className="bg-white rounded-xl p-5 border border-outline-variant/20 hover:border-secondary/30 hover:shadow-md transition-all cursor-default">
                                            <p className="font-bold text-primary text-sm mb-1.5">{t.name}</p>
                                            <p className="text-on-surface-variant text-[11px] leading-relaxed">{t.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CTA strip */}
                            <div className="bg-primary rounded-xl p-5 flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-white font-bold text-sm">Ready to consult our {dept.label.split(' ')[0]} experts?</p>
                                    <p className="text-white/70 text-xs mt-0.5">Same-week appointments available.</p>
                                </div>
                                <button onClick={handleBookClick} className="flex-shrink-0 bg-white text-primary px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-white/90 transition-all flex items-center gap-2">
                                    Book Now <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── ABOUT SECTION ── */}
            <section className="py-16 md:py-24 reveal relative overflow-hidden">
                {/* Decorative concentric circles (Half visible on the left edge) */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] md:w-[600px] md:h-[600px] border-[12px] sm:border-[16px] md:border-[50px] border-primary/[0.15] rounded-full pointer-events-none -translate-x-1/2 z-[-1]"></div>
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[100px] h-[100px] sm:w-[130px] sm:h-[130px] md:w-[400px] md:h-[400px] border-[8px] sm:border-[12px] md:border-[40px] border-primary/[0.10] rounded-full pointer-events-none -translate-x-1/2 z-[-1]"></div>

                <div className="px-6 md:px-12 max-w-[1440px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* Image side */}
                        <div className="relative">
                            <div className="relative rounded-2xl overflow-hidden aspect-[4/4.5] shadow-[0_32px_80px_-12px_rgba(0,75,80,0.2)]">
                                <img alt="PalmCrest Sanctuary" className="w-full h-full object-cover" src="/2p.jpeg" />
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent"></div>
                            </div>

                            {/* Stat badge */}
                            <div className="absolute -bottom-5 -right-5 md:-bottom-8 md:-right-8 glass-card p-5 md:p-5 rounded-xl shadow-2xl border border-white/60 text-center">
                                <p className="font-display text-2xl md:text-3xl font-bold text-primary">25+</p>
                                <p className="text-[10px] md:text-xs text-on-surface-variant uppercase tracking-wider font-bold mt-1">Years of<br />Clinical Pedigree</p>
                            </div>

                            {/* Accent badge */}
                            <div className="absolute -top-5 -left-5 md:-top-6 md:-left-6 glass-card p-4 rounded-xl shadow-xl border border-white/60 flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>award_star</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-primary">JCI Accredited</p>
                                    <p className="text-[10px] text-on-surface-variant">International Standard</p>
                                </div>
                            </div>
                        </div>

                        {/* Content side */}
                        <div>
                            <span className="inline-block text-secondary text-[11px] font-bold uppercase tracking-[0.22em] mb-4">Our Story</span>
                            <h2 className="font-display text-2xl md:text-4xl font-bold text-primary leading-tight mb-6">
                                An Advanced<br />Sanctuary of Care
                            </h2>
                            <p className="text-on-surface-variant text-base leading-relaxed mb-8">
                                PalmCrest ENT was founded on the principle that medical treatment should be as precise as it is comfortable. Our facility uses acoustic engineering and soft-light aesthetics to create a calming therapeutic environment — because healing begins before the procedure.
                            </p>

                            <ul className="space-y-5 mb-10">
                                {[
                                    { icon: 'school', title: 'World-Renowned Specialists', desc: 'Board-certified otolaryngologists trained at leading global medical institutions.' },
                                    { icon: 'device_hub', title: 'Integrated Digital Records', desc: 'Seamless digital health journey from first consult to post-operative follow-up.' },
                                    { icon: 'smart_toy', title: 'AI-Assisted Diagnostics', desc: 'On-site surgical suites equipped with next-generation AI-assisted diagnostic tools.' },
                                ].map(item => (
                                    <li key={item.title} className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-primary/8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="material-symbols-outlined text-primary text-[20px]">{item.icon}</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-primary text-sm mb-0.5">{item.title}</p>
                                            <p className="text-on-surface-variant text-sm leading-relaxed">{item.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <button onClick={() => navigate('/about')} className="btn-primary text-white px-6 py-4 rounded-xl font-bold text-sm uppercase tracking-wider min-h-[52px] flex items-center gap-2.5 shadow-lg shadow-primary/15 hover:shadow-primary/30 transition-all duration-300">
                                <span className="material-symbols-outlined text-[20px]">history_edu</span>
                                Our Full History
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIALS ── */}
            <section className="py-16 md:py-24 reveal relative overflow-hidden" style={{ background: 'rgba(0,75,80,0.02)' }}>
                {/* Decorative concentric circles (Left edge) */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] md:w-[600px] md:h-[600px] border-[12px] sm:border-[16px] md:border-[50px] border-primary/[0.15] rounded-full pointer-events-none -translate-x-1/2 z-[-1]"></div>
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[100px] h-[100px] sm:w-[130px] sm:h-[130px] md:w-[400px] md:h-[400px] border-[8px] sm:border-[12px] md:border-[40px] border-primary/[0.10] rounded-full pointer-events-none -translate-x-1/2 z-[-1]"></div>

                {/* Decorative concentric circles (Right edge) */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] md:w-[600px] md:h-[600px] border-[12px] sm:border-[16px] md:border-[50px] border-primary/[0.15] rounded-full pointer-events-none translate-x-1/2 z-[-1]"></div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[100px] h-[100px] sm:w-[130px] sm:h-[130px] md:w-[400px] md:h-[400px] border-[8px] sm:border-[12px] md:border-[40px] border-primary/[0.10] rounded-full pointer-events-none translate-x-1/2 z-[-1]"></div>

                <div className="px-6 md:px-12 max-w-[1440px] mx-auto">
                    <div className="text-center mb-12 md:mb-14">
                        <span className="inline-block text-secondary text-[11px] font-bold uppercase tracking-[0.22em] mb-3">Patient Stories</span>
                        <h2 className="font-display text-2xl md:text-4xl font-bold text-primary">Voices of Recovery</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {(reviews.length > 0 
                            ? reviews.map(r => ({
                                quote: r.comments,
                                name: r.patientName,
                                role: `Patient of Dr. ${r.doctorName.split(' ').pop()}`,
                                rating: r.rating,
                                initials: r.patientName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                              }))
                            : [
                                {
                                    quote: "The level of care I received for my chronic sinusitis was unlike anything I've experienced. The 3D sinus mapping before surgery gave me immense confidence going in.",
                                    name: 'Sarah J. Lindquist', role: 'Sinus Surgery Patient', rating: 5, initials: 'SJ',
                                },
                                {
                                    quote: "PalmCrest ENT is truly a futuristic sanctuary. Dr. Vance and her team treated my hearing loss with such precision. I'm hearing sounds I haven't heard in a decade.",
                                    name: 'Robert McAllister', role: 'Cochlear Implant Patient', rating: 5, initials: 'RM',
                                },
                                {
                                    quote: "After years of struggling with vocal strain, the phonosurgery team here gave me my voice back. The facility is world-class and the follow-up care was exceptional.",
                                    name: 'Amara Osei-Bonsu', role: 'Voice Therapy Patient', rating: 5, initials: 'AO',
                                },
                            ]
                        ).slice(0, 6).map((t, i) => (
                            <div key={i} className="glass-card p-6 rounded-2xl flex flex-col justify-between gap-5 glow-card">
                                <div>
                                    {/* Stars */}
                                    <div className="flex gap-0.5 mb-4">
                                        {Array.from({ length: t.rating }).map((_, s) => (
                                            <span key={s} className="material-symbols-outlined text-[18px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        ))}
                                    </div>
                                    <span className="material-symbols-outlined text-[48px] text-secondary/10 block mb-2">format_quote</span>
                                    <p className="text-on-surface-variant text-sm leading-relaxed italic">"{t.quote}"</p>
                                </div>
                                <div className="flex items-center gap-3 border-t border-outline-variant/15 pt-5">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">{t.initials}</div>
                                    <div>
                                        <p className="font-bold text-primary text-sm">{t.name}</p>
                                        <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── EMERGENCY CTA ── */}
            <section className="px-6 md:px-12 max-w-[1440px] mx-auto py-16 md:py-24 reveal">
                <div className="bg-primary rounded-[2rem] p-6 sm:p-12 md:p-20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Decorative mesh */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[60px] pointer-events-none"></div>

                    <div className="relative z-10 text-white max-w-xl">
                        <span className="bg-error px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-5 inline-block">24/7 Priority Access</span>
                        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-5 leading-tight">Emergency ENT Portal</h2>
                        <p className="text-white/75 text-base leading-relaxed">Acute ear trauma, sudden hearing loss, or airway emergencies require immediate specialist intervention. Our priority unit is always standing by.</p>
                    </div>

                    <div className="relative z-10 flex flex-col items-center gap-3 w-full md:w-auto flex-shrink-0">
                        <a className="bg-white text-primary px-6 py-5 md:px-12 md:py-6 rounded-xl font-display text-lg sm:text-xl flex items-center justify-center gap-4 hover:scale-[1.03] transition-transform w-full md:w-auto shadow-xl" href="tel:+2348056913057">
                            <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>call</span>
                            +234 805 691 3057
                        </a>
                        <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Direct line to On-Call Specialists</p>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="border-t border-[#e8eef0] w-full py-14" style={{ background: '#f8fbfc' }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 px-6 md:px-12 max-w-[1440px] mx-auto mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-5">
                            <img src="/logo-ent.jpeg" alt="PalmCrest ENT Logo" className="h-10 w-auto object-contain shadow-sm rounded-lg" />
                            <span className="font-bold text-primary text-lg">PalmCrest</span>
                        </div>
                        <p className="text-on-surface-variant text-sm leading-relaxed">The Advanced Sanctuary of Care. Leading ENT medicine through innovation and empathy.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-primary text-sm uppercase tracking-wider mb-5">Services</h4>
                        <ul className="space-y-3 text-sm">
                            {['Otology', 'Rhinology', 'Laryngology', 'Audiology'].map(s => (
                                <li key={s}><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">{s}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-primary text-sm uppercase tracking-wider mb-5">Resources</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a onClick={handleBookClick} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Patient Portal</a></li>
                            <li><a onClick={() => navigate('/about')} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">About Us</a></li>
                            {['Specialist Directory', 'Department Directory', 'Patient FAQs', 'Terms of Service'].map(s => (
                                <li key={s}><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">{s}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-primary text-sm uppercase tracking-wider mb-5">Contact</h4>
                        <p className="text-on-surface-variant text-sm mb-1">100 Clinical Way, Medical District</p>
                        <p className="text-on-surface-variant text-sm mb-1">+234 805 691 3057</p>
                        <p className="text-on-surface-variant text-sm mb-4">Palmcrestentspecialisthospital@gmail.com</p>
                        <div className="flex gap-3">
                            <a href="https://www.facebook.com/share/1JdiM6CWBq/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all cursor-pointer border border-outline-variant/20" aria-label="Facebook">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                                </svg>
                            </a>
                            <a href="https://www.tiktok.com/@palmcrest.ent.spe?_r=1&_t=ZS-97fnezTeyua" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all cursor-pointer border border-outline-variant/20" aria-label="TikTok">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.8 1 1.89 1.73 3.11 2.14v3.83c-1.46-.07-2.88-.63-4.04-1.57-.42-.34-.78-.73-1.1-1.16v6.4c.03 2.14-.65 4.31-2.03 5.92-1.6 1.86-4.06 2.94-6.52 2.87-2.6-.08-5.11-1.43-6.52-3.66-1.52-2.39-1.57-5.56-.16-8 1.34-2.35 3.84-3.86 6.55-3.95v3.87c-1.28.1-2.48.83-3.13 1.94-.71 1.22-.64 2.89.2 4.02.83 1.12 2.27 1.76 3.66 1.55 1.48-.22 2.68-1.52 2.89-3v-12.2c.01-1.34 0-2.68.01-4.02z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="px-6 md:px-12 max-w-[1440px] mx-auto pt-8 border-t border-outline-variant/15 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-on-surface-variant text-center md:text-left">© 2026 PalmCrest ENT Hospital · Advanced Sanctuary of Care</p>
                    <div className="flex gap-6">
                        <a className="text-xs text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
                        <a className="text-xs text-on-surface-variant hover:text-primary transition-colors" href="#">Cookie Settings</a>
                        <a className="text-xs text-on-surface-variant hover:text-primary transition-colors" href="#">Accessibility</a>
                    </div>
                </div>
            </footer>

            {/* ── MOBILE NAV ── */}
            <div className={`fixed inset-0 bg-white z-[60] transform transition-transform duration-500 md:hidden ${isMobileNavOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Decorative concentric circles */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[150px] h-[150px] border-[12px] border-primary/[0.15] rounded-full pointer-events-none translate-x-1/2 z-0"></div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[100px] h-[100px] border-[8px] border-primary/[0.10] rounded-full pointer-events-none translate-x-1/2 z-0"></div>
                <div className="p-6 flex flex-col h-full relative z-10">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <img src="/logo-ent.jpeg" alt="PalmCrest ENT Logo" className="h-9 w-auto object-contain rounded-lg" />
                            <span className="font-bold text-primary text-lg">PalmCrest</span>
                        </div>
                        <button className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-primary/5 text-primary transition-colors" onClick={toggleMobileNav}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div className="flex flex-col gap-2">
                        {[
                            { icon: 'medical_services', label: 'Services', onClick: () => {
                                toggleMobileNav();
                                const el = document.getElementById('services');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }},
                            { icon: 'groups', label: 'Specialists', onClick: () => { toggleMobileNav(); navigate('/specialists'); } },
                            { icon: 'emergency', label: 'Emergency', onClick: () => { toggleMobileNav(); navigate('/emergency'); } },
                            { icon: 'info', label: 'About Us', onClick: () => { toggleMobileNav(); navigate('/about'); } },
                            { icon: 'contact_support', label: 'Contact', onClick: () => { toggleMobileNav(); navigate('/emergency'); } },
                        ].map(item => (
                            <button
                                key={item.label}
                                className="flex items-center gap-4 text-lg font-medium text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all py-3 px-4 rounded-xl w-full text-left bg-transparent border-none cursor-pointer"
                                onClick={item.onClick}
                            >
                                <span className="material-symbols-outlined text-primary">{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                        <div className="border-t border-outline-variant/10 my-2"></div>
                        <a className="flex items-center gap-4 text-lg font-semibold text-primary hover:bg-primary/5 transition-all py-3 px-4 rounded-xl cursor-pointer"
                            onClick={() => { toggleMobileNav(); navigate('/portal'); }}>
                            <span className="material-symbols-outlined text-primary">login</span>
                            Sign In
                        </a>
                    </div>
                    <div className="mt-auto">
                        <button onClick={() => { toggleMobileNav(); handleBookClick(); }} className="w-full btn-primary text-white py-4 rounded-lg text-lg font-bold min-h-[52px] flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                            Book Appointment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
