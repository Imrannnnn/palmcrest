import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
    const navigate = useNavigate();

    const services = [
        { title: 'Specialist ENT Consultation', icon: 'clinical_notes', desc: 'Expert medical opinion and personalized diagnosis for disorders of the ear, nose, throat, head, and neck.' },
        { title: 'Video/Endoscopic Laryngoscopy', icon: 'videocam', desc: 'High-definition video visualization of the larynx and vocal cords to evaluate voice, swallowing, and airway issues.' },
        { title: 'Endoscopic Sinus and Nose Surgery', icon: 'air', desc: 'Minimally invasive advanced sinus surgeries to restore proper breathing and address chronic sinusitis.' },
        { title: 'Head and Neck Cancer Surgery', icon: 'personal_injury', desc: 'Precision surgical oncology and reconstruction for tumors and malignancies affecting the head and neck region.' },
        { title: 'Foreign Body Removal from the Ear, Nose, and Throat', icon: 'back_hand', desc: 'Safe, prompt, and specialized extraction of foreign objects from sensitive ENT passages.' },
        { title: 'Diagnosis and Management of Hearing Loss', icon: 'hearing', desc: 'Advanced audiological mapping and custom treatment solutions for all degrees of hearing impairment.' },
        { title: 'Snoring and Sleep Disorder Evaluation and Management', icon: 'bedtime', desc: 'Comprehensive assessments and tailored therapies for snoring, sleep apnea, and sleep disturbances.' },
        { title: 'Comprehensive Audiological Assessment', icon: 'equalizer', desc: 'Scientific diagnostic hearing tests, tympanometry, and specialist evaluations for patients of all ages.' },
        { title: 'Dizziness, Vertigo, and Balance Disorder Evaluation and Management', icon: 'rotate_right', desc: 'Specialized testing and vestibular rehabilitation therapies to diagnose and treat balance issues.' }
    ];

    const values = [
        { name: 'Excellence', icon: 'workspace_premium', desc: 'Striving for the highest clinical and service quality in everything we do.' },
        { name: 'Compassion', icon: 'favorite', desc: 'Providing empathetic, patient-centered care with kindness and understanding.' },
        { name: 'Integrity', icon: 'gavel', desc: 'Upholding the highest moral and ethical standards, transparency, and trust.' },
        { name: 'Innovation', icon: 'lightbulb', desc: 'Embracing advanced medical technology and modern treatment modalities.' },
        { name: 'Professionalism', icon: 'badge', desc: 'Delivering expert care through dedicated, highly trained healthcare specialists.' }
    ];

    return (
        <div className="min-h-screen text-[#191c1e] bg-gradient-to-br from-[#f8fdff] via-white to-[#f4fcff] flex flex-col font-body-md relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none"></div>

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

            {/* Main Content */}
            <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-12 md:py-20 space-y-16 md:space-y-24">
                
                {/* Hero / Introduction Header */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
                    <div className="lg:col-span-7 space-y-6">
                        <span className="inline-block text-secondary text-[11px] font-bold uppercase tracking-[0.22em] mb-2">About Us</span>
                        <h1 className="font-display text-4xl sm:text-5xl font-bold text-primary tracking-tight leading-tight">
                            Palmcrest ENT <br/>
                            <span className="text-secondary font-display">Specialist Hospital</span>
                        </h1>
                        <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed">
                            Established in 2020, Palmcrest ENT Specialist Hospital is a leading specialist healthcare facility dedicated to the prevention, diagnosis, treatment, and surgical management of disorders affecting the Ear, Nose, Throat (ENT), Head, and Neck. Since our inception, we have remained committed to delivering exceptional, patient-centered care through a team of highly skilled specialists, modern diagnostic technology, and evidence-based medical practice.
                        </p>
                        <div className="border-l-4 border-primary pl-4 py-2 bg-primary/[0.02] rounded-r-xl">
                            <p className="text-on-surface-variant text-sm italic">
                                Palmcrest ENT Specialist Hospital has proudly served patients since 2020, earning a reputation for excellence in specialized ENT care through clinical expertise, patient-focused service, and a commitment to improving lives.
                            </p>
                        </div>
                    </div>
                    
                    {/* Visual Brand Image container */}
                    <div className="lg:col-span-5 relative">
                        <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-[0_24px_50px_rgba(0,75,80,0.15)]">
                            <img alt="Palmcrest Entrance" className="w-full h-full object-cover" src="/2p.jpeg" />
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/45 to-transparent"></div>
                        </div>
                        {/* Pedigree Badge */}
                        <div className="absolute -bottom-5 -right-5 glass-card p-4 rounded-2xl shadow-xl border border-white/60 text-center">
                            <p className="font-display text-2xl font-bold text-primary">Est. 2020</p>
                            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold mt-0.5">Specialist Facility</p>
                        </div>
                    </div>
                </div>

                {/* Our Goal banner */}
                <div className="glass-card p-8 md:p-12 rounded-3xl border border-outline-variant/30 text-center max-w-4xl mx-auto shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00c3da]/[0.02] rounded-full translate-x-8 -translate-y-8"></div>
                    <span className="material-symbols-outlined text-[48px] text-primary/15 block mb-4">clinical_notes</span>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-primary mb-4">Our Core Goal</h3>
                    <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                        Our goal is to improve the health and quality of life of every patient by providing compassionate, personalized, and world-class ENT services in a safe, comfortable, and welcoming environment. We care for patients of all ages, ensuring that each individual receives the highest standard of treatment tailored to their needs.
                    </p>
                </div>

                {/* Comprehensive Range of Services */}
                <div className="space-y-10">
                    <div className="text-center max-w-xl mx-auto">
                        <span className="inline-block text-secondary text-[11px] font-bold uppercase tracking-[0.22em] mb-3">What We Do</span>
                        <h2 className="font-display text-3xl font-bold text-primary">Our Comprehensive Services</h2>
                        <p className="text-on-surface-variant text-sm mt-2">Leading treatments and procedures engineered for patients of all ages.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((svc) => (
                            <div key={svc.title} className="glass-card p-6 rounded-2xl border border-outline-variant/20 hover:border-primary/20 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="w-11 h-11 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined text-[22px]">{svc.icon}</span>
                                    </div>
                                    <h3 className="font-bold text-primary text-base leading-snug">{svc.title}</h3>
                                    <p className="text-on-surface-variant text-xs leading-relaxed">{svc.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Core Values */}
                <div className="space-y-10">
                    <div className="text-center max-w-xl mx-auto">
                        <span className="inline-block text-secondary text-[11px] font-bold uppercase tracking-[0.22em] mb-3">Our Core Philosophy</span>
                        <h2 className="font-display text-3xl font-bold text-primary">Our Core Values</h2>
                        <p className="text-on-surface-variant text-sm mt-2">
                            At Palmcrest ENT Specialist Hospital, we are driven by excellence, compassion, integrity, innovation, and professionalism. We continually invest in advanced medical technology and the continuous development of our healthcare professionals to ensure the best possible outcomes for our patients.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        {values.map((v) => (
                            <div key={v.name} className="glass-card p-5 rounded-2xl border border-outline-variant/20 hover:shadow-md transition-all text-center flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full bg-secondary/8 text-secondary flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-[24px]">{v.icon}</span>
                                </div>
                                <h3 className="font-bold text-primary text-sm mb-2">{v.name}</h3>
                                <p className="text-on-surface-variant text-[11px] leading-relaxed">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Vision & Mission Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Vision */}
                    <div className="glass-card p-8 rounded-3xl border border-outline-variant/25 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/[0.01] rounded-full translate-x-6 -translate-y-6"></div>
                        <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-6">
                            <span className="material-symbols-outlined text-[24px]">visibility</span>
                        </div>
                        <h3 className="font-display text-xl font-bold text-primary mb-3">Our Vision</h3>
                        <p className="text-on-surface-variant text-sm leading-relaxed">
                            To be the leading center of excellence in Ear, Nose, Throat, Head and Neck healthcare, recognized for outstanding clinical services, innovation, and exceptional patient satisfaction.
                        </p>
                    </div>

                    {/* Mission */}
                    <div className="glass-card p-8 rounded-3xl border border-outline-variant/25 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/[0.01] rounded-full translate-x-6 -translate-y-6"></div>
                        <div className="w-12 h-12 bg-secondary/5 rounded-xl flex items-center justify-center text-secondary mb-6">
                            <span className="material-symbols-outlined text-[24px]">explore</span>
                        </div>
                        <h3 className="font-display text-xl font-bold text-primary mb-3">Our Mission</h3>
                        <p className="text-on-surface-variant text-sm leading-relaxed">
                            To provide accessible, high-quality, and specialized ENT, Head and Neck services through expert medical care, advanced technology, and compassionate service while improving the health and well-being of the communities we serve.
                        </p>
                    </div>
                </div>

                {/* Closing Tagline */}
                <div className="text-center py-10 border-t border-outline-variant/15">
                    <p className="font-display text-xl sm:text-2xl font-bold text-primary max-w-2xl mx-auto leading-relaxed italic">
                        "Palmcrest ENT Specialist Hospital – Restoring Hearing, Improving Breathing, Enhancing Lives."
                    </p>
                </div>
            </main>
        </div>
    );
}
