import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DoctorPortal() {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedDay, setSelectedDay] = useState('WED');

    const scheduleData = {
        MON: [
            { time: '09:00 AM', title: 'Clinical Consultation', desc: 'General Ear/Nose diagnostics and reviews', duration: '60 mins', borderClass: 'border-l-secondary' }
        ],
        TUE: [
            { time: '11:30 AM', title: 'Scheduled Surgery', desc: 'Septoplasty & Sinus clearing procedures', duration: '90 mins', borderClass: 'border-l-primary' }
        ],
        WED: [
            { time: '09:00 AM', title: 'Morning Rounds', desc: 'Patient updates and chart alignment', duration: '45 mins', borderClass: 'border-l-primary' },
            { time: '01:00 PM', title: 'ENT Exam (Current)', desc: 'Mrs. Eleanor Rigby (Sinus Pressure review)', duration: '30 mins', borderClass: 'border-l-secondary', isCurrent: true },
            { time: '03:00 PM', title: 'Post-Op Follow up', desc: 'Mr. Thomas Shelby (septoplasty check)', duration: '30 mins', borderClass: 'border-l-secondary' }
        ],
        THU: [
            { time: '10:00 AM', title: 'Academic Lectures', desc: 'Research presentation & case reviews', duration: '60 mins', borderClass: 'border-l-primary' }
        ],
        FRI: [
            { time: '02:00 PM', title: 'New Patient Intake', desc: 'Initial otolaryngology consults', duration: '45 mins', borderClass: 'border-l-secondary' }
        ],
        SAT: [],
        SUN: []
    };

    // Patient requests state
    const [requests, setRequests] = useState([
        { id: 1, name: 'Arthur Shelby', condition: 'Chronic Sinusitis', initials: 'AS', status: 'PENDING', statusColor: 'bg-secondary/10 text-secondary' },
        { id: 2, name: 'Linda Mitchell', condition: 'Post-Op Review', initials: 'LM', status: 'APPROVED', statusColor: 'bg-tertiary/10 text-tertiary' }
    ]);

    // Active Patient Notes state
    const [notes, setNotes] = useState([
        { id: 1, name: 'Eleanor Rigby', note: 'Patient reports increased pressure in the left sinus region over the last 48 hours. Suggesting nasal endoscopy during today\'s visit.', time: 'Updated 2h ago', badge: 'Urgent', badgeColor: 'text-secondary' },
        { id: 2, name: 'Thomas Shelby', note: 'Post-septoplasty recovery proceeding well. Minimal inflammation. Scheduled for stitch removal in 3 days.', time: 'Updated 5h ago', badge: 'Routine', badgeColor: 'text-tertiary' },
        { id: 3, name: 'Grace Burgess', note: 'Wait-and-watch approach for mild tinnitus. Patient to keep a sound diary for the next two weeks.', time: 'Updated 1d ago', badge: 'Monitoring', badgeColor: 'text-on-surface-variant' }
    ]);

    useEffect(() => {
        // Simple entrance animation for cards
        const cards = document.querySelectorAll('.glass-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 * index);
        });

        // Handle window resize for sidebar
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);

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

        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const toggleNotifications = () => {
        setIsNotificationsOpen(!isNotificationsOpen);
    };

    const handleAccept = (id) => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'APPROVED', statusColor: 'bg-tertiary/10 text-tertiary' } : r));
    };

    const handleReject = (id) => {
        setRequests(prev => prev.filter(r => r.id !== id));
    };

    const handleNewAnnotation = () => {
        const name = prompt("Enter Patient Name:");
        if (!name) return;
        const noteText = prompt("Enter Clinical Annotation:");
        if (!noteText) return;
        const badge = prompt("Enter Priority (Urgent, Routine, Monitoring):", "Routine");

        let badgeColor = 'text-tertiary';
        if (badge?.toLowerCase() === 'urgent') badgeColor = 'text-secondary';
        if (badge?.toLowerCase() === 'monitoring') badgeColor = 'text-on-surface-variant';

        const newNote = {
            id: Date.now(),
            name,
            note: `"${noteText}"`,
            time: 'Updated just now',
            badge: badge || 'Routine',
            badgeColor
        };

        setNotes([newNote, ...notes]);
    };

    const handleLogout = () => {
        navigate('/portal');
    };

    return (
        <div className="text-[#191c1e] font-body-md h-[100dvh] flex w-full text-left relative z-0 overflow-hidden">
            {/* Atmospheric Background */}
            <div className="bg-wave">
                <div className="wave-blob bg-primary-fixed top-[-100px] left-[-100px]"></div>
                <div className="wave-blob bg-secondary-container bottom-[-150px] right-[-150px]" style={{ animationDelay: '-4s' }}></div>
                <div className="wave-blob bg-tertiary-fixed-dim top-[35%] right-[20%]" style={{ animationDelay: '-8s' }}></div>
                <div className="wave-blob bg-secondary-fixed top-[15%] left-[40%]" style={{ animationDelay: '-12s' }}></div>
                <div className="wave-blob bg-primary-container bottom-[25%] left-[200px]" style={{ animationDelay: '-16s' }}></div>

                {/* Decorative concentric circles in main background */}
                <div className="absolute top-[10%] right-[-150px] w-[600px] h-[600px] border-[48px] border-primary/[0.03] dark:border-white/[0.03] rounded-full pointer-events-none z-[-1]"></div>
                <div className="absolute top-[10%] right-[-80px] w-[400px] h-[400px] border-[32px] border-primary/[0.015] dark:border-white/[0.015] rounded-full pointer-events-none z-[-1]"></div>
                <div className="absolute bottom-[15%] left-[-200px] w-[700px] h-[700px] border-[56px] border-primary/[0.03] dark:border-white/[0.03] rounded-full pointer-events-none z-[-1]"></div>
                <div className="absolute bottom-[15%] left-[-100px] w-[450px] h-[450px] border-[36px] border-primary/[0.015] dark:border-white/[0.015] rounded-full pointer-events-none z-[-1]"></div>
            </div>

            {/* Sidebar Backdrop for Mobile */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-30 md:hidden transition-opacity" 
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* SideNavBar */}
            <aside className={`fixed left-0 top-0 h-full w-[280px] z-40 bg-surface/90 md:bg-surface/50 backdrop-blur-2xl border-r border-white/40 flex flex-col p-6 transition-transform duration-300 ease-in-out overflow-hidden ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                {/* Decorative concentric circles */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[350px] h-[350px] border-[32px] border-primary/10 dark:border-white/10 rounded-full pointer-events-none -ml-28 z-0"></div>
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[220px] h-[220px] border-[24px] border-primary/5 dark:border-white/5 rounded-full pointer-events-none -ml-14 z-0"></div>

                <div className="flex flex-col h-full w-full relative z-10 gap-stack-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
                        </div>
                        <div>
                            <h1 className="text-headline-sm font-headline-md text-primary leading-none">PalmCrest ENT</h1>
                            <p className="text-caption text-on-surface-variant font-label-md">Clinical Excellence</p>
                        </div>
                    </div>
                    <nav className="flex-grow flex flex-col gap-2">
                        <button 
                            onClick={() => { setActiveTab('dashboard'); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all duration-300 ease-smooth ${activeTab === 'dashboard' ? 'bg-white/70 backdrop-blur-md text-primary' : 'text-on-surface-variant hover:translate-x-1 hover:bg-secondary-container/10'}`}
                        >
                            <span className="material-symbols-outlined">dashboard</span>
                            <span className="text-label-md">Dashboard</span>
                        </button>
                        <button 
                            onClick={() => { setActiveTab('patients'); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all duration-300 ease-smooth ${activeTab === 'patients' ? 'bg-white/70 backdrop-blur-md text-primary' : 'text-on-surface-variant hover:translate-x-1 hover:bg-secondary-container/10'}`}
                        >
                            <span className="material-symbols-outlined">group</span>
                            <span className="text-label-md">Patients</span>
                        </button>
                        <button 
                            onClick={() => { setActiveTab('appointments'); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all duration-300 ease-smooth ${activeTab === 'appointments' ? 'bg-white/70 backdrop-blur-md text-primary' : 'text-on-surface-variant hover:translate-x-1 hover:bg-secondary-container/10'}`}
                        >
                            <span className="material-symbols-outlined">calendar_today</span>
                            <span className="text-label-md">Appointments</span>
                        </button>
                        <a className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:translate-x-1 transition-transform hover:bg-secondary-container/10 rounded-xl" href="#">
                            <span className="material-symbols-outlined">settings</span>
                            <span className="text-label-md">Settings</span>
                        </a>
                    </nav>
                    <div className="mt-auto flex flex-col gap-4">
                        <button className="btn-gradient text-white font-label-md py-3 rounded-xl flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-sm">emergency</span>
                            Emergency Portal
                        </button>
                        <div className="pt-4 border-t border-outline-variant/20 flex flex-col gap-2">
                            <a className="flex items-center gap-4 px-4 py-2 text-on-surface-variant text-caption hover:text-primary" href="#">
                                <span className="material-symbols-outlined">help</span>
                                <span>Help Support</span>
                            </a>
                            <button 
                                onClick={handleLogout}
                                className="flex items-center gap-4 px-4 py-2 text-on-surface-variant text-caption hover:text-error w-full text-left"
                            >
                                <span className="material-symbols-outlined">logout</span>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Canvas */}
            <main className={`flex-grow flex flex-col h-[100dvh] overflow-hidden transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-[280px]' : 'ml-0'}`}>
                {/* Top Header Area */}
                <header className="flex justify-between items-center px-4 md:px-margin-desktop py-4 md:py-6 bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-sm z-30">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 min-w-[44px] min-h-[44px] rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-primary flex items-center justify-center shadow-sm"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div>
                            <h2 className="text-headline-md md:text-headline-lg font-headline-lg text-primary hidden sm:block">Physician Hub</h2>
                            <p className="text-caption md:text-body-md text-on-surface-variant hidden sm:block">Welcome back, Dr. Julian Harrison. You have 8 appointments today.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="flex gap-2">
                            <button 
                                onClick={toggleNotifications}
                                className="w-11 h-11 glass-card rounded-full flex items-center justify-center relative hover:bg-white/90 transition-all"
                            >
                                <span className="material-symbols-outlined">notifications</span>
                                <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full"></span>
                            </button>
                            <button className="w-11 h-11 glass-card rounded-full flex items-center justify-center hover:bg-white/90 transition-all hidden sm:flex">
                                <span className="material-symbols-outlined">search</span>
                            </button>
                        </div>
                        <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-outline-variant/30">
                            <div className="text-right hidden sm:block">
                                <p className="text-label-md text-primary font-bold">Dr. Julian Harrison</p>
                                <p className="text-caption text-on-surface-variant">Otolaryngologist</p>
                            </div>
                            <img 
                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                data-alt="A professional portrait of a male doctor in his late 40s wearing a white clinical coat and a stethoscope. He is in a brightly lit modern ENT clinic with soft turquoise and white accents. The image has a clean, high-end medical aesthetic with a shallow depth of field and soft natural lighting."
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEfwrYELVZRi4rlkzlD2Ghlvt9plvprxRtoEu2OyiHaieVFnO_a_badEnUUhNhIX6OPEZobaKxBV-nzdsZjDnrEemhvhDkfOhonMRo5rxEYxgQv6YVl3HjRSzbmmwxMlFoc1D0PICPvOqyjk4o4eXHBFoVwyeNem_dkrcOgUA1As7Ftpo1WkvbcZIqcXF3YHpnmAm1svnX-bQRzSRgrfJ2Or_S5Y_h9GwgIq6CFYmaDUBRRXVB-Oo_WnaTKMCXs6viJlsHz2QN8uk" 
                            />
                        </div>
                    </div>
                </header>

                {/* Dashboard Grid */}
                <div className="flex-grow overflow-y-auto px-4 md:px-margin-desktop pt-6 pb-10 no-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-gutter">
                        {/* Weekly Appointment Schedule (Calendar) - Spans 8 cols */}
                        {(activeTab === 'dashboard' || activeTab === 'appointments') && (
                        <section className={`col-span-1 md:col-span-12 ${activeTab === 'appointments' ? 'lg:col-span-8' : 'lg:col-span-8'} flex flex-col gap-4`}>
                            <div className="glass-card rounded-3xl p-4 md:p-6 flex flex-col min-h-[400px] h-[50dvh] md:h-[480px]">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-headline-md font-headline-md text-primary">Agenda & Schedule</h3>
                                    <span className="font-label-md text-secondary uppercase tracking-[0.05em] text-caption bg-secondary/10 px-3 py-1 rounded-full">
                                        Oct 14 - Oct 20, 2024
                                    </span>
                                </div>
                                
                                {/* Daily Selector Tab Navigation */}
                                <div className="flex overflow-x-auto no-scrollbar gap-2 bg-surface-container-low p-2 rounded-2xl mb-6">
                                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
                                        <button
                                            key={day}
                                            onClick={() => setSelectedDay(day)}
                                            className={`flex-1 min-w-[60px] py-2 px-1 rounded-xl text-caption font-label-md uppercase tracking-wider transition-all duration-300 ${
                                                selectedDay === day 
                                                    ? 'bg-primary text-white shadow-md' 
                                                    : day === 'SAT' || day === 'SUN'
                                                        ? 'text-on-surface-variant opacity-40 hover:opacity-75'
                                                        : 'text-on-surface-variant hover:text-primary hover:bg-white/40'
                                            }`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>

                                {/* Timeline list of events for the selected day */}
                                <div className="flex-grow overflow-y-auto pr-1 no-scrollbar">
                                    {scheduleData[selectedDay].length > 0 ? (
                                        <div className="space-y-4">
                                            {scheduleData[selectedDay].map((event, index) => (
                                                <div 
                                                    key={index}
                                                    className={`flex items-center gap-6 p-4 rounded-2xl border-l-4 transition-all duration-300 ${
                                                        event.isCurrent 
                                                            ? 'bg-secondary text-white shadow-lg shadow-secondary/20 ring-4 ring-secondary/5 border-l-secondary-fixed' 
                                                            : 'bg-white/50 border border-outline-variant/10 hover:bg-white/90 border-l-primary/40'
                                                    }`}
                                                >
                                                    <div className="text-left min-w-[90px]">
                                                        <p className={`font-label-md text-caption ${event.isCurrent ? 'text-white' : 'text-secondary font-bold'}`}>
                                                            {event.time}
                                                        </p>
                                                        <p className={`text-[10px] ${event.isCurrent ? 'text-white/80' : 'text-on-surface-variant'}`}>
                                                            {event.duration}
                                                        </p>
                                                    </div>
                                                    <div className="text-left flex-grow">
                                                        <h4 className={`font-headline-md text-body-md font-bold ${event.isCurrent ? 'text-white' : 'text-primary'}`}>
                                                            {event.title}
                                                        </h4>
                                                        <p className={`text-caption ${event.isCurrent ? 'text-white/90' : 'text-on-surface-variant'}`}>
                                                            {event.desc}
                                                        </p>
                                                    </div>
                                                    {!event.isCurrent && (
                                                        <span className="material-symbols-outlined text-on-surface-variant opacity-60">
                                                            chevron_right
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-on-surface-variant/50 gap-2 py-12">
                                            <span className="material-symbols-outlined text-4xl">calendar_today</span>
                                            <p className="text-body-md font-label-md">No appointments scheduled</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Video Consultation Quick-link */}
                            <div className="glass-card rounded-3xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between border-2 border-secondary/30 bg-secondary/5 gap-4">
                                <div className="flex items-center gap-4 md:gap-6">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-secondary flex items-center justify-center text-white flex-shrink-0">
                                        <span className="material-symbols-outlined text-2xl md:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>videocam</span>
                                    </div>
                                    <div>
                                        <h4 className="text-headline-sm md:text-headline-md font-headline-md text-primary">Launch Telehealth Session</h4>
                                        <p className="text-caption md:text-body-md text-on-surface-variant">Next up: Marcus Aurelius (14:30 PM)</p>
                                    </div>
                                </div>
                                <button className="w-full md:w-auto px-6 py-3 btn-gradient text-white rounded-xl font-label-md flex justify-center items-center gap-2 flex-shrink-0">
                                    Enter Waiting Room
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </div>
                        </section>
                        )}

                        {/* Right Column (Patient Cards & Surgery Queue) - Spans 4 cols */}
                        {(activeTab === 'dashboard' || activeTab === 'patients' || activeTab === 'appointments') && (
                        <section className={`col-span-1 md:col-span-12 ${activeTab === 'patients' ? 'lg:col-span-12' : 'lg:col-span-4'} flex flex-col gap-6 md:gap-gutter`}>
                            {/* Patient Requests Queue */}
                            {(activeTab === 'dashboard' || activeTab === 'patients') && (
                            <div className="glass-card rounded-3xl p-4 md:p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 class="text-headline-sm font-headline-md text-primary font-bold">New Patient Requests</h3>
                                    <span className="bg-secondary text-white text-caption font-bold px-2 py-0.5 rounded-full">
                                        {requests.filter(r => r.status === 'PENDING').length} NEW
                                    </span>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {requests.map(r => (
                                        <div key={r.id} className="p-4 rounded-2xl bg-white border border-outline-variant/20 hover:border-secondary/40 transition-all group">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold">
                                                        {r.initials}
                                                    </div>
                                                    <div>
                                                        <p className="text-label-md text-primary font-bold">{r.name}</p>
                                                        <p className="text-[11px] text-on-surface-variant">{r.condition}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 text-[10px] font-bold rounded ${r.statusColor}`}>{r.status}</span>
                                            </div>
                                            {r.status === 'PENDING' && (
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => handleAccept(r.id)}
                                                        className="flex-grow py-2 text-[12px] font-bold bg-secondary/10 text-secondary rounded-lg hover:bg-secondary hover:text-white transition-all"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button 
                                                        onClick={() => handleReject(r.id)}
                                                        className="px-4 py-2 text-[12px] font-bold text-on-surface-variant hover:text-error transition-all"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            )}
                            {/* Surgery Queue */}
                            {(activeTab === 'dashboard' || activeTab === 'appointments') && (
                            <div className="glass-card rounded-3xl p-4 md:p-6 flex-grow">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 class="text-headline-sm font-headline-md text-primary font-bold">Surgery Queue</h3>
                                    <span className="material-symbols-outlined text-on-surface-variant">more_vert</span>
                                </div>
                                <div className="space-y-6">
                                    <div className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-outline-variant/30">
                                        <div className="absolute left-[-4px] top-0 w-2 h-2 rounded-full bg-primary"></div>
                                        <p className="text-caption font-bold text-primary">Tomorrow, 08:30</p>
                                        <p className="text-body-md">Tympanoplasty</p>
                                        <p className="text-caption text-on-surface-variant">Patient: Henry G. • Theater 4</p>
                                    </div>
                                    <div className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-outline-variant/30">
                                        <div className="absolute left-[-4px] top-0 w-2 h-2 rounded-full bg-outline-variant"></div>
                                        <p className="text-caption font-bold text-on-surface-variant">Oct 18, 10:00</p>
                                        <p className="text-body-md">Septoplasty</p>
                                        <p className="text-caption text-on-surface-variant">Patient: Sarah J. • Theater 2</p>
                                    </div>
                                </div>
                            </div>
                            )}
                        </section>
                        )}

                        {/* Patient Medical Notes - Bento Section */}
                        {(activeTab === 'dashboard' || activeTab === 'patients') && (
                        <section className="col-span-1 md:col-span-12 glass-card rounded-3xl p-6 md:p-8 mb-8">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                                <div>
                                    <h3 className="text-headline-md font-headline-md text-primary">Active Patient Notes</h3>
                                    <p className="text-body-md text-on-surface-variant">Recent clinical annotations and observations.</p>
                                </div>
                                <button 
                                    onClick={handleNewAnnotation}
                                    className="w-full md:w-auto px-6 py-2 border-2 border-primary text-primary rounded-xl font-label-md hover:bg-primary hover:text-white transition-all text-center"
                                >
                                    New Annotation
                                </button>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {notes.map(n => (
                                    <div key={n.id} className="p-6 rounded-2xl bg-white border border-outline-variant/20 shadow-sm flex flex-col gap-4">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-secondary">history_edu</span>
                                            <span className="text-label-md font-bold text-primary">{n.name}</span>
                                        </div>
                                        <p className="text-body-md italic text-on-surface-variant">{n.note}</p>
                                        <div className="mt-auto pt-4 border-t border-outline-variant/10 flex justify-between">
                                            <span className="text-caption">{n.time}</span>
                                            <span className={`text-caption font-bold ${n.badgeColor}`}>{n.badge}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                        )}
                    </div>
                </div>
            </main>

            {/* Notification Center Overlay */}
            <div 
                className={`fixed right-0 top-0 h-full w-[80%] md:w-[400px] bg-white/95 backdrop-blur-3xl shadow-2xl z-50 transform transition-transform duration-500 ease-smooth border-l border-outline-variant/30 ${
                    isNotificationsOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
                id="notification-center"
            >
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-headline-md font-headline-md text-primary">Activity Center</h3>
                        <button className="p-2 hover:bg-surface-container-high rounded-full" onClick={toggleNotifications}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div className="space-y-6">
                        <div className="p-4 rounded-xl bg-secondary/5 border-l-4 border-secondary">
                            <p className="text-label-md font-bold text-primary">Department Meeting</p>
                            <p className="text-body-md text-on-surface-variant">Room 302 - Surgical Procedures Update</p>
                            <p className="text-caption mt-2">Starting in 15 mins</p>
                        </div>
                        <div className="p-4 rounded-xl bg-primary/5 border-l-4 border-primary">
                            <p className="text-label-md font-bold text-primary">Lab Results Ready</p>
                            <p className="text-body-md text-on-surface-variant">Patient: Arthur Shelby - Allergy Panel</p>
                            <p className="text-caption mt-2">Received at 10:45 AM</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
