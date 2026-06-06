import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PatientPortal() {
    const navigate = useNavigate();

    // Sidebar state
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

    // Booking state
    const [specialist, setSpecialist] = useState('Dr. Elena Aris (Audiology)');
    const [bookingDate, setBookingDate] = useState('');
    const [bookings, setBookings] = useState([
        { id: 1, title: 'Tympanometry Screening', date: 'Oct 24, 2024 • 10:30 AM', status: 'Completed', statusColor: 'bg-emerald-100 text-emerald-800', bgClass: 'bg-primary-fixed', icon: 'hearing', iconColor: 'text-primary' },
        { id: 2, title: 'General ENT Follow-up', date: 'Nov 12, 2024 • 02:15 PM', status: 'Approved', statusColor: 'bg-blue-100 text-blue-800', bgClass: 'bg-secondary-fixed', icon: 'stethoscope', iconColor: 'text-secondary' },
        { id: 3, title: 'Consultation for Septoplasty', date: 'Requested on Nov 05', status: 'Pending', statusColor: 'bg-yellow-100 text-yellow-800', bgClass: 'bg-surface-container-highest', icon: 'medical_mask', iconColor: 'text-on-surface-variant' }
    ]);

    // Live Concierge Chat state
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState([
        { id: 1, sender: 'agent', text: 'Hello Johnathan! How can I assist with your appointment today?' }
    ]);

    useEffect(() => {
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

    const handleBookNow = (e) => {
        e.preventDefault();
        if (!bookingDate) return alert('Please select a date.');

        const formattedDate = new Date(bookingDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const newBooking = {
            id: Date.now(),
            title: `Consultation with ${specialist.split(' (')[0]}`,
            date: `${formattedDate} • 09:00 AM`,
            status: 'Pending',
            statusColor: 'bg-yellow-100 text-yellow-800',
            bgClass: 'bg-surface-container-highest',
            icon: 'calendar_today',
            iconColor: 'text-primary'
        };

        setBookings([newBooking, ...bookings]);
        setBookingDate('');
        alert('Appointment request submitted successfully!');
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: chatInput
        };

        setChatMessages(prev => [...prev, userMsg]);
        setChatInput('');

        // Simulate support response
        setTimeout(() => {
            const agentMsg = {
                id: Date.now() + 1,
                sender: 'agent',
                text: 'Thank you for your message. A coordinator has received your query and will reply shortly.'
            };
            setChatMessages(prev => [...prev, agentMsg]);
        }, 1200);
    };

    const handleLogout = () => {
        navigate('/portal');
    };

    const handleEmergencyPortal = () => {
        alert('Connecting to 24/7 Priority Emergency Team at +1-800-PALM-ENT.');
    };

    return (
        <div className="text-[#191c1e] font-body-md min-h-screen text-left relative z-0">
            {/* Atmospheric Background */}
            <div className="bg-wave">
                <div className="wave-blob bg-primary-container top-[-100px] left-[-100px]"></div>
                <div className="wave-blob bg-secondary-container bottom-[-150px] right-[-50px]" style={{ animationDelay: '-5s' }}></div>
                <div className="wave-blob bg-tertiary-fixed top-[40%] right-[10%]" style={{ animationDelay: '-10s' }}></div>
                <div className="wave-blob bg-primary-fixed top-[15%] left-[45%]" style={{ animationDelay: '-7s' }}></div>
                <div className="wave-blob bg-secondary-fixed bottom-[30%] left-[5%]" style={{ animationDelay: '-13s' }}></div>
            </div>

            {/* Sidebar Backdrop for Mobile */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-30 md:hidden transition-opacity" 
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* SideNavBar */}
            <aside className={`fixed left-0 top-0 h-full w-[280px] z-40 bg-surface/90 md:bg-surface/50 backdrop-blur-2xl border-r border-white/40 flex flex-col p-6 gap-stack-sm transition-transform duration-300 ease-in-out ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
                        <img 
                            alt="PalmCrest ENT" 
                            className="w-6 h-6 invert"
                            data-alt="A professional medical logo icon featuring a stylized palm leaf integrated with a medical cross, rendered in a crisp white on a deep teal circular background, emphasizing advanced healthcare and coastal serenity."
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD45lWtmD9uGlZLOShcyBesi15ZZdwRFXByo3R3WWPO5cO6UgD8hHoewb8RN3vIXO0qwqGavpXKPaB0TIrPaYEuP33MI-TfsNcvEOfHdu1Kb_VrFgbAavE0FyAcZx-XB9PC7DrQkMsljhimaXe4pdxcVss0X0JQTv5fe6oYE4-4xbEEqMUWN1_De6Sxzf-8pIWG_Kgk0Ts35Gw5_E4T_mx5uAZScEfTklQUBw8gX3KmluClk3KZ6nWpzjXtJ0oEnHbtqoKOuMoEoIk" 
                        />
                    </div>
                    <div>
                        <h1 className="text-headline-sm font-headline-md text-primary leading-tight">PalmCrest ENT</h1>
                        <p className="text-caption text-on-surface-variant">Clinical Excellence</p>
                    </div>
                </div>
                <nav className="flex-1 space-y-2">
                    <a className="flex items-center gap-4 px-4 py-3 bg-white/70 backdrop-blur-md rounded-xl text-primary font-bold transition-all duration-300" href="#">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                        <span className="font-label-md tracking-[0.05em]">Dashboard</span>
                    </a>

                    <a className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:translate-x-1 transition-transform" href="#">
                        <span className="material-symbols-outlined">calendar_today</span>
                        <span className="font-label-md tracking-[0.05em]">Appointments</span>
                    </a>
                    <a className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:translate-x-1 transition-transform" href="#">
                        <span className="material-symbols-outlined">settings</span>
                        <span className="font-label-md tracking-[0.05em]">Settings</span>
                    </a>
                </nav>
                <div className="mt-auto space-y-4">
                    <button 
                        onClick={handleEmergencyPortal}
                        className="w-full btn-primary-gradient text-white py-3 px-4 rounded-xl font-label-md flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">emergency</span>
                        Emergency Portal
                    </button>
                    <div className="pt-4 border-t border-outline-variant/20 flex flex-col gap-2">
                        <a className="flex items-center gap-4 px-4 py-2 text-on-surface-variant hover:text-primary transition-colors text-caption" href="#">
                            <span className="material-symbols-outlined text-[20px]">help</span>
                            Help Support
                        </a>
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-4 px-4 py-2 text-on-surface-variant hover:text-error transition-colors text-caption w-full text-left"
                        >
                            <span className="material-symbols-outlined text-[20px]">logout</span>
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={`min-h-screen transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-[280px]' : 'ml-0'}`}>
                {/* TopNavBar */}
                <header className={`fixed top-0 right-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-sm transition-all duration-300 ${isSidebarOpen ? 'w-full md:w-[calc(100%-280px)]' : 'w-full'}`}>
                    <div className="flex justify-between items-center px-4 md:px-margin-desktop py-4 max-w-container-max mx-auto">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-primary flex items-center justify-center shadow-sm"
                            >
                                <span className="material-symbols-outlined">menu</span>
                            </button>
                            <h2 className="text-headline-md font-headline-md font-bold tracking-tight text-primary hidden sm:block">Patient Dashboard</h2>
                        </div>
                        <div className="flex items-center gap-stack-md">
                            <div className="relative hidden sm:block">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                                <input
                                    className="bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 text-body-md focus:ring-2 focus:ring-primary/20 w-64 outline-none"
                                    placeholder="Search records..."
                                    type="text"
                                />
                            </div>
                            <button className="p-2 rounded-full hover:bg-surface-container transition-colors relative">
                                <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
                                <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full"></span>
                            </button>
                            <div className="flex items-center gap-3 ml-4">
                                <div className="text-right hidden sm:block">
                                    <p className="font-label-md text-primary">Johnathan Doe</p>
                                    <p className="text-caption text-on-surface-variant">Patient ID: #PC-8821</p>
                                </div>
                                <img 
                                    alt="User Profile" 
                                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                                    data-alt="A close-up professional headshot portrait of a middle-aged man with a friendly expression, set against a blurred medical facility background with soft teal and white lighting to match a clean healthcare aesthetic."
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjuDRbTP53Ivvm65IP0JFpa8tc0nOPqkJXT5klpiVc3omo7NTSG0Eah7ZiTQ94ztjjo7W-TMnlzuE-iP5ZpD6jUJ_Fgd9Q_tsxATUa1OSF4iv54Yqe7MFf95qe9JdntigyOMIf2U-0hULKS-2_vEw-R7DPN2CiHL9a1OaEZZL_kv94O-G5XXamNuqVLpGSIiKwr9QrYf901sPHVGjnC5OmRUinumcs4Rd1cGn08KFdAIjm979fuO_SPJ8hROzjutv59v0iAem2IQw" 
                                />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="pt-24 px-4 md:px-margin-desktop pb-stack-lg max-w-container-max mx-auto">
                    {/* Hero Greeting */}
                    <section className="mb-8 md:mb-stack-lg">
                        <h3 className="text-headline-lg md:text-display font-display text-primary mb-2">Welcome back, Johnathan.</h3>
                        <p className="text-body-md md:text-body-lg text-on-surface-variant max-w-2xl">Your health journey is our priority. You have an upcoming consultation with Dr. Aris in 2 days.</p>
                    </section>

                    {/* Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-gutter">
                        {/* Left Column: Primary Actions & History */}
                        <div className="lg:col-span-8 space-y-6 md:space-y-gutter">
                            {/* Book Appointment Widget */}
                            <div className="glass-card rounded-3xl p-6 md:p-stack-md">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="text-headline-sm md:text-headline-md font-headline-md text-primary flex items-center gap-2">
                                        <span className="material-symbols-outlined text-secondary">add_task</span>
                                        Quick Appointment
                                    </h4>
                                </div>
                                <form onSubmit={handleBookNow} className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-stack-sm items-end">
                                    <div>
                                        <label className="block text-caption font-label-md mb-2 text-on-surface-variant uppercase tracking-wider">Select Specialist</label>
                                        <select
                                            value={specialist}
                                            onChange={(e) => setSpecialist(e.target.value)}
                                            className="w-full bg-white/50 border-none rounded-xl py-3 focus:ring-2 focus:ring-secondary/50 outline-none"
                                        >
                                            <option>Dr. Elena Aris (Audiology)</option>
                                            <option>Dr. Marcus Vane (Rhinology)</option>
                                            <option>Dr. Sarah Chen (Laryngology)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-caption font-label-md mb-2 text-on-surface-variant uppercase tracking-wider">Preferred Date</label>
                                        <input
                                            className="w-full bg-white/50 border-none rounded-xl py-3 focus:ring-2 focus:ring-secondary/50 outline-none"
                                            type="date"
                                            value={bookingDate}
                                            onChange={(e) => setBookingDate(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <button
                                            className="w-full btn-primary-gradient text-white py-3 rounded-xl font-label-md shadow-lg shadow-primary/10"
                                            type="submit"
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Booking History List */}
                            <div className="glass-card rounded-3xl p-6 md:p-stack-md overflow-hidden">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="text-headline-sm md:text-headline-md font-headline-md text-primary">Booking History</h4>
                                    <button className="text-secondary font-label-md hover:underline">View All</button>
                                </div>
                                <div className="space-y-4">
                                    {bookings.map((b) => (
                                        <div 
                                            key={b.id} 
                                            className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-white/60 hover:bg-white/60 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 ${b.bgClass} rounded-xl flex items-center justify-center ${b.iconColor}`}>
                                                    <span className="material-symbols-outlined">{b.icon}</span>
                                                </div>
                                                <div>
                                                    <p className="font-label-md text-primary">{b.title}</p>
                                                    <p className="text-caption text-on-surface-variant">{b.date}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-caption font-label-md ${b.statusColor}`}>{b.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Right Column: Surgery & Support */}
                        <div className="lg:col-span-4 space-y-6 md:space-y-gutter">
                            {/* Surgery Request Card */}
                            <div className="bg-primary text-white rounded-3xl p-6 md:p-stack-md shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary rounded-full blur-[60px] opacity-20 -mr-16 -mt-16"></div>
                                <h4 className="text-headline-sm md:text-headline-md font-headline-md mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-secondary-fixed">medical_services</span>
                                    Surgery Request
                                </h4>
                                <p className="text-body-md text-on-primary-container mb-6">Need to schedule a procedure? Submit a fast-track request for our surgical team.</p>
                                <div className="space-y-4">
                                    <div className="bg-white/10 p-4 rounded-xl border border-white/10 text-left">
                                        <p className="text-caption font-label-md text-secondary-fixed mb-1">Fast Track Process</p>
                                        <p className="text-body-md text-white/90">Typical review time: 24-48 hours</p>
                                    </div>
                                    <button className="w-full bg-white text-primary py-3 rounded-xl font-label-md hover:bg-secondary-fixed transition-colors">
                                        Start Request
                                    </button>
                                </div>
                            </div>

                            {/* Chat Support */}
                            <div className="glass-card rounded-3xl p-6 md:p-stack-md border-t-4 border-t-secondary">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <img 
                                            alt="Support Agent" 
                                            className="w-12 h-12 rounded-full bg-secondary-container object-cover"
                                            data-alt="A friendly, professional female customer support agent headshot with headphones on, set against a clean minimalist medical office background with soft diffused lighting and a reassuring smile."
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBB2IYbsjlv0LgrI258cJE8ELryf9IINqjBWwaMI1bpDl7JE3YLCsl5NF-j2R_38kwJ8daBfZtL3n6vALJghVHzLVLxrU8a8CUyyzoLgxAUWJLYOTY5V5Qu9ACOrcuJwiGl9qzexcN-GiJ0V4oF-JDbWo-1D2SBEGS3QczfMbhT7_vW8IBNfSESnKUqGJBdUJtmPmzBz4HN0etYPEKRVynAzkn8vvbi1V8aISe2ECp4pNXz1ufRH_ARYrM6pfHFM8q_TP7gVpVyDh8" 
                                        />
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                                    </div>
                                    <div>
                                        <p className="font-label-md text-primary">Live Concierge</p>
                                        <p className="text-caption text-emerald-600">Online &amp; ready to help</p>
                                    </div>
                                </div>
                                <div className="max-h-48 overflow-y-auto space-y-3 mb-4 pr-1 scrollbar-thin">
                                    {chatMessages.map((msg) => (
                                        <div 
                                            key={msg.id}
                                            className={`p-3 rounded-2xl text-body-md ${
                                                msg.sender === 'user' 
                                                    ? 'bg-primary text-white ml-6 text-right' 
                                                    : 'bg-surface-container-low text-on-surface-variant mr-6 text-left italic'
                                            }`}
                                        >
                                            <p>{msg.text}</p>
                                        </div>
                                    ))}
                                </div>
                                <form onSubmit={handleSendMessage} className="relative">
                                    <input
                                        className="w-full bg-white/50 border border-outline-variant/30 rounded-full py-3 px-5 pr-12 focus:ring-2 focus:ring-secondary/50 focus:border-transparent outline-none text-body-md"
                                        placeholder="Type a message..."
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-secondary rounded-full text-white flex items-center justify-center hover:opacity-90"
                                    >
                                        <span className="material-symbols-outlined">send</span>
                                    </button>
                                </form>
                            </div>

                            {/* Health Tip Card */}
                            <div className="p-6 bg-tertiary-container rounded-3xl text-on-tertiary">
                                <span className="material-symbols-outlined text-tertiary-fixed text-4xl mb-4">lightbulb</span>
                                <h5 className="font-headline-md mb-2 text-white">Winter ENT Care</h5>
                                <p className="text-body-md text-white/80 mb-4">Keep indoor humidity between 30% and 50% to prevent dry nasal passages during the colder months.</p>
                                <a className="text-tertiary-fixed font-label-md flex items-center gap-1 hover:gap-2 transition-all" href="#">
                                    Learn more <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="w-full py-12 bg-surface-container-lowest border-t border-outline-variant/30 mt-stack-lg">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-gutter px-6 md:px-margin-desktop max-w-container-max mx-auto">
                        <div className="col-span-1 md:col-span-1">
                            <h2 className="text-headline-sm font-headline-md text-primary mb-4">PalmCrest ENT</h2>
                            <p className="text-caption text-on-surface-variant">Advanced Sanctuary of Care.</p>
                        </div>
                        <div>
                            <h5 className="font-label-md text-primary mb-4">Contact</h5>
                            <ul className="space-y-2">
                                <li><a className="text-on-surface-variant text-body-md hover:text-primary transition-all" href="#">Emergency: +1-800-PALM-ENT</a></li>
                                <li><a className="text-on-surface-variant text-body-md hover:text-primary transition-all" href="#">Support Center</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-label-md text-primary mb-4">Quick Links</h5>
                            <ul className="space-y-2">
                                <li><a className="text-on-surface-variant text-body-md hover:text-primary transition-all" href="#">Department Directory</a></li>
                                <li><a className="text-on-surface-variant text-body-md hover:text-primary transition-all" href="#">Our Specialists</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-label-md text-primary mb-4">Legal</h5>
                            <ul className="space-y-2">
                                <li><a className="text-on-surface-variant text-body-md hover:text-primary transition-all" href="#">Privacy Policy</a></li>
                                <li><a className="text-on-surface-variant text-body-md hover:text-primary transition-all" href="#">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="px-6 md:px-margin-desktop max-w-container-max mx-auto mt-8 pt-8 border-t border-outline-variant/10 text-center">
                        <p className="text-caption text-on-surface-variant">© 2024 PalmCrest ENT Hospital. Advanced Sanctuary of Care.</p>
                    </div>
                </footer>
            </main>
        </div>
    );
}
