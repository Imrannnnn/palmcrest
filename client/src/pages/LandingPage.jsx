import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    useEffect(() => {
        // Reveal on scroll logic
        const observerOptions = {
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, observerOptions);

        const reveals = document.querySelectorAll('.reveal');
        reveals.forEach(el => observer.observe(el));

        // Smooth Navbar Shrink
        const handleScroll = () => {
            const nav = document.querySelector('nav');
            if (nav) {
                if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
                    nav.classList.add('py-2');
                    nav.classList.remove('py-4');
                } else {
                    nav.classList.add('py-4');
                    nav.classList.remove('py-2');
                }
            }
        };

        // Subtle micro-interaction: update background blobs on mouse move
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

    const toggleMobileNav = () => {
        setIsMobileNavOpen(!isMobileNavOpen);
    };

    const handleBookClick = () => {
        navigate('/portal');
    };

    return (
        <div className="font-body-md text-body-md text-[#191c1e] min-h-screen relative z-0">
            {/* Atmospheric Background */}
            <div className="bg-wave">
                <div className="absolute inset-0 z-[-1] opacity-50 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                        <path className="text-secondary-container opacity-40" d="M0,250 Q360,150 720,250 T1440,250" fill="none" stroke="currentColor" strokeWidth="2">
                            <animate
                                attributeName="d"
                                dur="18s"
                                repeatCount="indefinite"
                                values="M0,250 Q360,150 720,250 T1440,250; M0,250 Q360,350 720,250 T1440,250; M0,250 Q360,150 720,250 T1440,250"
                            />
                        </path>
                        <path className="text-primary opacity-30" d="M0,500 Q360,400 720,500 T1440,500" fill="none" stroke="currentColor" strokeWidth="2">
                            <animate
                                attributeName="d"
                                dur="15s"
                                repeatCount="indefinite"
                                values="M0,500 Q360,400 720,500 T1440,500; M0,500 Q360,600 720,500 T1440,500; M0,500 Q360,400 720,500 T1440,500"
                            />
                        </path>
                        <path className="text-secondary opacity-30" d="M0,700 Q360,600 720,700 T1440,700" fill="none" stroke="currentColor" strokeWidth="2">
                            <animate
                                attributeName="d"
                                dur="22s"
                                repeatCount="indefinite"
                                values="M0,700 Q360,800 720,700 T1440,700; M0,700 Q360,600 720,700 T1440,700; M0,700 Q360,800 720,700 T1440,700"
                            />
                        </path>
                    </svg>
                </div>
                <div className="wave-blob bg-primary top-[-10%]" style={{ width: '800px', height: '800px' }}></div>
                <div className="wave-blob bg-secondary bottom-[-10%] right-[-10%]" style={{ width: '600px', height: '600px', animationDelay: '-5s' }}></div>

                {/* Decorative concentric circles in main background */}
                <div className="absolute top-[10%] right-[-150px] w-[600px] h-[600px] border-[48px] border-primary/[0.03] dark:border-white/[0.03] rounded-full pointer-events-none z-[-1]"></div>
                <div className="absolute top-[10%] right-[-80px] w-[400px] h-[400px] border-[32px] border-primary/[0.015] dark:border-white/[0.015] rounded-full pointer-events-none z-[-1]"></div>
                <div className="absolute bottom-[15%] left-[-200px] w-[700px] h-[700px] border-[56px] border-primary/[0.03] dark:border-white/[0.03] rounded-full pointer-events-none z-[-1]"></div>
                <div className="absolute bottom-[15%] left-[-100px] w-[450px] h-[450px] border-[36px] border-primary/[0.015] dark:border-white/[0.015] rounded-full pointer-events-none z-[-1]"></div>
            </div>

            {/* TopNavBar */}
            <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-surface-container/70 backdrop-blur-xl border-b border-white/40 dark:border-outline-variant/20 shadow-sm transition-all duration-300">
                <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
                    <div className="text-lg sm:text-headline-md font-headline-md font-bold tracking-tight text-primary dark:text-primary-fixed">
                        PalmCrest ENT
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <a className="text-secondary dark:text-secondary-fixed-dim font-bold border-b-2 border-secondary" href="#">Services</a>
                        <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors" href="#">Specialists</a>
                        <a className="text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors" href="#">Emergency</a>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Hamburger Menu for Mobile */}
                        <button className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl hover:bg-primary/5 text-primary transition-colors" onClick={toggleMobileNav}>
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <button
                            onClick={handleBookClick}
                            className="btn-primary text-white px-4 sm:px-6 py-2.5 rounded-full font-label-md text-label-md uppercase tracking-wider min-h-[44px] flex items-center"
                        >
                            <span className="hidden sm:inline">Book Appointment</span>
                            <span className="inline sm:hidden">Book Now</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 md:pt-40 pb-12 md:pb-20 min-h-screen flex flex-col justify-center overflow-hidden">
                {/* Faint Background Image */}
                <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
                    <img
                        src="/ent_hero.png"
                        alt="ENT Hospital Background"
                        className="w-full h-full object-cover opacity-[0.12] dark:opacity-[0.08]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/40 to-transparent dark:from-surface-container/90 dark:via-surface-container/50"></div>
                </div>

                <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop w-full relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="font-display text-[32px] sm:text-[40px] md:text-display text-primary mb-6 leading-[1.1] tracking-tight">
                            Advanced Ear, Nose &amp; <span className="text-secondary">Throat Care</span>
                        </h1>
                        <p className="font-body text-base sm:text-body-lg text-on-surface-variant mb-8 sm:mb-10 leading-relaxed">
                            Experience medical excellence at the intersection of clinical precision and high-tech innovation.
                            PalmCrest ENT provides a sanctuary of care with world-class specialists dedicated to your sensory
                            health.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <button
                                onClick={handleBookClick}
                                className="btn-primary text-white px-8 py-4 rounded-xl font-label-md text-label-md min-h-[48px] w-full sm:w-auto text-center justify-center flex items-center"
                            >
                                Book Appointment
                            </button>
                            <button className="bg-white/50 backdrop-blur-md border border-outline-variant/30 text-primary px-8 py-4 rounded-xl font-label-md text-label-md hover:bg-white transition-all min-h-[48px] w-full sm:w-auto text-center justify-center flex items-center">
                                Meet Specialists
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Professional Doctor Image Section (Bento Style) */}
            <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-12 md:py-stack-lg reveal">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
                    <div className="md:col-span-7 rounded-3xl overflow-hidden glass-card h-[280px] sm:h-[380px] md:h-[500px] relative group">
                        <img
                            alt="Specialist"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            data-alt="A professional ENT specialist in a high-tech medical facility, wearing a crisp white coat and a focused expression. The background features blurred diagnostic screens showing 3D anatomical scans of the inner ear. The lighting is cool-toned and clinical yet welcoming, with soft cyan highlights reflecting the brand's modern healthcare aesthetic. The atmosphere conveys immense trust and technological sophistication."
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDBDbx2gC4OkLhELmkJrDQiUR5oMzzPvadarbunbC0WcNOoc1r1AkLzG3nvPrAeEbUklWmRYtoUtWKK4GEWUEuMb4xB9daaSRbr7Lwtb_EQ_5PvzMBlw7pvlN3vcHoJ7POm4nALqT6WAmMSv2reJ68-uoCDEaoquQaHzDSKkuIfUKeUKwlBlKsgBiYPFrk4sBZ4AWy779DWzAFBvndy8KswNWwXgKzD3c-HbxkHnHjbyYIhTy-wu8djAgai_dfQHG0rIixhOo9oHg"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>
                        <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 text-white">
                            <p className="font-label-md text-label-md uppercase tracking-widest opacity-80">Chief of Surgery</p>
                            <h3 className="font-headline-lg text-[22px] sm:text-headline-lg">Dr. Elena Vance</h3>
                        </div>
                    </div>
                    <div className="md:col-span-5 flex flex-col gap-gutter">
                        <div className="glass-card p-6 sm:p-8 rounded-3xl flex-1 flex flex-col justify-center">
                            <div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center mb-4 sm:mb-6">
                                <span className="material-symbols-outlined text-primary">biotech</span>
                            </div>
                            <h4 className="font-headline-md text-headline-md text-primary mb-2 sm:mb-4">Pioneering Technology</h4>
                            <p className="text-on-surface-variant text-sm sm:text-base">We utilize 3D endoscopy and robotic-assisted surgical systems to ensure the highest level of precision and minimal recovery times for our patients.</p>
                        </div>
                        <div className="glass-card p-6 sm:p-8 rounded-3xl flex-1 flex flex-col justify-center">
                            <div className="w-12 h-12 bg-tertiary-fixed-dim rounded-full flex items-center justify-center mb-4 sm:mb-6">
                                <span className="material-symbols-outlined text-primary">verified_user</span>
                            </div>
                            <h4 className="font-headline-md text-headline-md text-primary mb-2 sm:mb-4">Patient-First Ethics</h4>
                            <p className="text-on-surface-variant text-sm sm:text-base">Personalized care plans tailored to your unique biological needs, ensuring comfort throughout your journey at PalmCrest.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-12 md:py-stack-lg reveal">
                <div className="text-center mb-8 md:mb-16">
                    <span className="text-secondary font-label-md text-label-md uppercase tracking-[0.2em]">Our Expertise</span>
                    <h2 className="font-headline-lg text-2xl md:text-headline-lg text-primary mt-2 md:mt-4">Specialized ENT Solutions</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                    {/* Ear Card */}
                    <div className="glass-card p-6 sm:p-10 rounded-3xl hover:-translate-y-2 transition-transform duration-300 flex flex-col justify-between">
                        <div>
                            <span className="material-symbols-outlined text-[40px] md:text-display text-secondary-container mb-4 md:mb-6 block">hearing</span>
                            <h3 className="font-headline-md text-headline-md text-primary mb-3 md:mb-4">Ear Care</h3>
                            <p className="text-on-surface-variant text-sm sm:text-base mb-6">Comprehensive diagnostics for hearing loss, tinnitus management, and advanced middle-ear microsurgery.</p>
                        </div>
                        <a className="text-secondary font-label-md flex items-center gap-2 hover:gap-4 transition-all" href="#">
                            Learn More <span className="material-symbols-outlined">arrow_forward</span>
                        </a>
                    </div>
                    {/* Nose Card */}
                    <div className="glass-card p-6 sm:p-10 rounded-3xl hover:-translate-y-2 transition-transform duration-300 flex flex-col justify-between">
                        <div>
                            <span className="material-symbols-outlined text-[40px] md:text-display text-secondary-container mb-4 md:mb-6 block">air</span>
                            <h3 className="font-headline-md text-headline-md text-primary mb-3 md:mb-4">Nasal Health</h3>
                            <p className="text-on-surface-variant text-sm sm:text-base mb-6">Expert treatment for chronic sinusitis, allergic rhinitis, and functional rhinoplasty using minimally invasive techniques.</p>
                        </div>
                        <a className="text-secondary font-label-md flex items-center gap-2 hover:gap-4 transition-all" href="#">
                            Learn More <span className="material-symbols-outlined">arrow_forward</span>
                        </a>
                    </div>
                    {/* Throat Card */}
                    <div className="glass-card p-6 sm:p-10 rounded-3xl hover:-translate-y-2 transition-transform duration-300 flex flex-col justify-between">
                        <div>
                            <span className="material-symbols-outlined text-[40px] md:text-display text-secondary-container mb-4 md:mb-6 block">voice_over_off</span>
                            <h3 className="font-headline-md text-headline-md text-primary mb-3 md:mb-4">Throat &amp; Voice</h3>
                            <p className="text-on-surface-variant text-sm sm:text-base mb-6">Specialized care for vocal fold disorders, swallowing difficulties, and comprehensive head and neck oncology.</p>
                        </div>
                        <a className="text-secondary font-label-md flex items-center gap-2 hover:gap-4 transition-all" href="#">
                            Learn More <span className="material-symbols-outlined">arrow_forward</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="bg-surface-container-low py-12 md:py-stack-lg mt-12 md:mt-stack-lg reveal">
                <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-stack-lg items-center">
                    <div className="relative">
                        <div className="aspect-square rounded-full overflow-hidden border-[8px] md:border-[16px] border-white/50 shadow-2xl">
                            <img
                                alt="Sanctuary"
                                className="w-full h-full object-cover"
                                data-alt="An expansive view of the PalmCrest ENT Hospital lobby, showcasing minimalist architecture with high ceilings, glass walls, and lush indoor greenery. The space is flooded with natural morning light, creating a serene, spa-like environment rather than a traditional hospital. The design features soft curves and premium materials like marble and light oak wood, reflecting a luxury healthcare brand."
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZrZ_xErMbuGeY6iGsF5uUDOcB5lAkTAfGgiInmNnXd71ylBFUZWlbENzpMzizdaOVDzGQgT1WoRiv5pCEWVabPK3Os___YGLGDtHgRvJL7I04DfFXPlomayUJgUcQIrgAi1PLt9yPgJFT3yC2CM4aodxoKUBv7lZ0WVH6XpKs0kWHDEXo188V2-09UM1T8i2tdOqezL6v29I-wrDuIBSkPi6WxtQavBVGU5Kz6XVIC4cQsSj8_FbEdqn-qRzVNeKsVhjGoAihO3U"
                            />
                        </div>
                        {/* Stat Badge */}
                        <div className="absolute -bottom-4 -right-4 md:-bottom-10 md:-right-10 glass-card p-4 md:p-8 rounded-2xl shadow-xl">
                            <p className="font-display text-2xl md:text-display text-primary">25+</p>
                            <p className="font-label-md text-[10px] md:text-label-md text-on-surface-variant leading-tight">Years of Clinical Pedigree</p>
                        </div>
                    </div>
                    <div className="pl-0 md:pl-16">
                        <h2 className="font-display text-2xl md:text-headline-lg text-primary mb-4 md:mb-6">An Advanced Sanctuary of Care</h2>
                        <p className="text-base md:text-body-lg text-on-surface-variant mb-6 md:mb-8 leading-relaxed">
                            PalmCrest ENT was founded on the principle that medical treatment should be as precise as it is
                            comfortable. Our facility is designed to reduce patient anxiety, utilizing acoustic engineering and
                            soft-light aesthetics to create a calming environment.
                        </p>
                        <ul className="space-y-4 mb-8 md:mb-10">
                            <li className="flex items-start gap-4">
                                <span className="material-symbols-outlined text-on-tertiary-container mt-0.5">check_circle</span>
                                <span className="text-on-surface text-sm sm:text-base">Board-certified specialists from world-renowned medical institutions.</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="material-symbols-outlined text-on-tertiary-container mt-0.5">check_circle</span>
                                <span className="text-on-surface text-sm sm:text-base">Integrated digital health records for seamless patient journeys.</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="material-symbols-outlined text-on-tertiary-container mt-0.5">check_circle</span>
                                <span className="text-on-surface text-sm sm:text-base">On-site surgical suites equipped with AI-assisted diagnostics.</span>
                            </li>
                        </ul>
                        <button className="bg-primary text-white px-8 py-4 rounded-xl font-label-md hover:bg-primary/90 transition-colors min-h-[48px] flex items-center justify-center">
                            Our History
                        </button>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-12 md:py-stack-lg reveal">
                <h2 className="font-headline-lg text-2xl md:text-headline-lg text-primary text-center mb-8 md:mb-16">Patient Stories</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                    <div className="glass-card p-6 sm:p-10 rounded-3xl relative">
                        <span className="material-symbols-outlined text-[48px] md:text-[64px] text-secondary/10 absolute top-4 right-6 md:right-8">format_quote</span>
                        <p className="text-base md:text-body-lg text-on-surface-variant italic mb-6 md:mb-8 relative z-10 leading-relaxed">
                            "The level of care I received for my chronic sinusitis was unlike anything I've experienced. The
                            technology they used to map my sinuses before surgery gave me so much confidence."
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-surface-container-highest overflow-hidden">
                                <img
                                    alt="Sarah L."
                                    data-alt="Portrait of a smiling woman in her late 30s, looking relaxed and healthy. The lighting is soft and natural, emphasizing a sense of relief and recovery. Background is a blurred modern interior."
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA94UoN7Waqd_dYMzFyLkf8xmryH3nUxWEe4hRSuhVexWXsC146RV_QTUlBaaDiyybHMmRQD1W_f2PiKuQxuwPMTz2ewi0V4j-JBjfeWfe0oZKsTxPS8vn48FVJj-eZym9kU73ZnrmR2i352kGXoA2esmIPHc5w2uEArIe-EsPV7oJOhmdbM8rDsW8RQ4dro7UvnvpSsGzdYjcv60ULJKQjMwX2Y7LmnRXKQctWPJQwSIXd_Ar8riwVAFV44Y2E-ke-OwbtVZNB0NE"
                                />
                            </div>
                            <div>
                                <p className="font-bold text-primary text-sm sm:text-base">Sarah J. Lindquist</p>
                                <p className="text-[10px] sm:text-caption text-on-surface-variant uppercase tracking-wider">Voice Specialist Patient</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-6 sm:p-10 rounded-3xl relative">
                        <span className="material-symbols-outlined text-[48px] md:text-[64px] text-secondary/10 absolute top-4 right-6 md:right-8">format_quote</span>
                        <p className="text-base md:text-body-lg text-on-surface-variant italic mb-6 md:mb-8 relative z-10 leading-relaxed">
                            "PalmCrest ENT is truly a futuristic sanctuary. Dr. Vance and her team treated my hearing loss with
                            such precision. I'm hearing sounds I haven't heard in a decade."
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-surface-container-highest overflow-hidden">
                                <img
                                    alt="Robert M."
                                    data-alt="Portrait of a middle-aged man with a graying beard, looking thoughtful and content. The setting is bright and professional, suggesting a positive clinical outcome. The style is clean and high-fidelity."
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaTQrvTDwhmZs256USSJC-cxiU-e2X43ppPaAAfbQyugIRHiHqxNqc0x8EasxIs1FVkvQJamqs3B0ovmP_eJhH5lVbd4OEWjrwf_CMcFa-JI0Pc39NR4r8UvmgH9TFAYlHfcKnmsZsiUi-eQKxn9nP62BK66V24oBswE1suZnLkvtyinAYpQBxKse5WNEdCjkB9CkriUjbMOrbE62-oz6XiUZKUx0_4Sgnl4rdvrFUD9llM6xpgE0jRuk8oJC_a9LLVnY-3fweNYQ"
                                />
                            </div>
                            <div>
                                <p className="font-bold text-primary text-sm sm:text-base">Robert McAllister</p>
                                <p className="text-[10px] sm:text-caption text-on-surface-variant uppercase tracking-wider">Hearing Restoration Patient</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Emergency Contact Section */}
            <section className="mx-margin-mobile md:mx-auto max-w-container-max mb-12 md:mb-stack-lg reveal">
                <div className="bg-primary-container rounded-[2rem] p-6 sm:p-10 md:p-20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
                    {/* Decorative Pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div
                            className="absolute top-0 left-0 w-full h-full"
                            style={{
                                backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)',
                                backgroundSize: '40px 40px'
                            }}
                        ></div>
                    </div>
                    <div className="relative z-10 text-white max-w-xl">
                        <span className="bg-error px-4 py-1 rounded-full text-caption font-bold uppercase tracking-widest mb-4 md:mb-6 inline-block">24/7 Priority</span>
                        <h2 className="font-display text-2xl sm:text-[32px] md:text-display mb-4 md:mb-6">Emergency ENT Portal</h2>
                        <p className="text-base md:text-body-lg opacity-80">Acute ear trauma, sudden hearing loss, or airway emergencies require immediate specialist intervention. Our priority unit is standing by.</p>
                    </div>
                    <div className="relative z-10 flex flex-col gap-3 w-full md:w-auto">
                        <a
                            className="bg-white text-primary px-6 py-4 md:px-10 md:py-6 rounded-2xl font-display text-lg sm:text-headline-md flex items-center justify-center gap-4 hover:scale-[1.02] md:hover:scale-105 transition-transform w-full md:w-auto"
                            href="tel:1-800-PALM-ENT"
                        >
                            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>call</span>
                            +1-800-PALM-ENT
                        </a>
                        <p className="text-white text-center opacity-60 font-label-md text-xs md:font-label-md">Direct line to On-Call Specialists</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-surface-container-lowest dark:bg-surface-dim border-t border-outline-variant/30 w-full py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-gutter px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
                    <div className="col-span-1">
                        <div className="text-headline-sm font-headline-md text-primary dark:text-primary-fixed mb-4 md:mb-6">PalmCrest ENT</div>
                        <p className="text-body-md text-on-surface-variant mb-6 sm:mb-0">The Advanced Sanctuary of Care. Leading the future of ENT medicine through innovation and empathy.</p>
                    </div>
                    <div>
                        <h4 className="font-label-md text-primary mb-4 md:mb-6">Services</h4>
                        <ul className="space-y-3">
                            <li><a className="text-on-surface-variant hover:text-primary transition-all" href="#">Hearing Diagnostics</a></li>
                            <li><a className="text-on-surface-variant hover:text-primary transition-all" href="#">Sinus Surgery</a></li>
                            <li><a className="text-on-surface-variant hover:text-primary transition-all" href="#">Voice Therapy</a></li>
                            <li><a className="text-on-surface-variant hover:text-primary transition-all" href="#">Sleep Apnea</a></li>
                        </ul>
                    </div>
                    <div className="mt-6 sm:mt-0">
                        <h4 className="font-label-md text-primary mb-4 md:mb-6">Resources</h4>
                        <ul className="space-y-3">
                            <li><a onClick={handleBookClick} className="text-on-surface-variant hover:text-primary transition-all cursor-pointer">Patient Portal</a></li>
                            <li><a className="text-on-surface-variant hover:text-primary transition-all" href="#">Specialist Directory</a></li>
                            <li><a className="text-on-surface-variant hover:text-primary transition-all" href="#">Department Directory</a></li>
                            <li><a className="text-on-surface-variant hover:text-primary transition-all" href="#">Terms of Service</a></li>
                        </ul>
                    </div>
                    <div className="mt-6 md:mt-0">
                        <h4 className="font-label-md text-primary mb-4 md:mb-6">Contact</h4>
                        <p className="text-on-surface-variant mb-2">100 Clinical Way, Medical District</p>
                        <p className="text-on-surface-variant mb-4">info@palmcrestent.com</p>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all cursor-pointer">
                                <span className="material-symbols-outlined">share</span>
                            </div>
                            <div className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all cursor-pointer">
                                <span className="material-symbols-outlined">public</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-outline-variant/10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-caption font-caption text-on-surface-variant text-center md:text-left">© 2026 PalmCrest ENT Hospital. Advanced Sanctuary of Care.</p>
                    <div className="flex gap-8">
                        <a className="text-caption font-caption text-on-surface-variant hover:text-primary" href="#">Privacy Policy</a>
                        <a className="text-caption font-caption text-on-surface-variant hover:text-primary" href="#">Cookie Settings</a>
                    </div>
                </div>
            </footer>

            {/* Side Navigation Menu (Mobile Only) */}
            <div
                id="mobile-nav"
                className={`fixed inset-0 bg-white dark:bg-surface-container z-[60] transform transition-transform duration-500 md:hidden overflow-hidden ${isMobileNavOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Decorative concentric circles */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[350px] h-[350px] border-[32px] border-primary/[0.04] dark:border-white/[0.04] rounded-full pointer-events-none -ml-28 z-0"></div>
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[220px] h-[220px] border-[24px] border-primary/[0.02] dark:border-white/[0.02] rounded-full pointer-events-none -ml-14 z-0"></div>

                <div className="p-6 sm:p-8 flex flex-col h-full relative z-10">
                    <div className="flex justify-between items-center mb-8">
                        <span className="text-headline-md font-bold text-primary dark:text-primary-fixed">PalmCrest</span>
                        <button className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-primary/5 text-primary dark:text-primary-fixed transition-colors" onClick={toggleMobileNav}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div className="flex flex-col gap-3">
                        <a className="flex items-center gap-4 text-lg font-medium text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all py-2.5 px-4 rounded-2xl" href="#" onClick={toggleMobileNav}>
                            <span className="material-symbols-outlined text-primary">medical_services</span>
                            Services
                        </a>
                        <a className="flex items-center gap-4 text-lg font-medium text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all py-2.5 px-4 rounded-2xl" href="#" onClick={toggleMobileNav}>
                            <span className="material-symbols-outlined text-primary">groups</span>
                            Specialists
                        </a>
                        <a className="flex items-center gap-4 text-lg font-medium text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all py-2.5 px-4 rounded-2xl" href="#" onClick={toggleMobileNav}>
                            <span className="material-symbols-outlined text-primary">emergency</span>
                            Emergency
                        </a>
                        <a className="flex items-center gap-4 text-lg font-medium text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all py-2.5 px-4 rounded-2xl" href="#" onClick={toggleMobileNav}>
                            <span className="material-symbols-outlined text-primary">contact_support</span>
                            Contact
                        </a>

                        <div className="border-t border-outline-variant/10 my-2"></div>

                        <a
                            className="flex items-center gap-4 text-lg font-semibold text-primary dark:text-primary-fixed hover:text-secondary hover:bg-primary/5 transition-all py-2.5 px-4 rounded-2xl cursor-pointer"
                            onClick={() => { toggleMobileNav(); navigate('/portal'); }}
                        >
                            <span className="material-symbols-outlined text-primary">login</span>
                            Sign In
                        </a>
                    </div>
                    <div className="mt-auto">
                        <button
                            onClick={() => { toggleMobileNav(); handleBookClick(); }}
                            className="w-full btn-primary text-white py-4 rounded-xl text-lg font-medium min-h-[48px] flex items-center justify-center"
                        >
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
