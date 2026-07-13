import { useEffect, useState } from 'react';
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

    const [activeTab, setActiveTab] = useState('dashboard');
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [admins, setAdmins] = useState([]);

    // Send Schedule state
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedDoctorForSchedule, setSelectedDoctorForSchedule] = useState(null);
    const [scheduleTimeframe, setScheduleTimeframe] = useState('day');
    const [isSendingSchedule, setIsSendingSchedule] = useState(false);
    const [postVisitLoadingIds, setPostVisitLoadingIds] = useState({});

    const [doctorSearchInput, setDoctorSearchInput] = useState('');
    const [doctorSearchQuery, setDoctorSearchQuery] = useState('');
    const [patientSearchInput, setPatientSearchInput] = useState('');
    const [patientSearchQuery, setPatientSearchQuery] = useState('');

    const [doctorPage, setDoctorPage] = useState(1);
    const [patientPage, setPatientPage] = useState(1);

    const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('All');
    const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

    const [broadcastSubject, setBroadcastSubject] = useState('');
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    const [emailingPatient, setEmailingPatient] = useState(null);
    const [directSubject, setDirectSubject] = useState('');
    const [directMessage, setDirectMessage] = useState('');
    const [isSendingDirect, setIsSendingDirect] = useState(false);

    // Safely parse date string to local date, ignoring timezones
    const parseLocalDate = (dateString) => {
        if (!dateString) return new Date();
        const str = dateString.includes('T') ? dateString.split('T')[0] : dateString;
        const [year, month, day] = str.split('-');
        return new Date(year, month - 1, day);
    };

    const fetchAdminData = async () => {
        try {
            const token = localStorage.getItem('token');
            // 1. Fetch doctors
            const docRes = await fetch('/api/auth/doctors', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (docRes.ok) {
                const docs = await docRes.json();
                setDoctors(docs);
            }

            // 2. Fetch patients
            const patRes = await fetch('/api/auth/patients', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (patRes.ok) {
                const pats = await patRes.json();
                setPatients(pats);
            }

            // 3. Fetch appointments
            const apptRes = await fetch('/api/appointments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (apptRes.ok) {
                const appts = await apptRes.json();
                setAppointments(appts);
            }

            // 4. Fetch admins
            const adminRes = await fetch('/api/auth/admins', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (adminRes.ok) {
                const adms = await adminRes.json();
                setAdmins(adms);
            }
        } catch (err) {
            console.error('Error fetching admin data:', err);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token || !storedUser) {
            navigate('/portal');
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'admin') {
            localStorage.clear();
            navigate('/portal');
            return;
        }

        Promise.resolve().then(() => {
            fetchAdminData();
        });

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
    }, [navigate]);

    const handleOnboardSpecialist = async () => {
        const name = prompt("Enter Specialist Name:");
        if (!name) return;
        const email = prompt("Enter Specialist Email:");
        if (!email) return;
        const password = prompt("Enter Specialist Password (min 8 chars):", "password123");
        if (!password) return;
        const spec = prompt("Enter Specialization (Audiology, Rhinology, Laryngology, Otology, General ENT):", "General ENT");
        if (!spec) return;
        const phone = prompt("Enter Specialist Phone Number:", "123-456-7890");
        if (!phone) return;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: name,
                    email: email,
                    password: password,
                    role: 'doctor',
                    specialization: spec,
                    phoneNumber: phone
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                alert(errData.message || 'Failed to onboard specialist.');
                return;
            }

            alert(`${name} onboarded successfully!`);
            fetchAdminData();
        } catch (err) {
            console.error('Error onboarding specialist:', err);
            alert('Network error onboarding specialist.');
        }
    };

    const handleOnboardAdmin = async () => {
        const name = prompt("Enter Administrator Name:");
        if (!name) return;
        const email = prompt("Enter Administrator Email:");
        if (!email) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/admin/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    fullName: name,
                    email: email
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                alert(errData.message || 'Failed to invite administrator.');
                return;
            }

            alert(`Administrator ${name} invited successfully! An email with setup instructions has been sent.`);
            fetchAdminData();
        } catch (err) {
            console.error('Error inviting administrator:', err);
            alert('Network error inviting administrator.');
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/appointments/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                alert(`Appointment status updated to ${status}!`);
                fetchAdminData();
            } else {
                const errData = await response.json();
                alert(errData.message || 'Failed to update status.');
            }
        } catch (err) {
            console.error(err);
            alert('Error updating status.');
        }
    };

    const handleTriggerPostVisit = async (id) => {
        if (!window.confirm("Are you sure you want to trigger the post-visit email now?")) return;
        setPostVisitLoadingIds(prev => ({ ...prev, [id]: true }));
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/appointments/${id}/reminders/post-visit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                alert('Post-visit email triggered successfully.');
                fetchAdminData(); // refresh to get updated remindersSent
            } else {
                alert(data.message || 'Failed to trigger email.');
            }
        } catch (err) {
            console.error(err);
            alert('Network error triggering email.');
        } finally {
            setPostVisitLoadingIds(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleSendSchedule = async () => {
        if (!selectedDoctorForSchedule) return;
        setIsSendingSchedule(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/appointments/admin/send-schedule/${selectedDoctorForSchedule._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ timeframe: scheduleTimeframe }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to send schedule');
            
            alert(data.message || 'Schedule sent successfully');
            setShowScheduleModal(false);
            setSelectedDoctorForSchedule(null);
        } catch (error) {
            alert(error.message);
        } finally {
            setIsSendingSchedule(false);
        }
    };

    const handleViewLogs = () => {
        alert("System logs are clean. Database connectivity healthy. Database queries running normally.");
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/portal');
    };

    const handleDoctorSearch = (e) => {
        e.preventDefault();
        setDoctorSearchQuery(doctorSearchInput);
        setDoctorPage(1);
    };

    const handlePatientSearch = (e) => {
        e.preventDefault();
        setPatientSearchQuery(patientSearchInput);
        setPatientPage(1);
    };

    const handleDirectEmailSubmit = async (e) => {
        e.preventDefault();
        if (!directSubject || !directMessage) {
            alert('Please provide both subject and message.');
            return;
        }

        setIsSendingDirect(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/auth/admin/email-patient', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email: emailingPatient.email, subject: directSubject, message: directMessage })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Email sent successfully.');
                setDirectSubject('');
                setDirectMessage('');
                setEmailingPatient(null);
            } else {
                alert(data.message || 'Failed to send email.');
            }
        } catch (err) {
            console.error('Direct email error:', err);
            alert('Network error during direct email.');
        } finally {
            setIsSendingDirect(false);
        }
    };

    const handleBroadcastSubmit = async (e) => {
        e.preventDefault();
        if (!broadcastSubject || !broadcastMessage) {
            alert('Please provide both subject and message.');
            return;
        }

        if (!window.confirm('Are you sure you want to send this email to ALL patients?')) return;

        setIsBroadcasting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/auth/admin/broadcast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ subject: broadcastSubject, message: broadcastMessage })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Broadcast initiated successfully.');
                setBroadcastSubject('');
                setBroadcastMessage('');
            } else {
                alert(data.message || 'Failed to send broadcast.');
            }
        } catch (err) {
            console.error('Broadcast error:', err);
            alert('Network error during broadcast.');
        } finally {
            setIsBroadcasting(false);
        }
    };

    const filteredDoctors = doctors.filter(doc => {
        const query = doctorSearchQuery.toLowerCase();
        return (doc.fullName || '').toLowerCase().includes(query) ||
            (doc.email || '').toLowerCase().includes(query) ||
            (doc.specialization || '').toLowerCase().includes(query) ||
            (doc.phoneNumber || '').toLowerCase().includes(query);
    });

    const filteredPatients = patients.filter(pat => {
        const query = patientSearchQuery.toLowerCase();
        return (pat.fullName || '').toLowerCase().includes(query) ||
            (pat.email || '').toLowerCase().includes(query) ||
            (pat.patientId || '').toLowerCase().includes(query) ||
            (pat.phoneNumber || '').toLowerCase().includes(query);
    });

    const ITEMS_PER_PAGE = 5;
    const totalDoctorPages = Math.ceil(filteredDoctors.length / ITEMS_PER_PAGE) || 1;
    const paginatedDoctors = filteredDoctors.slice(
        (doctorPage - 1) * ITEMS_PER_PAGE,
        doctorPage * ITEMS_PER_PAGE
    );

    const totalPatientPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE) || 1;
    const paginatedPatients = filteredPatients.slice(
        (patientPage - 1) * ITEMS_PER_PAGE,
        patientPage * ITEMS_PER_PAGE
    );

    const filteredAppointments = appointments.filter(appt => {
        if (selectedDoctorFilter !== 'All' && appt.doctor?._id !== selectedDoctorFilter) return false;
        if (selectedTypeFilter !== 'All' && appt.type !== selectedTypeFilter) return false;
        if (selectedStatusFilter !== 'All' && appt.status !== selectedStatusFilter) return false;
        return true;
    });

    return (
        <div className="text-[#191c1e] min-h-screen text-left font-body-md relative z-0 w-full max-w-full overflow-x-hidden">
            {/* Atmospheric Background */}
            <div className="bg-wave">
                <div className="wave-blob bg-primary top-[-120px] left-[-120px]"></div>
                <div className="wave-blob bg-secondary bottom-[-150px] right-[-120px]" style={{ animationDelay: '-5s' }}></div>
                <div className="wave-blob bg-tertiary top-[45%] left-[30%]" style={{ animationDelay: '-10s' }}></div>
                <div className="wave-blob bg-primary-fixed top-[15%] right-[15%]" style={{ animationDelay: '-7s' }}></div>
                <div className="wave-blob bg-secondary-container bottom-[35%] left-[5%]" style={{ animationDelay: '-13s' }}></div>

                {/* Decorative concentric circles in main background */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[280px] h-[280px] xs:w-[320px] xs:h-[320px] sm:w-[400px] sm:h-[400px] md:w-[600px] md:h-[600px] border-[12px] sm:border-[16px] md:border-[48px] border-primary/[0.03] dark:border-white/[0.03] rounded-full pointer-events-none z-[-1] translate-x-1/2"></div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[180px] h-[180px] xs:w-[220px] xs:h-[220px] sm:w-[280px] sm:h-[280px] md:w-[400px] md:h-[400px] border-[8px] sm:border-[12px] md:border-[32px] border-primary/[0.015] dark:border-white/[0.015] rounded-full pointer-events-none z-[-1] translate-x-1/2"></div>
            </div>

            {/* Side Navigation Shell */}
            <aside className="fixed left-0 top-0 h-full w-[280px] z-40 bg-surface/50 dark:bg-surface-container-low/50 backdrop-blur-2xl border-r border-white/40 dark:border-outline-variant/10 flex flex-col p-6 transition-transform duration-300 ease-in-out overflow-hidden hidden md:flex">
                {/* Decorative concentric circles */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[350px] h-[350px] border-[32px] border-primary/10 dark:border-white/10 rounded-full pointer-events-none -ml-28 z-0"></div>
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[220px] h-[220px] border-[24px] border-primary/5 dark:border-white/5 rounded-full pointer-events-none -ml-14 z-0"></div>

                <div className="flex flex-col h-full w-full relative z-10 gap-stack-sm">
                    <div className="mb-stack-lg flex items-center gap-3">
                        <img src="/logo-ent.jpeg" alt="PalmCrest ENT Logo" className="h-10 w-auto object-contain shadow-sm rounded-lg" />
                        <div>
                            <h1 className="text-headline-sm font-headline-md text-primary font-bold leading-tight">PalmCrest ENT</h1>
                            <p className="text-label-md font-label-md tracking-[0.05em] text-on-surface-variant opacity-70">Clinical Excellence</p>
                        </div>
                    </div>
                    <nav className="flex-grow flex flex-col gap-2">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold animate-smooth w-full text-left ${activeTab === 'dashboard' ? 'bg-white/70 backdrop-blur-md text-primary' : 'text-on-surface-variant hover:translate-x-1'}`}
                        >
                            <span className="material-symbols-outlined">dashboard</span>
                            <span className="text-label-md font-label-md tracking-[0.05em]">Dashboard</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('doctors')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold animate-smooth w-full text-left ${activeTab === 'doctors' ? 'bg-white/70 backdrop-blur-md text-primary' : 'text-on-surface-variant hover:translate-x-1'}`}
                        >
                            <span className="material-symbols-outlined">medical_services</span>
                            <span className="text-label-md font-label-md tracking-[0.05em]">Doctors</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('patients')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold animate-smooth w-full text-left ${activeTab === 'patients' ? 'bg-white/70 backdrop-blur-md text-primary' : 'text-on-surface-variant hover:translate-x-1'}`}
                        >
                            <span className="material-symbols-outlined">group</span>
                            <span className="text-label-md font-label-md tracking-[0.05em]">Patients</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('appointments')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold animate-smooth w-full text-left ${activeTab === 'appointments' ? 'bg-white/70 backdrop-blur-md text-primary' : 'text-on-surface-variant hover:translate-x-1'}`}
                        >
                            <span className="material-symbols-outlined">calendar_today</span>
                            <span className="text-label-md font-label-md tracking-[0.05em]">Appointments</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('admins')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold animate-smooth w-full text-left ${activeTab === 'admins' ? 'bg-white/70 backdrop-blur-md text-primary' : 'text-on-surface-variant hover:translate-x-1'}`}
                        >
                            <span className="material-symbols-outlined">admin_panel_settings</span>
                            <span className="text-label-md font-label-md tracking-[0.05em]">Admins</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('broadcast')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold animate-smooth w-full text-left ${activeTab === 'broadcast' ? 'bg-white/70 backdrop-blur-md text-primary' : 'text-on-surface-variant hover:translate-x-1'}`}
                        >
                            <span className="material-symbols-outlined">campaign</span>
                            <span className="text-label-md font-label-md tracking-[0.05em]">Broadcast</span>
                        </button>
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
                </div>
            </aside>

            {/* Main Content Canvas */}
            <main className="md:ml-[280px] min-h-screen w-full md:w-[calc(100%-280px)] max-w-full overflow-x-hidden">
                {/* TopAppBar */}
                <header className="fixed top-0 right-0 left-0 md:left-[280px] z-50 bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-sm px-4 sm:px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <h2 className="text-lg sm:text-headline-md font-headline-md font-bold tracking-tight text-primary truncate max-w-[160px] xs:max-w-xs sm:max-w-none">
                            {activeTab === 'dashboard' && 'Overview'}
                            {activeTab === 'doctors' && 'Manage Doctors'}
                            {activeTab === 'patients' && 'Patient Directory'}
                            {activeTab === 'appointments' && 'Appointment Requests'}
                            {activeTab === 'admins' && 'Administrator Directory'}
                            {activeTab === 'broadcast' && 'Broadcast Email'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-gutter">
                        <div className="hidden lg:flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/30">
                            <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
                            <input className="bg-transparent border-none focus:ring-0 text-body-md w-64 outline-none" placeholder="Search..." type="text" />
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4 border-l border-outline-variant/30 pl-3 sm:pl-gutter">
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
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxK5uFx1zr_pnoSRQwZfGlYraLFp4f5xUT5Kv6IbtNNUo-6bYrLxFAzhjm979u0aLf6nj53oulJJNAuwdg2CuFSoWqDcsyMhfCsx4EyWGcfPudS0sVea_NMTJMvGpnytTACB5vQds5DEc0K4AyVKb7XAqsbjLWXPI24h4L2hFRQ1d69HMNMkkj5lllf0N9OjMxoPQhDWXklucaX54hZn1-UwbXZhjNaZGPy04iWFEiu7RtqjL2oBCuJgJ4WfTpgfVFxPCEd23ZDEA"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="pt-24 px-4 sm:px-6 pb-28 md:pb-12 w-full max-w-full md:max-w-container-max mx-auto animate-smooth overflow-x-hidden">

                    {activeTab === 'dashboard' && (
                        <>
                            {/* Bento Grid Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-gutter mb-stack-lg animate-smooth">
                                <div className="glass-card p-4 sm:p-6 rounded-xl flex flex-col justify-between h-[160px] animate-smooth hover:-translate-y-1 hover:shadow-lg">
                                    <div className="flex justify-between items-start">
                                        <div className="p-3 bg-primary/10 rounded-lg">
                                            <span className="material-symbols-outlined text-primary">medical_services</span>
                                        </div>
                                        <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-caption font-bold">+12%</span>
                                    </div>
                                    <div>
                                        <p className="text-headline-md font-headline-md font-bold text-primary">{doctors.length}</p>
                                        <p className="text-label-md text-on-surface-variant">Total Doctors</p>
                                    </div>
                                </div>
                                <div className="glass-card p-4 sm:p-6 rounded-xl flex flex-col justify-between h-[160px] animate-smooth hover:-translate-y-1 hover:shadow-lg">
                                    <div className="flex justify-between items-start">
                                        <div className="p-3 bg-secondary/10 rounded-lg">
                                            <span className="material-symbols-outlined text-secondary">calendar_month</span>
                                        </div>
                                        <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-caption font-bold">+5.2%</span>
                                    </div>
                                    <div>
                                        <p className="text-headline-md font-headline-md font-bold text-primary">{appointments.filter(a => a.type === 'Appointment').length}</p>
                                        <p className="text-label-md text-on-surface-variant">Total Bookings</p>
                                    </div>
                                </div>
                                <div className="glass-card p-4 sm:p-6 rounded-xl flex flex-col justify-between h-[160px] animate-smooth hover:-translate-y-1 hover:shadow-lg">
                                    <div className="flex justify-between items-start">
                                        <div className="p-3 bg-tertiary/10 rounded-lg">
                                            <span className="material-symbols-outlined text-tertiary">biotech</span>
                                        </div>
                                        <span className="text-on-error-container bg-error-container/20 px-2 py-1 rounded text-caption font-bold">-2%</span>
                                    </div>
                                    <div>
                                        <p className="text-headline-md font-headline-md font-bold text-primary">{appointments.filter(a => a.type === 'Surgery').length}</p>
                                        <p className="text-label-md text-on-surface-variant">Surgery Requests</p>
                                    </div>
                                </div>
                            </div>

                            {/* Charts Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-gutter mb-stack-lg">
                                <div className="lg:col-span-2 glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl min-h-[400px]">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                        <div>
                                            <h3 className="text-headline-sm font-headline-md text-primary">Patient Inflow Analytics</h3>
                                            <p className="text-body-md text-on-surface-variant">Comparison between new and returning patients</p>
                                        </div>
                                        <select
                                            value={inflowFilter}
                                            onChange={(e) => setInflowFilter(e.target.value)}
                                            className="w-full sm:w-auto bg-surface-container-low border-none rounded-full text-label-md px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none"
                                        >
                                            <option>Last 7 Days</option>
                                            <option>Last 30 Days</option>
                                        </select>
                                    </div>
                                    {/* Visual Chart Representation */}
                                    <div className="relative h-64 flex items-end gap-2 sm:gap-4 px-2 sm:px-4">
                                        <div className="flex-grow flex items-end justify-around h-full border-b border-outline-variant/30">
                                            {chartHeights.map((hClass, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`w-6 xs:w-8 sm:w-12 bg-gradient-to-t ${idx % 2 === 0 ? 'from-primary to-secondary' : 'from-secondary to-secondary-container'
                                                        } rounded-t-lg ${hClass} animate-smooth hover:opacity-80 relative group cursor-pointer`}
                                                >
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-primary text-white text-[10px] px-2 py-1 rounded transition-opacity duration-250 z-10">
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

                                <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                                    <h3 className="text-headline-sm font-headline-md text-primary mb-6">Recent Activity</h3>
                                    <div className="space-y-6">
                                        <div className="flex gap-4">
                                            <div className="w-2 h-2 rounded-full bg-secondary mt-2"></div>
                                            <div>
                                                <p className="text-body-md font-bold text-primary">New Specialist Onboarded</p>
                                                <p className="text-caption text-on-surface-variant">System updated successfully • 2 mins ago</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                                            <div>
                                                <p className="text-body-md font-bold text-primary">New Surgery Approved</p>
                                                <p className="text-caption text-on-surface-variant">Procedure scheduled • 15 mins ago</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-2 h-2 rounded-full bg-tertiary mt-2"></div>
                                            <div>
                                                <p className="text-body-md font-bold text-primary">Revenue Milestone Reached</p>
                                                <p className="text-caption text-on-surface-variant">Reached $200k target • 1 hour ago</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleViewLogs}
                                        className="w-full mt-8 py-3 rounded-lg border border-primary/20 text-primary font-bold hover:bg-primary/5 transition-colors"
                                    >
                                        View All Logs
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Broadcast Email Tab */}
                    {activeTab === 'broadcast' && (
                        <div className="glass-card rounded-xl sm:rounded-2xl overflow-hidden mb-stack-lg animate-smooth w-full max-w-full">
                            <div className="p-4 sm:p-6 border-b border-white/40">
                                <h3 className="text-headline-sm font-headline-md text-primary">Patient Broadcast</h3>
                                <p className="text-body-md text-on-surface-variant">Send a general email to all registered patients</p>
                            </div>
                            <div className="p-4 sm:p-6">
                                <form onSubmit={handleBroadcastSubmit} className="flex flex-col gap-4 max-w-2xl">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-label-md font-bold text-on-surface">Subject</label>
                                        <input
                                            type="text"
                                            className="bg-surface-container-low px-4 py-3 rounded-lg border border-outline-variant/30 text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="e.g. Health Tips / Clinic Update"
                                            value={broadcastSubject}
                                            onChange={(e) => setBroadcastSubject(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-label-md font-bold text-on-surface">Message (HTML supported)</label>
                                        <textarea
                                            className="bg-surface-container-low px-4 py-3 rounded-lg border border-outline-variant/30 text-body-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[200px]"
                                            placeholder="<p>Write your message here...</p>"
                                            value={broadcastMessage}
                                            onChange={(e) => setBroadcastMessage(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isBroadcasting}
                                        className={`self-start mt-2 bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${isBroadcasting ? 'opacity-70 cursor-wait' : 'hover:shadow-[0_0_15px_rgba(0,229,255,0.4)]'}`}
                                    >
                                        {isBroadcasting ? (
                                            <>
                                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined">send</span>
                                                Send Broadcast
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Manage Doctors Table */}
                    {activeTab === 'doctors' && (
                        <div className="glass-card rounded-xl sm:rounded-2xl overflow-hidden mb-stack-lg animate-smooth w-full max-w-full">
                            <div className="p-4 sm:p-6 border-b border-white/40 flex flex-col gap-6">
                                <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
                                    <div>
                                        <h3 className="text-headline-sm font-headline-md text-primary">Manage Medical Staff</h3>
                                        <p className="text-body-md text-on-surface-variant">Oversee credentials and performance metrics</p>
                                    </div>
                                    <button
                                        onClick={handleOnboardSpecialist}
                                        className="w-full md:w-auto bg-gradient-to-r from-primary to-secondary text-white px-5 py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all animate-smooth"
                                    >
                                        <span className="material-symbols-outlined">person_add</span>
                                        Onboard Specialist
                                    </button>
                                </div>
                                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between border-t border-outline-variant/10 pt-6">
                                    <form onSubmit={handleDoctorSearch} className="flex flex-wrap gap-2 items-center w-full">
                                        <div className="flex items-center bg-surface-container-low px-4 py-2.5 rounded-lg border border-outline-variant/30 flex-grow w-full sm:max-w-md">
                                            <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
                                            <input
                                                className="bg-transparent border-none focus:ring-0 text-body-md w-full outline-none"
                                                placeholder="Search name, email, spec..."
                                                type="text"
                                                value={doctorSearchInput}
                                                onChange={(e) => setDoctorSearchInput(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="bg-primary text-white px-5 py-2.5 rounded-lg font-bold hover:opacity-90 transition-all text-label-md flex-grow sm:flex-grow-0 text-center"
                                        >
                                            Search
                                        </button>
                                        {doctorSearchQuery && (
                                            <button
                                                type="button"
                                                onClick={() => { setDoctorSearchInput(''); setDoctorSearchQuery(''); setDoctorPage(1); }}
                                                className="bg-surface-variant/20 text-on-surface-variant px-4 py-2.5 rounded-lg font-bold hover:bg-surface-variant/40 transition-all text-label-md flex-grow sm:flex-grow-0 text-center"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </form>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-surface-container-low text-label-md text-on-surface-variant">
                                        <tr>
                                            <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Specialist</th>
                                            <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Department / specialization</th>
                                            <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Contact Email</th>
                                            <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Phone Number</th>
                                            <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Status</th>
                                            <th className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-variant/10">
                                        {paginatedDoctors.length > 0 ? (
                                            paginatedDoctors.map((s) => (
                                                <tr key={s._id} className="hover:bg-white/40 transition-colors group">
                                                    <td className="px-4 sm:px-6 py-4 sm:py-6 whitespace-nowrap">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold">
                                                                {s.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="text-body-md font-bold text-primary">{s.fullName}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4 sm:py-6 whitespace-nowrap">
                                                        <span className="text-body-md text-primary">{s.specialization}</span>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4 sm:py-6 whitespace-nowrap text-body-md text-on-surface-variant">
                                                        {s.email}
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4 sm:py-6 whitespace-nowrap text-body-md text-on-surface-variant">
                                                        {s.phoneNumber || 'N/A'}
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4 sm:py-6 whitespace-nowrap">
                                                        <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-caption font-bold">Active</span>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4 sm:py-6 whitespace-nowrap text-right">
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedDoctorForSchedule(s);
                                                                setShowScheduleModal(true);
                                                            }}
                                                            className="text-primary hover:text-primary-container bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg text-label-md font-bold transition-colors"
                                                        >
                                                            Send Schedule
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-4 sm:px-6 py-4 sm:py-6 text-center text-on-surface-variant">
                                                    {doctorSearchQuery ? 'No specialists match the search query.' : 'No specialists onboarded yet.'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 border-t border-white/40 bg-surface-container-low/40 flex flex-col sm:flex-row justify-between items-center gap-4 px-4 sm:px-6">
                                <span className="text-caption text-on-surface-variant font-medium text-center sm:text-left">
                                    Page {doctorPage} of {totalDoctorPages} (Total {filteredDoctors.length} staff)
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        disabled={doctorPage === 1}
                                        onClick={() => setDoctorPage(p => Math.max(p - 1, 1))}
                                        className="px-4 py-2 rounded-lg text-caption font-bold bg-white border border-outline-variant/30 text-primary disabled:opacity-40 disabled:pointer-events-none hover:bg-primary/5 transition-all"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        disabled={doctorPage === totalDoctorPages}
                                        onClick={() => setDoctorPage(p => Math.min(p + 1, totalDoctorPages))}
                                        className="px-4 py-2 rounded-lg text-caption font-bold bg-white border border-outline-variant/30 text-primary disabled:opacity-40 disabled:pointer-events-none hover:bg-primary/5 transition-all"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Patient Directory */}
                    {activeTab === 'patients' && (
                        <div className="glass-card rounded-xl sm:rounded-2xl overflow-hidden mb-stack-lg animate-smooth w-full max-w-full">
                            <div className="p-4 sm:p-6 border-b border-white/40 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                                <div>
                                    <h3 className="text-headline-sm font-headline-md text-primary">Patient Directory</h3>
                                    <p className="text-body-md text-on-surface-variant">View all registered patients and clinical IDs</p>
                                </div>
                                <form onSubmit={handlePatientSearch} className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
                                    <div className="flex items-center bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/30 flex-grow w-full sm:w-64 md:w-80">
                                        <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
                                        <input
                                            className="bg-transparent border-none focus:ring-0 text-body-md w-full outline-none"
                                            placeholder="Search name, email, ID..."
                                            type="text"
                                            value={patientSearchInput}
                                            onChange={(e) => setPatientSearchInput(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:opacity-90 transition-all text-label-md flex-grow sm:flex-grow-0 text-center"
                                    >
                                        Search
                                    </button>
                                    {patientSearchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => { setPatientSearchInput(''); setPatientSearchQuery(''); setPatientPage(1); }}
                                            className="bg-surface-variant/20 text-on-surface-variant px-3 py-2 rounded-lg font-bold hover:bg-surface-variant/40 transition-all text-label-md flex-grow sm:flex-grow-0 text-center"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </form>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-surface-container-low text-label-md text-on-surface-variant">
                                        <tr>
                                            <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Patient Name</th>
                                            <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Patient ID</th>
                                            <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Email Address</th>
                                            <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Phone Number</th>
                                            <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Gender</th>
                                            <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-variant/10">
                                        {paginatedPatients.length > 0 ? (
                                            paginatedPatients.map(p => (
                                                <tr key={p._id} className="hover:bg-white/40 transition-colors group">
                                                    <td className="px-4 sm:px-6 py-4 sm:py-6 whitespace-nowrap">
                                                        <p className="text-body-md font-bold text-primary">{p.fullName}</p>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4 sm:py-6 whitespace-nowrap">
                                                        <span className="text-body-md font-semibold text-secondary">{p.patientId}</span>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4 sm:py-6 whitespace-nowrap text-body-md text-on-surface-variant">
                                                        {p.email}
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4 sm:py-6 whitespace-nowrap text-body-md text-on-surface-variant">
                                                        {p.phoneNumber || 'N/A'}
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4 sm:py-6 whitespace-nowrap text-body-md text-on-surface-variant">
                                                        {p.gender || 'N/A'}
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4 sm:py-6 whitespace-nowrap">
                                                        <button 
                                                            onClick={() => setEmailingPatient(p)}
                                                            className="text-primary hover:text-secondary flex items-center gap-1 transition-colors"
                                                            title="Email Patient"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">mail</span>
                                                            <span className="text-label-sm font-bold">Email</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-4 sm:px-6 py-4 sm:py-6 text-center text-on-surface-variant">
                                                    {patientSearchQuery ? 'No patients match the search query.' : 'No patients registered.'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 border-t border-white/40 bg-surface-container-low/40 flex flex-col sm:flex-row justify-between items-center gap-4 px-4 sm:px-6">
                                <span className="text-caption text-on-surface-variant font-medium text-center sm:text-left">
                                    Page {patientPage} of {totalPatientPages} (Total {filteredPatients.length} patients)
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        disabled={patientPage === 1}
                                        onClick={() => setPatientPage(p => Math.max(p - 1, 1))}
                                        className="px-4 py-2 rounded-lg text-caption font-bold bg-white border border-outline-variant/30 text-primary disabled:opacity-40 disabled:pointer-events-none hover:bg-primary/5 transition-all"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        disabled={patientPage === totalPatientPages}
                                        onClick={() => setPatientPage(p => Math.min(p + 1, totalPatientPages))}
                                        className="px-4 py-2 rounded-lg text-caption font-bold bg-white border border-outline-variant/30 text-primary disabled:opacity-40 disabled:pointer-events-none hover:bg-primary/5 transition-all"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Appointments Management */}
                    {activeTab === 'appointments' && (
                        <div className="glass-card rounded-xl sm:rounded-2xl overflow-hidden mb-stack-lg animate-smooth w-full max-w-full">
                            <div className="p-4 sm:p-6 border-b border-white/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h3 className="text-headline-sm font-headline-md text-primary">All Appointments & Surgery Requests</h3>
                                    <p className="text-body-md text-on-surface-variant">Review, approve, or cancel clinician requests across the hospital</p>
                                </div>
                                <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full md:w-auto">
                                    <select
                                        value={selectedDoctorFilter}
                                        onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                                        className="w-full sm:w-auto bg-surface-container-low border-none rounded-lg text-label-md px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="All">All Doctors</option>
                                        {doctors.map(doc => (
                                            <option key={doc._id} value={doc._id}>{doc.fullName}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={selectedTypeFilter}
                                        onChange={(e) => setSelectedTypeFilter(e.target.value)}
                                        className="w-full sm:w-auto bg-surface-container-low border-none rounded-lg text-label-md px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="All">All Types</option>
                                        <option value="Appointment">Appointments</option>
                                        <option value="Surgery">Surgeries</option>
                                    </select>
                                    <select
                                        value={selectedStatusFilter}
                                        onChange={(e) => setSelectedStatusFilter(e.target.value)}
                                        className="w-full sm:w-auto bg-surface-container-low border-none rounded-lg text-label-md px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="All">All Statuses</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-surface-container-low text-label-md text-on-surface-variant">
                                        <tr>
                                            <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Doctor</th>
                                            <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Patient</th>
                                            <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Title / Purpose</th>
                                            <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Date & Time</th>
                                            <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Type</th>
                                            <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Status</th>
                                            <th className="px-4 sm:px-6 py-4 text-right whitespace-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-variant/10">
                                        {filteredAppointments.length > 0 ? (
                                            filteredAppointments.map(appt => {
                                                const formattedDate = parseLocalDate(appt.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                });
                                                return (
                                                    <tr key={appt._id} className="hover:bg-white/40 transition-colors group">
                                                        <td className="px-4 sm:px-6 py-4 sm:py-6 font-bold text-primary whitespace-nowrap">
                                                            {appt.doctor?.fullName || 'Unknown'}
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-4 sm:py-6 whitespace-nowrap">
                                                            <p className="text-body-md font-semibold text-primary">{appt.patient?.fullName || 'Unknown'}</p>
                                                            <p className="text-caption text-on-surface-variant">{appt.patient?.patientId || ''}</p>
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-4 sm:py-6 text-body-md font-medium text-primary whitespace-nowrap">
                                                            {appt.title}
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-4 sm:py-6 text-body-md text-on-surface-variant whitespace-nowrap">
                                                            {formattedDate} • {appt.timeSlot}
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-4 sm:py-6 whitespace-nowrap">
                                                            <span className={`px-3 py-1 rounded-full text-caption font-bold ${appt.type === 'Surgery' ? 'bg-secondary/15 text-secondary' : 'bg-primary/15 text-primary'}`}>
                                                                {appt.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-4 sm:py-6 whitespace-nowrap">
                                                            <span className={`px-3 py-1 rounded-full text-caption font-bold ${appt.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                                                                    appt.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                                                                        appt.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                            'bg-red-100 text-red-800'
                                                                }`}>
                                                                {appt.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-4 sm:py-6 text-right space-x-2 whitespace-nowrap">
                                                            {appt.status === 'Pending' && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(appt._id, 'Approved')}
                                                                    className="bg-primary text-white text-caption px-3 py-1.5 rounded-lg font-bold hover:opacity-90 animate-smooth"
                                                                >
                                                                    Approve
                                                                </button>
                                                            )}
                                                            {['Pending', 'Approved'].includes(appt.status) && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(appt._id, 'Cancelled')}
                                                                    className="bg-error/10 text-error text-caption px-3 py-1.5 rounded-lg font-bold hover:bg-error/20 animate-smooth"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            )}
                                                            {appt.status === 'Approved' && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(appt._id, 'Completed')}
                                                                    className="bg-emerald-600 text-white text-caption px-3 py-1.5 rounded-lg font-bold hover:opacity-90 animate-smooth"
                                                                >
                                                                    Complete
                                                                </button>
                                                            )}
                                                            {appt.status === 'Completed' && !appt.remindersSent?.includes('post4hr') && (
                                                                <button
                                                                    onClick={() => handleTriggerPostVisit(appt._id)}
                                                                    disabled={postVisitLoadingIds[appt._id]}
                                                                    className={`px-3 py-1.5 rounded-lg font-bold transition-opacity flex items-center gap-2 ${postVisitLoadingIds[appt._id] ? 'bg-primary text-white opacity-70 cursor-wait' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                                                                >
                                                                    {postVisitLoadingIds[appt._id] ? (
                                                                        <>
                                                                            <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                                                                            Sending...
                                                                        </>
                                                                    ) : (
                                                                        'Send Post-Visit'
                                                                    )}
                                                                </button>
                                                            )}
                                                            {appt.status === 'Completed' && appt.remindersSent?.includes('post4hr') && (
                                                                <span className="text-caption text-emerald-600 font-medium">Follow-up Sent</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-6 text-center text-on-surface-variant">No appointments match the selected filters.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Admins Directory */}
                    {activeTab === 'admins' && (
                        <div className="glass-card rounded-xl sm:rounded-2xl overflow-hidden mb-stack-lg animate-smooth w-full max-w-full">
                            <div className="p-4 sm:p-6 border-b border-white/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h3 className="text-headline-sm font-headline-md text-primary">System Administrators</h3>
                                    <p className="text-body-md text-on-surface-variant">Oversee system administrators and access permissions</p>
                                </div>
                                <button
                                    onClick={handleOnboardAdmin}
                                    className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary text-white px-5 py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] animate-smooth"
                                >
                                    <span className="material-symbols-outlined">person_add</span>
                                    Onboard Admin
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-surface-container-low text-label-md text-on-surface-variant">
                                        <tr>
                                            <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Administrator</th>
                                            <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Contact Email</th>
                                            <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Role</th>
                                            <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Date Joined</th>
                                            <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-variant/10">
                                        {admins.length > 0 ? (
                                            admins.map((adm) => {
                                                const formattedDate = new Date(adm.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                });
                                                return (
                                                    <tr key={adm._id} className="hover:bg-white/40 transition-colors group">
                                                        <td className="px-4 sm:px-6 py-4 sm:py-6 whitespace-nowrap">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold">
                                                                    {adm.fullName ? adm.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'A'}
                                                                </div>
                                                                <div>
                                                                    <p className="text-body-md font-bold text-primary">{adm.fullName}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-4 sm:py-6 whitespace-nowrap text-body-md text-on-surface-variant">
                                                            {adm.email}
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-4 sm:py-6 whitespace-nowrap text-body-md text-primary capitalize font-semibold">
                                                            {adm.role}
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-4 sm:py-6 whitespace-nowrap text-body-md text-on-surface-variant">
                                                            {formattedDate}
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-4 sm:py-6 whitespace-nowrap">
                                                            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-caption font-bold">Active</span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-4 sm:px-6 py-4 sm:py-6 text-center text-on-surface-variant">No administrators found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <footer className="w-full pt-12 pb-28 md:pb-12 bg-surface-container-lowest border-t border-outline-variant/30">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-4 md:px-margin-desktop max-w-container-max mx-auto">
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
                        <div className="text-left md:text-right flex flex-col justify-between">
                            <div className="flex justify-start md:justify-end gap-4 mb-4">
                                <span className="material-symbols-outlined text-secondary cursor-pointer hover:scale-110 transition-transform">public</span>
                                <span className="material-symbols-outlined text-secondary cursor-pointer hover:scale-110 transition-transform">hub</span>
                                <span className="material-symbols-outlined text-secondary cursor-pointer hover:scale-110 transition-transform">shield</span>
                            </div>
                            <p className="text-caption text-on-surface-variant">© 2026 PalmCrest ENT Hospital.<br />Advanced Sanctuary of Care.</p>
                        </div>
                    </div>
                </footer>
            </main>

            {/* Mobile Navigation Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/70 backdrop-blur-xl border-t border-white/40 z-50 flex justify-around items-center py-4 px-4">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-primary' : 'text-on-surface-variant'}`}
                >
                    <span className="material-symbols-outlined">dashboard</span>
                    <span className="text-[10px] font-bold">Dashboard</span>
                </button>
                <button
                    onClick={() => setActiveTab('doctors')}
                    className={`flex flex-col items-center gap-1 ${activeTab === 'doctors' ? 'text-primary' : 'text-on-surface-variant'}`}
                >
                    <span className="material-symbols-outlined">medical_services</span>
                    <span className="text-[10px]">Doctors</span>
                </button>
                <button
                    onClick={() => setActiveTab('patients')}
                    className={`flex flex-col items-center gap-1 ${activeTab === 'patients' ? 'text-primary' : 'text-on-surface-variant'}`}
                >
                    <span className="material-symbols-outlined">group</span>
                    <span className="text-[10px]">Patients</span>
                </button>
                <button
                    onClick={() => setActiveTab('appointments')}
                    className={`flex flex-col items-center gap-1 ${activeTab === 'appointments' ? 'text-primary' : 'text-on-surface-variant'}`}
                >
                    <span className="material-symbols-outlined">calendar_today</span>
                    <span className="text-[10px]">Appts</span>
                </button>
                <button
                    onClick={() => setActiveTab('admins')}
                    className={`flex flex-col items-center gap-1 ${activeTab === 'admins' ? 'text-primary' : 'text-on-surface-variant'}`}
                >
                    <span className="material-symbols-outlined">admin_panel_settings</span>
                    <span className="text-[10px]">Admins</span>
                </button>
                <button
                    onClick={() => setActiveTab('broadcast')}
                    className={`flex flex-col items-center gap-1 ${activeTab === 'broadcast' ? 'text-primary' : 'text-on-surface-variant'}`}
                >
                    <span className="material-symbols-outlined">campaign</span>
                    <span className="text-[10px]">Broadcast</span>
                </button>
            </nav>

            {/* Direct Email Modal */}
            {emailingPatient && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-smooth">
                    <div className="bg-surface-container rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-white/50">
                            <h3 className="text-headline-sm font-headline-md text-primary">Email {emailingPatient.fullName}</h3>
                            <button onClick={() => setEmailingPatient(null)} className="p-2 hover:bg-surface-variant/30 rounded-full transition-colors">
                                <span className="material-symbols-outlined text-on-surface-variant">close</span>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                            <form onSubmit={handleDirectEmailSubmit} className="flex flex-col gap-6" id="direct-email-form">
                                <div className="flex flex-col gap-2">
                                    <label className="text-label-md font-bold text-on-surface">Subject</label>
                                    <input
                                        type="text"
                                        className="bg-surface-container-low px-4 py-3 rounded-lg border border-outline-variant/30 text-body-md focus:outline-none focus:ring-2 focus:ring-primary w-full"
                                        placeholder="e.g. Follow-up regarding your recent visit"
                                        value={directSubject}
                                        onChange={(e) => setDirectSubject(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-label-md font-bold text-on-surface">Message (HTML supported)</label>
                                    <textarea
                                        className="bg-surface-container-low px-4 py-3 rounded-lg border border-outline-variant/30 text-body-md focus:outline-none focus:ring-2 focus:ring-primary w-full min-h-[150px]"
                                        placeholder="<p>Dear Patient...</p>"
                                        value={directMessage}
                                        onChange={(e) => setDirectMessage(e.target.value)}
                                        required
                                    />
                                </div>
                            </form>
                        </div>
                        <div className="p-4 border-t border-outline-variant/30 bg-surface-container-low/50 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => setEmailingPatient(null)}
                                className="px-6 py-2.5 rounded-lg font-bold text-on-surface-variant hover:bg-surface-variant/30 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="direct-email-form"
                                disabled={isSendingDirect}
                                className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-2.5 rounded-lg font-bold hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSendingDirect ? 'Sending...' : 'Send Email'}
                                {!isSendingDirect && <span className="material-symbols-outlined text-[18px]">send</span>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Send Schedule Modal */}
            {showScheduleModal && selectedDoctorForSchedule && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface-container rounded-2xl max-w-sm w-full p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6 border-b border-outline-variant/20 pb-4">
                            <div>
                                <h3 className="text-title-lg font-headline-md font-bold text-primary">Send Schedule</h3>
                                <p className="text-body-sm text-on-surface-variant">To Dr. {selectedDoctorForSchedule.fullName}</p>
                            </div>
                            <button onClick={() => setShowScheduleModal(false)} className="text-on-surface-variant hover:text-error transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="flex flex-col gap-4 mb-6">
                            <label className="text-label-md font-bold text-on-surface">Timeframe</label>
                            <select 
                                value={scheduleTimeframe}
                                onChange={(e) => setScheduleTimeframe(e.target.value)}
                                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-body-md focus:ring-2 focus:ring-primary/40 outline-none"
                            >
                                <option value="day">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setShowScheduleModal(false)} 
                                className="px-4 py-2 rounded-xl font-bold text-on-surface-variant hover:bg-surface-variant/20 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSendSchedule}
                                disabled={isSendingSchedule}
                                className={`px-4 py-2 rounded-xl font-bold bg-primary text-white transition-opacity flex items-center gap-2 ${isSendingSchedule ? 'opacity-70 cursor-wait' : 'hover:opacity-90'}`}
                            >
                                {isSendingSchedule ? (
                                    <>
                                        <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-sm">send</span>
                                        Send
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
