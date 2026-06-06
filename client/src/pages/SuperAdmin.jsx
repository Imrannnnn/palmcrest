import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SuperAdmin() {
    const navigate = useNavigate();

    // Chart filter state
    const [inflowFilter, setInflowFilter] = useState('Last 7 Days');
    
    // Simple mock chart heights matching selected filter
    const chartHeights = inflowFilter === 'Last 7 Days' 
        ? ['h-[60%]', 'h-[45%]', 'h-[85%]', 'h-[70%]', 'h-[95%]', 'h-[40%]']
        : ['h-[90%]', 'h-[75%]', 'h-[50%]', 'h-[80%]', 'h-[65%]', 'h-[95%]'];

    const chartValues = inflowFilter === 'Last 7 Days'
        ? [124, 98, 182, 145, 210, 84]
        : [250, 195, 120, 210, 175, 290];

    // Staff state
    const [staff, setStaff] = useState([
        { id: 1, name: 'Dr. Elena Rodriguez', role: 'Senior Rhinologist', dept: 'Nasal & Sinus', status: 'Active', statusColor: 'bg-emerald-100 text-emerald-800', score: 92, progressWidth: 'w-[92%]', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBL6b9W1d32HG9rw98YFK0m0owE95Ouf8puk4c5PzSjy33_t27MM0s0S4eCx7_EzHE5YBKDWZK_Z3blFblAg_OtW1F0OKLoWaUsNyEJT-Gb8mgOpztTOXEFkreWYEVLhbw9sC6q2GmAmh_PKZMU332uJlDstJFaeo7odtyCPIjFOJITwOM9Ar9UMhCkIZgODIP2snszbMq7fPyjh16-NhP7xYla-jat3FCKvd1xcrHfuLcc_LFU0hpd9O-xKXheqNmZGWgDmgaZYgU' },
        { id: 2, name: 'Dr. Marcus Thorne', role: 'Audiology Lead', dept: 'Hearing Care', status: 'In Surgery', statusColor: 'bg-blue-100 text-blue-800', score: 88, progressWidth: 'w-[88%]', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnfKTPKwSDIwGSX2NixUqrt13K18eOhLNdQ4qa0H91JcnZpYqm_Amf35VqLeM1ilDKgkAxe0hW1qJA7hSRhu8wCHn2qBmAumBzej81NdXEMEh7u_S1TxQouya-TMmvfUNJyweOZkTe8OBr2T51WfBJfPCbz24tEB62aAWgyvWZZS3xjZp25ArmyeKXB4es0EFoRAedBJlvKKoj3BEAx9OofDamGhZOM7272n0Jx695TyKcFlT60Hbn_9_cfRNlynSlvIpMl7fRaSQ' },
        { id: 3, name: 'Dr. Sophia Chen', role: 'Laryngologist', dept: 'Voice & Swallowing', status: 'On Break', statusColor: 'bg-amber-100 text-amber-800', score: 95, progressWidth: 'w-[95%]', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgP_OxbynEx8hfasQpsLjLc3fJIotxcrA3FwLVrEO8liHXfQ1Qz8LkafGeI5yON_I6F2eVtwBZ7PMKzHuyXzyI0wJRXbjOSBmk-oUNDc2R_jYy5U0Z_ILcIm2eycYaCf1_nINwhfIQ5DGHSqea_GE1rrZgAaiUKS9mPDfftmcM69IFty8CJUsfKXxtJ0FKevOtU_1oD-YhV_eE_SNuqZNr3YaPir4ijU_jfvJ4IpZ_iPUMe5pt8-z6JcBvzHCQi84zFLdTkLm16TM' }
    ]);

    useEffect(() => {
        // Sticky Header effect on scroll
        const handleScroll = () => {
            const header = document.querySelector('header');
            if (header) {
                if (window.scrollY > 20) {
                    header.classList.add('shadow-md');
                } else {
                    header.classList.remove('shadow-md');
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
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const handleOnboardSpecialist = () => {
        const name = prompt("Enter Specialist Name:");
        if (!name) return;
        const role = prompt("Enter Specialist Title/Role:", "Otolaryngologist");
        if (!role) return;
        const dept = prompt("Enter Department:", "General ENT");
        if (!dept) return;

        const newStaff = {
            id: Date.now(),
            name,
            role,
            dept,
            status: 'Active',
            statusColor: 'bg-emerald-100 text-emerald-800',
            score: 90,
            progressWidth: 'w-[90%]',
            img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnfKTPKwSDIwGSX2NixUqrt13K18eOhLNdQ4qa0H91JcnZpYqm_Amf35VqLeM1ilDKgkAxe0hW1qJA7hSRhu8wCHn2qBmAumBzej81NdXEMEh7u_S1TxQouya-TMmvfUNJyweOZkTe8OBr2T51WfBJfPCbz24tEB62aAWgyvWZZS3xjZp25ArmyeKXB4es0EFoRAedBJlvKKoj3BEAx9OofDamGhZOM7272n0Jx695TyKcFlT60Hbn_9_cfRNlynSlvIpMl7fRaSQ'
        };

        setStaff([...staff, newStaff]);
        alert(`${name} onboarded successfully!`);
    };

    const handleViewLogs = () => {
        alert("System logs are clean. Database connectivity healthy. Database queries running normally.");
    };

    const handleLogout = () => {
        navigate('/portal');
    };

    return (
        <div className="text-[#191c1e] min-h-screen text-left font-body-md relative z-0">
            {/* Atmospheric Background */}
            <div className="bg-wave">
                <div className="wave-blob bg-primary top-[-120px] left-[-120px]"></div>
                <div className="wave-blob bg-secondary bottom-[-150px] right-[-120px]" style={{ animationDelay: '-5s' }}></div>
                <div className="wave-blob bg-tertiary top-[45%] left-[30%]" style={{ animationDelay: '-10s' }}></div>
                <div className="wave-blob bg-primary-fixed top-[15%] right-[15%]" style={{ animationDelay: '-7s' }}></div>
                <div className="wave-blob bg-secondary-container bottom-[35%] left-[5%]" style={{ animationDelay: '-13s' }}></div>
            </div>

            {/* Side Navigation Shell */}
            <aside className="fixed left-0 top-0 h-full w-[280px] z-40 bg-surface/50 dark:bg-surface-container-low/50 backdrop-blur-2xl border-r border-white/40 dark:border-outline-variant/10 flex flex-col p-6 gap-stack-sm hidden md:flex">
                <div className="mb-stack-lg">
                    <h1 className="text-headline-sm font-headline-md text-primary font-bold">PalmCrest ENT</h1>
                    <p className="text-label-md font-label-md tracking-[0.05em] text-on-surface-variant opacity-70">Clinical Excellence</p>
                </div>
                <nav className="flex-grow flex flex-col gap-2">
                    <a className="flex items-center gap-3 px-4 py-3 bg-white/70 backdrop-blur-md rounded-xl text-primary font-bold animate-smooth" href="#">
                        <span className="material-symbols-outlined">dashboard</span>
                        <span className="text-label-md font-label-md tracking-[0.05em]">Dashboard</span>
                    </a>
                    <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:translate-x-1 transition-transform animate-smooth group" href="#">
                        <span className="material-symbols-outlined">group</span>
                        <span className="text-label-md font-label-md tracking-[0.05em]">Patients</span>
                    </a>
                    <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:translate-x-1 transition-transform animate-smooth group" href="#">
                        <span className="material-symbols-outlined">calendar_today</span>
                        <span className="text-label-md font-label-md tracking-[0.05em]">Appointments</span>
                    </a>
                    <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:translate-x-1 transition-transform animate-smooth group" href="#">
                        <span className="material-symbols-outlined">settings</span>
                        <span className="text-label-md font-label-md tracking-[0.05em]">Settings</span>
                    </a>
                </nav>
                <div className="mt-auto flex flex-col gap-2 pt-6 border-t border-outline-variant/20">
                    <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:translate-x-1 transition-transform animate-smooth" href="#">
                        <span className="material-symbols-outlined">help</span>
                        <span className="text-label-md font-label-md tracking-[0.05em]">Help Support</span>
                    </a>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:translate-x-1 transition-transform animate-smooth w-full text-left"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        <span className="text-label-md font-label-md tracking-[0.05em]">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Canvas */}
            <main className="md:ml-[280px] min-h-screen">
                {/* TopAppBar */}
                <header className="fixed top-0 right-0 left-0 md:left-[280px] z-50 bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-sm px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h2 className="text-headline-md font-headline-md font-bold tracking-tight text-primary">Overview</h2>
                    </div>
                    <div className="flex items-center gap-gutter">
                        <div className="hidden lg:flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/30">
                            <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
                            <input className="bg-transparent border-none focus:ring-0 text-body-md w-64 outline-none" placeholder="Search patients, records..." type="text" />
                        </div>
                        <div className="flex items-center gap-4 border-l border-outline-variant/30 pl-gutter">
                            <button className="relative p-2 hover:bg-surface-variant/20 rounded-full animate-smooth">
                                <span className="material-symbols-outlined text-primary">notifications</span>
                                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-label-md font-bold text-primary">Dr. Julian Vance</p>
                                    <p className="text-caption text-on-surface-variant">Super Admin</p>
                                </div>
                                <img 
                                    alt="User Profile" 
                                    className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
                                    data-alt="A professional close-up portrait of a senior male doctor with grey hair, wearing a white clinical coat and a stethoscope. He has a warm, authoritative expression. The background is a brightly lit, high-end medical office with soft architectural blurring. The overall aesthetic is clean, trustworthy, and futuristic healthcare professional."
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxK5uFx1zr_pnoSRQwZfGlYraLFp4f5xUT5Kv6IbtNNUo-6bYrLxFAzhjm979u0aLf6nj53oulJJNAuwdg2CuFSoWqDcsyMhfCsx4EyWGcfPudS0sVea_NMTJMvGpnytTACB5vQds5DEc0K4AyVKb7XAqsbjLWXPI24h4L2hFRQ1d69HMNMkkj5lllf0N9OjMxoPQhDWXklucaX54hZn1-UwbXZhjNaZGPy04iWFEiu7RtqjL2oBCuJgJ4WfTpgfVFxPCEd23ZDEA" 
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="pt-24 px-8 pb-12 max-w-container-max mx-auto">
                    {/* Bento Grid Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-stack-lg">
                        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-[160px] animate-smooth hover:-translate-y-1 hover:shadow-lg">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-primary/10 rounded-xl">
                                    <span className="material-symbols-outlined text-primary">medical_services</span>
                                </div>
                                <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-caption font-bold">+12%</span>
                            </div>
                            <div>
                                <p className="text-headline-md font-headline-md font-bold text-primary">84</p>
                                <p className="text-label-md text-on-surface-variant">Total Doctors</p>
                            </div>
                        </div>
                        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-[160px] animate-smooth hover:-translate-y-1 hover:shadow-lg">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-secondary/10 rounded-xl">
                                    <span className="material-symbols-outlined text-secondary">calendar_month</span>
                                </div>
                                <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-caption font-bold">+5.2%</span>
                            </div>
                            <div>
                                <p className="text-headline-md font-headline-md font-bold text-primary">1,240</p>
                                <p className="text-label-md text-on-surface-variant">Total Bookings</p>
                            </div>
                        </div>
                        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-[160px] animate-smooth hover:-translate-y-1 hover:shadow-lg">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-tertiary/10 rounded-xl">
                                    <span className="material-symbols-outlined text-tertiary">biotech</span>
                                </div>
                                <span className="text-on-error-container bg-error-container/20 px-2 py-1 rounded text-caption font-bold">-2%</span>
                            </div>
                            <div>
                                <p className="text-headline-md font-headline-md font-bold text-primary">42</p>
                                <p className="text-label-md text-on-surface-variant">Surgery Requests</p>
                            </div>
                        </div>
                        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-[160px] animate-smooth hover:-translate-y-1 hover:shadow-lg">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-secondary-container/20 rounded-xl">
                                    <span className="material-symbols-outlined text-secondary">payments</span>
                                </div>
                                <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-caption font-bold">+18%</span>
                            </div>
                            <div>
                                <p className="text-headline-md font-headline-md font-bold text-primary">$214.8k</p>
                                <p className="text-label-md text-on-surface-variant">Monthly Revenue</p>
                            </div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-stack-lg">
                        <div className="lg:col-span-2 glass-card p-8 rounded-3xl min-h-[400px]">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-headline-sm font-headline-md text-primary">Patient Inflow Analytics</h3>
                                    <p className="text-body-md text-on-surface-variant">Comparison between new and returning patients</p>
                                </div>
                                <select
                                    value={inflowFilter}
                                    onChange={(e) => setInflowFilter(e.target.value)}
                                    className="bg-surface-container-low border-none rounded-full text-label-md px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    <option>Last 7 Days</option>
                                    <option>Last 30 Days</option>
                                </select>
                            </div>
                            {/* Visual Chart Representation */}
                            <div className="relative h-64 flex items-end gap-4 px-4">
                                <div className="flex-grow flex items-end justify-around h-full border-b border-outline-variant/30">
                                    {chartHeights.map((hClass, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-12 bg-gradient-to-t ${
                                                idx % 2 === 0 ? 'from-primary to-secondary' : 'from-secondary to-secondary-container'
                                            } rounded-t-lg ${hClass} animate-smooth hover:opacity-80 relative group cursor-pointer`}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-primary text-white text-[10px] px-2 py-1 rounded transition-opacity duration-250">
                                                {chartValues[idx]}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-around mt-4 text-caption text-on-surface-variant">
                                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                            </div>
                        </div>

                        <div className="glass-card p-8 rounded-3xl">
                            <h3 className="text-headline-sm font-headline-md text-primary mb-6">Recent Activity</h3>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-2 h-2 rounded-full bg-secondary mt-2"></div>
                                    <div>
                                        <p className="text-body-md font-bold text-primary">Dr. Sarah Miller Joined</p>
                                        <p className="text-caption text-on-surface-variant">Otology Specialist • 2 mins ago</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                                    <div>
                                        <p className="text-body-md font-bold text-primary">New Surgery Approved</p>
                                        <p className="text-caption text-on-surface-variant">Patient ID #8842 • 15 mins ago</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-2 h-2 rounded-full bg-tertiary mt-2"></div>
                                    <div>
                                        <p className="text-body-md font-bold text-primary">Revenue Milestone Reached</p>
                                        <p className="text-caption text-on-surface-variant">Reached $200k target • 1 hour ago</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-2 h-2 rounded-full bg-outline mt-2"></div>
                                    <div>
                                        <p className="text-body-md font-bold text-primary">System Update Completed</p>
                                        <p className="text-caption text-on-surface-variant">Version 4.2.0 stable • 3 hours ago</p>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={handleViewLogs}
                                className="w-full mt-8 py-3 rounded-xl border border-primary/20 text-primary font-bold hover:bg-primary/5 transition-colors"
                            >
                                View All Logs
                            </button>
                        </div>
                    </div>

                    {/* Manage Doctors Table */}
                    <div className="glass-card rounded-3xl overflow-hidden mb-stack-lg">
                        <div className="p-8 border-b border-white/40 flex justify-between items-center">
                            <div>
                                <h3 className="text-headline-sm font-headline-md text-primary">Manage Medical Staff</h3>
                                <p className="text-body-md text-on-surface-variant">Oversee credentials and performance metrics</p>
                            </div>
                            <button
                                onClick={handleOnboardSpecialist}
                                className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] animate-smooth"
                            >
                                <span className="material-symbols-outlined">person_add</span>
                                Onboard Specialist
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead class="bg-surface-container-low text-label-md text-on-surface-variant">
                                    <tr>
                                        <th className="px-8 py-4">Specialist</th>
                                        <th className="px-8 py-4">Department</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4">Performance</th>
                                        <th className="px-8 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/10">
                                    {staff.map(s => (
                                        <tr key={s.id} className="hover:bg-white/40 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <img 
                                                        alt="Staff" 
                                                        className="w-12 h-12 rounded-full object-cover"
                                                        data-alt="A professional headshot of a female/male doctor..."
                                                        src={s.img}
                                                    />
                                                    <div>
                                                        <p className="text-body-md font-bold text-primary">{s.name}</p>
                                                        <p className="text-caption text-on-surface-variant">{s.role}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-body-md text-primary">{s.dept}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`${s.statusColor} px-3 py-1 rounded-full text-caption font-bold`}>{s.status}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-2 bg-surface-container rounded-full overflow-hidden">
                                                        <div className={`h-full bg-secondary ${s.progressWidth}`}></div>
                                                    </div>
                                                    <span className="text-caption font-bold text-primary">{s.score}%</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <button className="p-2 hover:bg-primary/10 rounded-lg text-primary animate-smooth">
                                                    <span className="material-symbols-outlined">more_vert</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Notifications Sidebar Panel */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-gutter">
                        <div className="lg:col-span-3 glass-card p-8 rounded-3xl min-h-[300px]">
                            <h3 className="text-headline-sm font-headline-md text-primary mb-6">System Health</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-stack-md">
                                <div className="p-6 bg-surface-container-low rounded-2xl border border-white/20">
                                    <p className="text-caption font-bold text-on-surface-variant mb-2">SERVER LATENCY</p>
                                    <div className="flex items-end gap-2">
                                        <p className="text-headline-md font-headline-md text-primary">24ms</p>
                                        <span className="material-symbols-outlined text-emerald-500 pb-1">trending_down</span>
                                    </div>
                                </div>
                                <div className="p-6 bg-surface-container-low rounded-2xl border border-white/20">
                                    <p className="text-caption font-bold text-on-surface-variant mb-2">DB CONNECTIONS</p>
                                    <div className="flex items-end gap-2">
                                        <p className="text-headline-md font-headline-md text-primary">1,102</p>
                                        <span className="material-symbols-outlined text-secondary pb-1">sync</span>
                                    </div>
                                </div>
                                <div className="p-6 bg-surface-container-low rounded-2xl border border-white/20">
                                    <p className="text-caption font-bold text-on-surface-variant mb-2">API UPTIME</p>
                                    <div className="flex items-end gap-2">
                                        <p className="text-headline-md font-headline-md text-primary">99.9%</p>
                                        <span className="material-symbols-outlined text-emerald-500 pb-1">verified</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-1 glass-card p-8 rounded-3xl bg-primary text-white flex flex-col justify-center relative overflow-hidden group">
                            <div className="absolute -right-8 -top-8 w-32 h-32 bg-secondary/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                            <p className="text-label-md font-bold mb-2 opacity-80 uppercase tracking-widest text-[#ffddaf]">Emergency Portal</p>
                            <h4 className="text-headline-sm font-headline-md font-bold mb-4 text-white">Direct Channel</h4>
                            <p className="text-body-md opacity-70 mb-8 text-white/90">Access critical clinical alerts and rapid response protocols immediately.</p>
                            <button className="w-full bg-white text-primary py-4 rounded-xl font-bold hover:bg-secondary-fixed transition-colors">Enter Secure Portal</button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="w-full py-12 bg-surface-container-lowest border-t border-outline-variant/30">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-desktop max-w-container-max mx-auto">
                        <div className="flex flex-col gap-4">
                            <h4 className="text-headline-sm font-headline-md text-primary font-bold">PalmCrest ENT</h4>
                            <p className="text-body-md text-on-surface-variant max-w-xs">Advanced sanctuary of care specializing in ear, nose, and throat excellence.</p>
                        </div>
                        <div>
                            <h5 className="font-bold text-primary mb-4">Support</h5>
                            <ul className="space-y-2">
                                <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Emergency: +1-800-PALM-ENT</a></li>
                                <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Department Directory</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-bold text-primary mb-4">Legal</h5>
                            <ul className="space-y-2">
                                <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
                                <li><a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a></li>
                            </ul>
                        </div>
                        <div className="text-right flex flex-col justify-between">
                            <div className="flex justify-end gap-4 mb-4">
                                <span className="material-symbols-outlined text-secondary cursor-pointer hover:scale-110 transition-transform">public</span>
                                <span className="material-symbols-outlined text-secondary cursor-pointer hover:scale-110 transition-transform">hub</span>
                                <span className="material-symbols-outlined text-secondary cursor-pointer hover:scale-110 transition-transform">shield</span>
                            </div>
                            <p className="text-caption text-on-surface-variant">© 2024 PalmCrest ENT Hospital.<br />Advanced Sanctuary of Care.</p>
                        </div>
                    </div>
                </footer>
            </main>

            {/* Mobile Navigation Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/70 backdrop-blur-xl border-t border-white/40 z-50 flex justify-around items-center py-4 px-4">
                <a className="flex flex-col items-center gap-1 text-primary" href="#">
                    <span className="material-symbols-outlined">dashboard</span>
                    <span className="text-[10px] font-bold">Dashboard</span>
                </a>
                <a className="flex flex-col items-center gap-1 text-on-surface-variant" href="#">
                    <span className="material-symbols-outlined">group</span>
                    <span className="text-[10px]">Patients</span>
                </a>
                <a className="flex flex-col items-center gap-1 text-on-surface-variant" href="#">
                    <span className="material-symbols-outlined">calendar_today</span>
                    <span className="text-[10px]">Appts</span>
                </a>
                <button 
                    onClick={handleLogout}
                    className="flex flex-col items-center gap-1 text-on-surface-variant"
                >
                    <span className="material-symbols-outlined">logout</span>
                    <span className="text-[10px]">Logout</span>
                </button>
            </nav>
        </div>
    );
}
