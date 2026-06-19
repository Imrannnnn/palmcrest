import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DoctorPortal() {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [user, setUser] = useState(() => {
        const u = localStorage.getItem('user');
        return u ? JSON.parse(u) : null;
    });

    // Loader state
    const [isLoading, setIsLoading] = useState(false);

    // Profile Update Modal state
    const [showProfileModal, setShowProfileModal] = useState(() => {
        if (!user) return false;
        return !user.phoneNumber;
    });
    const [profilePhone, setProfilePhone] = useState(() => {
        return user?.phoneNumber || '';
    });
    const [profileSpecialization, setProfileSpecialization] = useState(() => {
        return user?.specialization || 'General ENT';
    });
    const getCurrentDayName = () => {
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        return days[new Date().getDay()];
    };

    const [selectedDay, setSelectedDay] = useState(() => getCurrentDayName());

    const getWeekRangeString = () => {
        const today = new Date();
        const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;

        const monday = new Date(today);
        monday.setDate(today.getDate() + distanceToMonday);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${sunday.toLocaleDateString('en-US', options)}`;
    };

    const getWeekDays = () => {
        const today = new Date();
        const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;

        const monday = new Date(today);
        monday.setDate(today.getDate() + distanceToMonday);

        const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
        return days.map((day, index) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + index);
            return {
                name: day,
                dayNum: date.getDate()
            };
        });
    };

    const getNextAppointment = () => {
        const approvedAppts = rawAppointments.filter(a => a.status === 'Approved' && a.type === 'Appointment');
        if (approvedAppts.length === 0) return null;

        // Sort by date and time
        const sorted = [...approvedAppts].sort((a, b) => new Date(a.date) - new Date(b.date));
        return sorted[0];
    };

    const initialScheduleData = {
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
    const [requests, setRequests] = useState([]);

    // Active Patient Notes state
    const [notes, setNotes] = useState([]);

    // We also need the raw appointments from the DB
    const [rawAppointments, setRawAppointments] = useState([]);
    const [scheduleData, setScheduleData] = useState(initialScheduleData);
    const [surgeries, setSurgeries] = useState([]);



    const fetchDoctorData = async () => {
        try {
            const token = localStorage.getItem('token');
            // 1. Fetch appointments
            const apptRes = await fetch('/api/appointments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let appts = [];
            if (apptRes.ok) {
                appts = await apptRes.json();
                setRawAppointments(appts);

                // Group by day of week
                const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
                const sched = { MON: [], TUE: [], WED: [], THU: [], FRI: [], SAT: [], SUN: [] };
                appts.forEach(appt => {
                    const dateObj = new Date(appt.date);
                    const dayName = days[dateObj.getDay()];
                    if (sched[dayName] && appt.type === 'Appointment') {
                        sched[dayName].push({
                            id: appt._id,
                            time: appt.timeSlot,
                            title: appt.title,
                            desc: `Patient: ${appt.patient?.fullName || 'Unknown'} (${appt.patient?.patientId || ''})`,
                            date: new Date(appt.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            }),
                            status: appt.status,
                            duration: `${appt.duration || 30} mins`,
                            borderClass: appt.status === 'Approved' ? 'border-l-[#2A7B4C]' : appt.status === 'Pending' ? 'border-l-amber-400' : 'border-l-red-400',
                            isCurrent: false
                        });
                    }
                });
                setScheduleData(sched);

                // Group Surgeries
                const surgList = appts.filter(appt => appt.type === 'Surgery');
                setSurgeries(surgList);

                // Group Requests (Pending)
                const reqList = appts.filter(appt => appt.status === 'Pending').map(appt => {
                    const nameParts = (appt.patient?.fullName || 'Unknown Patient').split(' ').filter(Boolean);
                    const initials = (nameParts.length > 1
                        ? [nameParts[0][0], nameParts[nameParts.length - 1][0]]
                        : [nameParts[0][0] || 'P']
                    ).join('').toUpperCase();

                    const formattedDate = new Date(appt.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    });

                    return {
                        id: appt._id,
                        name: appt.patient?.fullName || 'Unknown Patient',
                        condition: appt.title,
                        date: formattedDate,
                        timeSlot: appt.timeSlot,
                        initials: initials,
                        status: appt.status,
                        statusColor: 'bg-yellow-100 text-yellow-800'
                    };
                });
                setRequests(reqList);
            }

            // 2. Fetch clinical notes
            const notesRes = await fetch('/api/notes/doctor', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (notesRes.ok) {
                const notesData = await notesRes.json();
                const formattedNotes = notesData.map(n => {
                    const formattedTime = new Date(n.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                    });
                    return {
                        id: n._id,
                        name: n.patient.fullName,
                        note: n.note,
                        time: `Created on ${formattedTime}`,
                        badge: n.priority,
                        badgeColor: n.priority === 'Urgent' ? 'text-secondary' : n.priority === 'Monitoring' ? 'text-on-surface-variant' : 'text-tertiary'
                    };
                });
                setNotes(formattedNotes);
            }
        } catch (err) {
            console.error('Error fetching doctor data:', err);
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
        if (parsedUser.role !== 'doctor') {
            localStorage.clear();
            navigate('/portal');
            return;
        }

        // Profile details check is handled synchronously during state initialization

        Promise.resolve().then(() => {
            fetchDoctorData();
        });

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
    }, [navigate]);

    const toggleNotifications = () => {
        setIsNotificationsOpen(!isNotificationsOpen);
    };

    const handleAccept = async (id) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/appointments/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'Approved' })
            });
            if (response.ok) {
                alert('Appointment approved successfully!');
                fetchDoctorData();
            } else {
                const errData = await response.json();
                alert(errData.message || 'Failed to update status.');
            }
        } catch (err) {
            console.error(err);
            alert('Error updating status.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async (id) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/appointments/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'Cancelled' })
            });
            if (response.ok) {
                alert('Appointment cancelled successfully!');
                fetchDoctorData();
            } else {
                const errData = await response.json();
                alert(errData.message || 'Failed to update status.');
            }
        } catch (err) {
            console.error(err.message);
            alert('Error updating status.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewAnnotation = async () => {
        const name = prompt("Enter Patient Name or Patient ID to find patient record:");
        if (!name) return;

        // Search for patient in doctor's rawAppointments
        const matchedAppt = rawAppointments.find(a =>
            a.patient.fullName.toLowerCase().includes(name.toLowerCase()) ||
            a.patient.patientId === name
        );

        if (!matchedAppt) {
            alert("Patient record not found in your clinical appointments. Doctors can only write clinical notes for their active patients.");
            return;
        }

        const patientId = matchedAppt.patient._id;
        const patientName = matchedAppt.patient.fullName;

        const noteText = prompt(`Enter Clinical Annotation for ${patientName}:`);
        if (!noteText) return;

        const badge = prompt("Enter Priority (Urgent, Routine, Monitoring):", "Routine");
        if (!badge) return;

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    patient: patientId,
                    note: noteText,
                    priority: badge
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                alert(errData.message || 'Failed to add note.');
                return;
            }

            alert('Clinical note added successfully!');
            fetchDoctorData();
        } catch (err) {
            console.error(err);
            alert('Error adding clinical note.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            const parsedUser = JSON.parse(storedUser);

            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    phoneNumber: profilePhone,
                    specialization: profileSpecialization
                })
            });

            if (response.ok) {
                const updatedUser = await response.json();
                const mergedUser = { ...parsedUser, ...updatedUser };
                localStorage.setItem('user', JSON.stringify(mergedUser));
                setUser(mergedUser);
                alert('Profile updated successfully!');
                setShowProfileModal(false);
            } else {
                const errData = await response.json();
                alert(errData.message || 'Failed to update profile.');
            }
        } catch (err) {
            console.error(err);
            alert('Error updating profile details.');
        } finally {
            setIsLoading(false);
        }
    };

    const getLiveNotifications = () => {
        const list = [];

        // 1. Pending Requests (both appointments and surgeries)
        rawAppointments.forEach(appt => {
            const formattedDate = new Date(appt.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            const patientName = appt.patient?.fullName || 'Unknown Patient';

            if (appt.status === 'Pending') {
                list.push({
                    id: `pending-${appt._id}`,
                    type: 'pending',
                    title: appt.type === 'Surgery' ? 'New Surgery Request' : 'New Appointment Request',
                    message: `${patientName} requested: "${appt.title}" for ${formattedDate} at ${appt.timeSlot}`,
                    time: `Awaiting action`,
                    icon: appt.type === 'Surgery' ? 'medical_services' : 'calendar_today',
                    badgeColor: 'border-l-amber-400 bg-amber-500/5 text-amber-800'
                });
            } else if (appt.status === 'Approved') {
                list.push({
                    id: `approved-${appt._id}`,
                    type: 'approved',
                    title: appt.type === 'Surgery' ? 'Surgery Confirmed' : 'Appointment Confirmed',
                    message: `${appt.type === 'Surgery' ? 'Procedure' : 'Consultation'} with ${patientName} on ${formattedDate} at ${appt.timeSlot}`,
                    time: `Scheduled`,
                    icon: 'check_circle',
                    badgeColor: 'border-l-emerald-500 bg-emerald-500/5 text-emerald-800'
                });
            }
        });

        // 2. Clinical Notes
        notes.forEach(note => {
            list.push({
                id: `note-${note.id}`,
                type: 'note',
                title: `Clinical Note: ${note.badge}`,
                message: `Annotation for ${note.name}: "${note.note.substring(0, 55)}${note.note.length > 55 ? '...' : ''}"`,
                time: note.time,
                icon: 'history_edu',
                badgeColor: note.badge === 'Urgent'
                    ? 'border-l-rose-500 bg-rose-500/5 text-rose-800'
                    : 'border-l-primary bg-primary/5 text-primary'
            });
        });

        return list.sort((a, b) => {
            const score = { 'pending': 4, 'note-Urgent': 3, 'approved': 2, 'note': 1 };
            const aScore = score[a.type] || (a.title.includes('Urgent') ? 3 : 1);
            const bScore = score[b.type] || (b.title.includes('Urgent') ? 3 : 1);
            return bScore - aScore;
        });
    };

    const handleLogout = () => {
        localStorage.clear();
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
                {/* Decorative concentric circles in main background */}
                {/* Decorative concentric circles in main background */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] md:w-[600px] md:h-[600px] border-[12px] sm:border-[16px] md:border-[48px] border-primary/[0.03] dark:border-white/[0.03] rounded-full pointer-events-none z-[-1] translate-x-1/2"></div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[100px] h-[100px] sm:w-[130px] sm:h-[130px] md:w-[400px] md:h-[400px] border-[8px] sm:border-[12px] md:border-[32px] border-primary/[0.015] dark:border-white/[0.015] rounded-full pointer-events-none z-[-1] translate-x-1/2"></div>
            </div>

            {/* Sidebar Backdrop for Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-30 md:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* SideNavBar */}
            <aside className={`fixed left-0 top-0 h-full w-[280px] z-40 bg-surface/90 md:bg-surface/50 backdrop-blur-2xl border-r border-white/40 flex flex-col p-6 transition-transform duration-300 ease-in-out overflow-hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                {/* Decorative concentric circles */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[350px] h-[350px] border-[32px] border-primary/10 dark:border-white/10 rounded-full pointer-events-none -ml-28 z-0"></div>
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[220px] h-[220px] border-[24px] border-primary/5 dark:border-white/5 rounded-full pointer-events-none -ml-14 z-0"></div>

                <div className="flex flex-col h-full w-full relative z-10 gap-stack-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <img src="/logo-ent.jpeg" alt="PalmCrest ENT Logo" className="h-10 w-auto object-contain shadow-sm rounded-xl" />
                        <div>
                            <h1 className="text-headline-sm font-headline-md text-primary leading-none">PalmCrest ENT</h1>
                            <p className="text-caption text-on-surface-variant font-label-md">Clinical Excellence</p>
                        </div>
                    </div>
                    <nav className="flex-grow flex flex-col gap-2">
                        <button
                            onClick={() => { setActiveTab('dashboard'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all duration-300 ease-smooth ${activeTab === 'dashboard' ? 'bg-white/70 backdrop-blur-md text-primary' : 'text-on-surface-variant hover:translate-x-1 hover:bg-secondary-container/10'}`}
                        >
                            <span className="material-symbols-outlined">dashboard</span>
                            <span className="text-label-md">Dashboard</span>
                        </button>
                        <button
                            onClick={() => { setActiveTab('patients'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all duration-300 ease-smooth ${activeTab === 'patients' ? 'bg-white/70 backdrop-blur-md text-primary' : 'text-on-surface-variant hover:translate-x-1 hover:bg-secondary-container/10'}`}
                        >
                            <span className="material-symbols-outlined">group</span>
                            <span className="text-label-md">Patients</span>
                        </button>
                        <button
                            onClick={() => { setActiveTab('appointments'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
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
                            <p className="text-caption md:text-body-md text-on-surface-variant hidden sm:block">Welcome back, {user?.fullName || 'Dr. Julian Harrison'}. You have 8 appointments today.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="flex gap-2">
                            <button
                                onClick={toggleNotifications}
                                className="w-11 h-11 glass-card rounded-full flex items-center justify-center relative hover:bg-white/90 transition-all"
                            >
                                <span className="material-symbols-outlined">notifications</span>
                                {rawAppointments.filter(appt => appt.status === 'Pending').length > 0 && (
                                    <span className="absolute top-1 right-1 w-5 h-5 bg-secondary text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                                        {rawAppointments.filter(appt => appt.status === 'Pending').length}
                                    </span>
                                )}
                            </button>
                            <button className="w-11 h-11 glass-card rounded-full flex items-center justify-center hover:bg-white/90 transition-all hidden sm:flex">
                                <span className="material-symbols-outlined">search</span>
                            </button>
                        </div>
                        <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-outline-variant/30">
                            <div className="text-right hidden sm:block">
                                <p className="text-label-md text-primary font-bold">{user?.fullName || 'Dr. Julian Harrison'}</p>
                                <p className="text-caption text-on-surface-variant">{user?.specialization || 'Otolaryngologist'}</p>
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
                                            {getWeekRangeString()}
                                        </span>
                                    </div>

                                    {/* Daily Selector Tab Navigation */}
                                    <div className="flex overflow-x-auto no-scrollbar gap-2 bg-surface-container-low p-2 rounded-2xl mb-6">
                                        {getWeekDays().map((day) => (
                                            <button
                                                key={day.name}
                                                onClick={() => setSelectedDay(day.name)}
                                                className={`flex-grow flex flex-col items-center py-2.5 px-2 rounded-xl text-caption transition-all duration-300 ${selectedDay === day.name
                                                        ? 'bg-primary text-white shadow-md scale-[1.02]'
                                                        : day.name === 'SAT' || day.name === 'SUN'
                                                            ? 'text-on-surface-variant opacity-40 hover:opacity-75 hover:bg-white/20'
                                                            : 'text-on-surface-variant hover:text-primary hover:bg-white/40'
                                                    }`}
                                            >
                                                <span className="font-bold tracking-wider text-[10px]">{day.name}</span>
                                                <span className="text-body-md font-extrabold mt-0.5">{day.dayNum}</span>
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
                                                        className={`flex items-center gap-6 p-4 rounded-2xl border-l-4 transition-all duration-300 ${event.isCurrent
                                                                ? 'bg-secondary text-white shadow-lg shadow-secondary/20 ring-4 ring-secondary/5 border-l-secondary-fixed'
                                                                : `bg-white/50 border border-outline-variant/10 hover:bg-white/90 ${event.borderClass}`
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
                                                            <div className="flex items-center gap-2">
                                                                <h4 className={`font-headline-md text-body-md font-bold ${event.isCurrent ? 'text-white' : 'text-primary'}`}>
                                                                    {event.title}
                                                                </h4>
                                                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${event.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                                                                        event.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                                                            event.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                                                                'bg-red-100 text-red-800'
                                                                    }`}>
                                                                    {event.status}
                                                                </span>
                                                            </div>
                                                            <p className={`text-caption ${event.isCurrent ? 'text-white/90' : 'text-on-surface-variant'}`}>
                                                                {event.desc}
                                                            </p>
                                                            <p className={`text-[10px] mt-1 ${event.isCurrent ? 'text-white/80' : 'text-on-surface-variant/80'}`}>
                                                                {event.date}
                                                            </p>
                                                        </div>
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
                                            {getNextAppointment() ? (
                                                <p className="text-caption md:text-body-md text-on-surface-variant">
                                                    Next up: {getNextAppointment().patient?.fullName} ({getNextAppointment().timeSlot})
                                                </p>
                                            ) : (
                                                <p className="text-caption md:text-body-md text-on-surface-variant">
                                                    No telehealth sessions scheduled
                                                </p>
                                            )}
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
                                            <h3 className="text-headline-sm font-headline-md text-primary font-bold">New Patient Requests</h3>
                                            <span className="bg-secondary text-white text-caption font-bold px-2 py-0.5 rounded-full">
                                                {requests.filter(r => r.status === 'Pending').length} NEW
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-4">
                                            {requests.map(r => (
                                                <div key={r.id} className="p-5 rounded-2xl bg-white/60 backdrop-blur-md border border-white/65 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 group">
                                                    <div className="flex items-start justify-between gap-3 mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shadow-inner flex-shrink-0">
                                                                {r.initials}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h5 className="text-body-md font-bold text-primary truncate leading-tight">{r.name}</h5>
                                                                <p className="text-caption text-on-surface-variant mt-0.5 truncate">{r.condition}</p>
                                                            </div>
                                                        </div>
                                                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-yellow-100 text-yellow-800 flex-shrink-0">
                                                            {r.status}
                                                        </span>
                                                    </div>

                                                    {/* Date and Time info */}
                                                    <div className="mb-4 bg-surface-container-low/40 p-2.5 rounded-xl border border-outline-variant/15 flex items-center gap-2 text-caption">
                                                        <span className="material-symbols-outlined text-[16px] text-secondary">calendar_today</span>
                                                        <span className="font-semibold text-primary">{r.date}</span>
                                                        <span className="text-on-surface-variant">•</span>
                                                        <span className="material-symbols-outlined text-[16px] text-secondary">schedule</span>
                                                        <span className="font-semibold text-primary">{r.timeSlot}</span>
                                                    </div>

                                                    {r.status === 'Pending' && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleAccept(r.id)}
                                                                className="flex-1 py-2 text-[12px] font-bold bg-[#2A7B4C] text-white rounded-xl hover:bg-[#1E5C38] transition-all text-center shadow-sm hover:shadow"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(r.id)}
                                                                className="flex-1 py-2 text-[12px] font-bold bg-error-container/10 text-error border border-error/20 rounded-xl hover:bg-error hover:text-white transition-all text-center"
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
                                            {surgeries.length > 0 ? (
                                                surgeries.map((surg) => {
                                                    const formattedDate = new Date(surg.date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    });
                                                    return (
                                                        <div key={surg._id} className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-outline-variant/30">
                                                            <div className={`absolute left-[-4px] top-0 w-2 h-2 rounded-full ${surg.status === 'Approved' ? 'bg-primary' : surg.status === 'Pending' ? 'bg-amber-400' : 'bg-outline-variant'}`}></div>
                                                            <p className="text-caption font-bold text-primary">{formattedDate}, {surg.timeSlot} ({surg.status})</p>
                                                            <p className="text-body-md">{surg.title}</p>
                                                            <p className="text-caption text-on-surface-variant">Patient: {surg.patient.fullName}</p>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <p className="text-caption text-on-surface-variant">No surgery procedures in queue.</p>
                                            )}
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
                className={`fixed right-0 top-0 h-full w-[85%] sm:w-[400px] bg-white/95 backdrop-blur-3xl shadow-2xl z-50 transform transition-transform duration-500 ease-smooth border-l border-outline-variant/30 ${isNotificationsOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                id="notification-center"
            >
                <div className="p-6 md:p-8 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">notifications_active</span>
                            <h3 className="text-headline-md font-headline-md text-primary font-bold">Activity Center</h3>
                        </div>
                        <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors" onClick={toggleNotifications}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto no-scrollbar space-y-4 pb-8">
                        {getLiveNotifications().length > 0 ? (
                            getLiveNotifications().map(notif => (
                                <div
                                    key={notif.id}
                                    className={`p-4 rounded-2xl border-l-4 shadow-sm flex items-start gap-3 transition-all ${notif.badgeColor}`}
                                >
                                    <span className="material-symbols-outlined text-[20px] mt-0.5">{notif.icon}</span>
                                    <div className="text-left flex-grow min-w-0">
                                        <p className="text-label-md font-bold text-primary leading-tight truncate">{notif.title}</p>
                                        <p className="text-body-md text-on-surface-variant mt-1 text-xs leading-relaxed">{notif.message}</p>
                                        <p className="text-[10px] mt-2 font-semibold opacity-70 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[10px]">schedule</span>
                                            {notif.time}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-on-surface-variant/40 gap-2 py-12">
                                <span className="material-symbols-outlined text-4xl">notifications_off</span>
                                <p className="text-body-md font-label-md">No current activity notifications</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Profile Update Modal */}
            {showProfileModal && (
                <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-outline-variant/20 relative overflow-hidden text-left">
                        {/* Decorative background blob */}
                        <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] bg-primary/10 rounded-full blur-xl pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">medical_information</span>
                                </div>
                                <div>
                                    <h3 className="text-headline-md font-headline-md text-primary font-bold">Physician Profile</h3>
                                    <p className="text-caption text-on-surface-variant font-label-md">Verify Practice Credentials</p>
                                </div>
                            </div>

                            <p className="text-body-md text-on-surface-variant">
                                Please update your phone number and clinical specialization to ensure proper patient and emergency contact.
                            </p>

                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <label className="block text-caption font-label-md mb-2 text-on-surface-variant uppercase tracking-wider">Phone Number</label>
                                    <input
                                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl py-3 px-4 min-h-[48px] focus:ring-2 focus:ring-primary/30 outline-none text-body-md"
                                        type="tel"
                                        placeholder="+1 (555) 000-0000"
                                        value={profilePhone}
                                        onChange={(e) => setProfilePhone(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-caption font-label-md mb-2 text-on-surface-variant uppercase tracking-wider">Clinical Specialization</label>
                                    <select
                                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl py-3 px-4 min-h-[48px] focus:ring-2 focus:ring-primary/30 outline-none text-body-md"
                                        value={profileSpecialization}
                                        onChange={(e) => setProfileSpecialization(e.target.value)}
                                        required
                                    >
                                        <option value="General ENT">General ENT</option>
                                        <option value="Otologist">Otologist (Ear specialist)</option>
                                        <option value="Rhinologist">Rhinologist (Nose/Sinus specialist)</option>
                                        <option value="Laryngologist">Laryngologist (Throat/Voice specialist)</option>
                                        <option value="Pediatric ENT">Pediatric ENT</option>
                                        <option value="Head and Neck Surgeon">Head and Neck Surgeon</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowProfileModal(false)}
                                        className="flex-1 py-3 border-2 border-outline-variant/40 rounded-xl font-label-md text-on-surface-variant hover:bg-surface-container transition-all"
                                    >
                                        Later
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 btn-primary-gradient text-white rounded-xl font-label-md shadow-lg shadow-primary/10"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Loader Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-on-surface/30 backdrop-blur-sm z-[100] flex flex-col items-center justify-center gap-4">
                    <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-outline-variant/30 flex flex-col items-center gap-4">
                        <img
                            src="/logo-ent.jpeg"
                            alt="PalmCrest Logo"
                            className="w-16 h-16 rounded-2xl shadow-md animate-pulse object-contain"
                        />
                        <div className="flex flex-col items-center gap-1">
                            <span className="font-label-md text-primary font-bold tracking-wide uppercase text-xs">PalmCrest ENT</span>
                            <span className="text-body-md text-on-surface-variant font-medium animate-pulse">Loading...</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
