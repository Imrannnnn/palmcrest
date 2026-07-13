import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const isAppointmentPast = (dateStr, timeSlot) => {
    if (!dateStr) return false;
    const apptDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (apptDate < today) {
        return true;
    }
    if (apptDate.toDateString() === today.toDateString()) {
        if (!timeSlot) return false;
        try {
            const timeParts = timeSlot.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
            if (timeParts) {
                let hours = parseInt(timeParts[1], 10);
                const minutes = parseInt(timeParts[2], 10);
                const ampm = timeParts[3].toUpperCase();
                if (ampm === 'PM' && hours < 12) hours += 12;
                if (ampm === 'AM' && hours === 12) hours = 0;
                
                const apptDateTime = new Date(apptDate);
                apptDateTime.setHours(hours, minutes, 0, 0);
                return apptDateTime < new Date();
            }
        } catch (e) {
            console.error("Error parsing time slot", e);
        }
    }
    return false;
};

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
        const isPhoneMissing = !user.phoneNumber;
        const isGenderMissing = user.gender !== 'Male' && user.gender !== 'Female';
        return isPhoneMissing || isGenderMissing;
    });
    const [profilePhone, setProfilePhone] = useState(() => {
        return user?.phoneNumber || '';
    });
    const [profileSpecialization, setProfileSpecialization] = useState(() => {
        return user?.specialization || 'General ENT';
    });
    const [profileGender, setProfileGender] = useState(() => {
        return user?.gender || 'Male';
    });
    const getCurrentDayName = () => {
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        return days[new Date().getDay()];
    };

    const [selectedDay, setSelectedDay] = useState(() => getCurrentDayName());

    const getMonday = (d) => {
        const dCopy = new Date(d);
        const day = dCopy.getDay();
        const diff = dCopy.getDate() - day + (day === 0 ? -6 : 1);
        dCopy.setDate(diff);
        dCopy.setHours(0, 0, 0, 0);
        return dCopy;
    };
    
    // Safely parse date string to local date, ignoring timezones
    const parseLocalDate = (dateString) => {
        if (!dateString) return new Date();
        const str = dateString.includes('T') ? dateString.split('T')[0] : dateString;
        const [year, month, day] = str.split('-');
        return new Date(year, month - 1, day);
    };
    const [currentWeekStart, setCurrentWeekStart] = useState(() => getMonday(new Date()));

    const getWeekRangeString = () => {
        const monday = new Date(currentWeekStart);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${sunday.toLocaleDateString('en-US', options)}`;
    };

    const getWeekDays = () => {
        const monday = new Date(currentWeekStart);
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



    const [requests, setRequests] = useState([]);
    const [notes, setNotes] = useState([]);
    const [rawAppointments, setRawAppointments] = useState([]);
    const scheduleData = (() => {
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const sched = { MON: [], TUE: [], WED: [], THU: [], FRI: [], SAT: [], SUN: [] };
        
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(currentWeekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        rawAppointments.forEach(appt => {
            if (!appt.date) return;
            const dateObj = parseLocalDate(appt.date);
            
            // Check if appointment is within the current week
            if (dateObj >= currentWeekStart && dateObj <= weekEnd && appt.type === 'Appointment') {
                const dayName = days[dateObj.getDay()];
                sched[dayName].push({
                    id: appt._id,
                    time: appt.timeSlot,
                    title: appt.title,
                    desc: `Patient: ${appt.patient?.fullName || 'Unknown'} (${appt.patient?.patientId || ''})`,
                    date: dateObj.toLocaleDateString('en-US', {
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

        // Sort appointments by time within each day
        const parseTime = (timeStr) => {
            if (!timeStr) return 0;
            const parts = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
            if (!parts) return 0;
            let hours = parseInt(parts[1], 10);
            const minutes = parseInt(parts[2], 10);
            const ampm = parts[3].toUpperCase();
            if (ampm === 'PM' && hours < 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;
            return hours * 60 + minutes;
        };

        Object.keys(sched).forEach(day => {
            sched[day].sort((a, b) => parseTime(a.time) - parseTime(b.time));
        });

        return sched;
    })();
    const [surgeries, setSurgeries] = useState([]);

    // Stat Modal state
    const [statModal, setStatModal] = useState({ isOpen: false, title: '', type: '', data: [] });

    // New Clinical Note Modal state
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [noteSearchQuery, setNoteSearchQuery] = useState('');
    const [selectedPatientForNote, setSelectedPatientForNote] = useState(null);
    const [newNoteText, setNewNoteText] = useState('');
    const [newNotePriority, setNewNotePriority] = useState('Routine');

    const todayAppointmentsCount = rawAppointments.filter(appt => {
        if (!appt.date) return false;
        const apptDate = parseLocalDate(appt.date);
        return apptDate.toDateString() === new Date().toDateString() && appt.status !== 'Cancelled';
    }).length;

    const getTodayAppointments = () => {
        const todayStr = new Date().toDateString();
        return rawAppointments
            .filter(appt => {
                if (!appt.date) return false;
                return parseLocalDate(appt.date).toDateString() === todayStr && appt.status !== 'Cancelled';
            });
    };

    const getUniquePatients = () => {
        const patientsMap = new Map();
        rawAppointments.forEach(appt => {
            if (appt.patient && appt.patient._id && appt.patient.fullName) {
                patientsMap.set(appt.patient._id, {
                    _id: appt.patient._id,
                    fullName: appt.patient.fullName,
                    patientId: appt.patient.patientId || ''
                });
            }
        });
        return Array.from(patientsMap.values());
    };

    const getFilteredPatients = () => {
        const patients = getUniquePatients();
        if (!noteSearchQuery.trim()) return patients;
        return patients.filter(p => 
            p.fullName.toLowerCase().includes(noteSearchQuery.toLowerCase()) ||
            p.patientId.toLowerCase().includes(noteSearchQuery.toLowerCase())
        );
    };

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
                
                const mappedAppts = appts.map(appt => {
                    if (appt.status === 'Approved' && isAppointmentPast(appt.date, appt.timeSlot)) {
                        return { ...appt, status: 'Completed' };
                    }
                    return appt;
                });
                
                setRawAppointments(mappedAppts);

                // Group Surgeries
                const surgList = mappedAppts.filter(appt => appt.type === 'Surgery');
                setSurgeries(surgList);

                // Group Requests (Pending)
                const reqList = mappedAppts.filter(appt => appt.status === 'Pending').map(appt => {
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

    const handleTriggerPostVisit = async (id) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/appointments/${id}/reminders/post-visit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                alert('Post-visit email sent successfully!');
                fetchDoctorData();
            } else {
                const errData = await response.json();
                alert(errData.message || 'Failed to send post-visit email.');
            }
        } catch (err) {
            console.error(err);
            alert('Error sending email.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewAnnotation = () => {
        setNoteSearchQuery('');
        setSelectedPatientForNote(null);
        setNewNoteText('');
        setNewNotePriority('Routine');
        setShowNoteModal(true);
    };

    const handleSubmitNote = async (e) => {
        e.preventDefault();
        if (!selectedPatientForNote) {
            alert('Please select a patient first.');
            return;
        }
        if (!newNoteText.trim()) {
            alert('Please enter clinical note text.');
            return;
        }

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
                    patient: selectedPatientForNote._id,
                    note: newNoteText,
                    priority: newNotePriority
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                alert(errData.message || 'Failed to add note.');
                return;
            }

            alert('Clinical note added successfully!');
            setShowNoteModal(false);
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
                    specialization: profileSpecialization,
                    gender: profileGender
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
                        <img src="/logo-ent.jpeg" alt="PalmCrest ENT Logo" className="h-10 w-auto object-contain shadow-sm rounded-lg" />
                        <div>
                            <h1 className="text-headline-sm font-headline-md text-primary leading-none">PalmCrest ENT</h1>
                            <p className="text-caption text-on-surface-variant font-label-md">Clinical Excellence</p>
                        </div>
                    </div>
                    <nav className="flex-grow flex flex-col gap-2">
                        <button
                            onClick={() => { setActiveTab('dashboard'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg font-bold transition-all duration-300 ease-smooth ${activeTab === 'dashboard' ? 'bg-white/70 backdrop-blur-md text-primary' : 'text-on-surface-variant hover:translate-x-1 hover:bg-secondary-container/10'}`}
                        >
                            <span className="material-symbols-outlined">dashboard</span>
                            <span className="text-label-md">Dashboard</span>
                        </button>
                        <button
                            onClick={() => { setActiveTab('patients'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg font-bold transition-all duration-300 ease-smooth ${activeTab === 'patients' ? 'bg-white/70 backdrop-blur-md text-primary' : 'text-on-surface-variant hover:translate-x-1 hover:bg-secondary-container/10'}`}
                        >
                            <span className="material-symbols-outlined">group</span>
                            <span className="text-label-md">Patients</span>
                        </button>
                        <button
                            onClick={() => { setActiveTab('appointments'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg font-bold transition-all duration-300 ease-smooth ${activeTab === 'appointments' ? 'bg-white/70 backdrop-blur-md text-primary' : 'text-on-surface-variant hover:translate-x-1 hover:bg-secondary-container/10'}`}
                        >
                            <span className="material-symbols-outlined">calendar_today</span>
                            <span className="text-label-md">Appointments</span>
                        </button>
                        <button
                            onClick={() => { setActiveTab('settings'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg font-bold transition-all duration-300 ease-smooth ${activeTab === 'settings' ? 'bg-white/70 backdrop-blur-md text-primary' : 'text-on-surface-variant hover:translate-x-1 hover:bg-secondary-container/10'}`}
                        >
                            <span className="material-symbols-outlined">settings</span>
                            <span className="text-label-md">Settings</span>
                        </button>
                    </nav>
                    <div className="mt-auto flex flex-col gap-4">
                        <button className="btn-gradient text-white font-label-md py-3 rounded-lg flex items-center justify-center gap-2">
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
                            className="p-2 min-w-[44px] min-h-[44px] rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-primary flex items-center justify-center shadow-sm"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div>
                            <h2 className="text-headline-md md:text-headline-lg font-headline-lg text-primary hidden sm:block">Physician Hub</h2>
                            <p className="text-caption md:text-body-md text-on-surface-variant hidden sm:block">Welcome back, {user?.fullName || 'Dr. Julian Harrison'}. You have {todayAppointmentsCount} appointment{todayAppointmentsCount === 1 ? '' : 's'} today.</p>
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
                            {user?.gender === 'Female' ? (
                                <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-white text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>woman</span>
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-white text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>man</span>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Dashboard Grid */}
                <div className="flex-grow overflow-y-auto px-4 md:px-margin-desktop pt-6 pb-10 no-scrollbar">
                    {activeTab === 'dashboard' && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {/* Card 1: Today's Engagements */}
                            <div 
                                onClick={() => setStatModal({ isOpen: true, title: "Today's Schedule", type: 'appointments', data: getTodayAppointments() })}
                                className="glass-card rounded-xl p-4 flex items-center gap-4 hover:translate-y-[-2px] transition-all duration-300 cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-2xl">calendar_today</span>
                                </div>
                                <div>
                                    <p className="text-caption text-on-surface-variant font-medium">Today's Schedule</p>
                                    <h4 className="text-headline-md font-bold text-primary">{todayAppointmentsCount}</h4>
                                </div>
                            </div>

                            {/* Card 2: Pending Requests */}
                            <div 
                                onClick={() => setStatModal({ isOpen: true, title: "Pending Requests", type: 'requests', data: requests })}
                                className="glass-card rounded-xl p-4 flex items-center gap-4 hover:translate-y-[-2px] transition-all duration-300 cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-2xl">pending_actions</span>
                                </div>
                                <div>
                                    <p className="text-caption text-on-surface-variant font-medium">Pending Requests</p>
                                    <h4 className="text-headline-md font-bold text-primary">
                                        {rawAppointments.filter(a => a.status === 'Pending').length}
                                    </h4>
                                </div>
                            </div>

                            {/* Card 3: Completed / History */}
                            <div 
                                onClick={() => setStatModal({ isOpen: true, title: "Completed Appointments", type: 'appointments', data: rawAppointments.filter(a => a.status === 'Completed') })}
                                className="glass-card rounded-xl p-4 flex items-center gap-4 hover:translate-y-[-2px] transition-all duration-300 cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-2xl">history</span>
                                </div>
                                <div>
                                    <p className="text-caption text-on-surface-variant font-medium">Completed</p>
                                    <h4 className="text-headline-md font-bold text-primary">
                                        {rawAppointments.filter(a => a.status === 'Completed').length}
                                    </h4>
                                </div>
                            </div>

                            {/* Card 4: Active Notes */}
                            <div 
                                onClick={() => setStatModal({ isOpen: true, title: "Active Notes", type: 'notes', data: notes })}
                                className="glass-card rounded-xl p-4 flex items-center gap-4 hover:translate-y-[-2px] transition-all duration-300 cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-2xl">history_edu</span>
                                </div>
                                <div>
                                    <p className="text-caption text-on-surface-variant font-medium">Active Notes</p>
                                    <h4 className="text-headline-md font-bold text-primary">{notes.length}</h4>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-gutter">
                        {/* Dashboard Left Column: Today's Agenda */}
                        {activeTab === 'dashboard' && (
                            <section className="col-span-1 md:col-span-12 lg:col-span-8 flex flex-col gap-4">
                                <div className="glass-card rounded-2xl p-4 md:p-5 flex flex-col min-h-[400px] h-[50dvh] md:h-[480px]">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-headline-md font-headline-md text-primary">Today's Agenda</h3>
                                        <span className="font-label-md text-secondary uppercase tracking-[0.05em] text-caption bg-secondary/10 px-3 py-1 rounded-full">
                                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="flex-grow overflow-y-auto pr-1 no-scrollbar">
                                        {getTodayAppointments().length > 0 ? (
                                            <div className="space-y-4">
                                                {getTodayAppointments().map((event, index) => (
                                                    <div
                                                        key={index}
                                                        className={`flex items-center gap-6 p-4 rounded-xl border-l-4 transition-all duration-300 bg-white/50 border border-outline-variant/10 hover:bg-white/90 ${
                                                            event.status === 'Approved' ? 'border-l-[#2A7B4C]' : event.status === 'Pending' ? 'border-l-amber-400' : event.status === 'Completed' ? 'border-l-blue-400' : 'border-l-red-400'
                                                        }`}
                                                    >
                                                        <div className="text-left min-w-[90px]">
                                                            <p className="font-label-md text-caption text-secondary font-bold">
                                                                {event.timeSlot}
                                                            </p>
                                                            <p className="text-[10px] text-on-surface-variant">
                                                                {event.duration || 30} mins
                                                            </p>
                                                        </div>
                                                        <div className="text-left flex-grow">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-headline-md text-body-md font-bold text-primary">
                                                                    {event.title}
                                                                </h4>
                                                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                                                    event.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                                                                    event.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                                                    event.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                                                    'bg-red-100 text-red-800'
                                                                }`}>
                                                                    {event.status}
                                                                </span>
                                                            </div>
                                                            <p className="text-caption text-on-surface-variant">
                                                                Patient: {event.patient?.fullName || 'Unknown'} ({event.patient?.patientId || ''})
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-on-surface-variant/50 gap-2 py-12">
                                                <span className="material-symbols-outlined text-3xl">calendar_today</span>
                                                <p className="text-body-md font-label-md">No appointments scheduled for today</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Appointments Left Column: Weekly Schedule & Complete Appointment Log */}
                        {activeTab === 'appointments' && (
                            <section className="col-span-1 md:col-span-12 lg:col-span-8 flex flex-col gap-4">
                                <div className="glass-card rounded-2xl p-4 md:p-5 flex flex-col min-h-[400px] h-[50dvh] md:h-[480px]">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-headline-md font-headline-md text-primary">Weekly Schedule</h3>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => {
                                                    const newDate = new Date(currentWeekStart);
                                                    newDate.setDate(newDate.getDate() - 7);
                                                    setCurrentWeekStart(newDate);
                                                }}
                                                className="p-1 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant flex items-center justify-center"
                                                title="Previous Week"
                                            >
                                                <span className="material-symbols-outlined">chevron_left</span>
                                            </button>
                                            
                                            <div className="relative group">
                                                <span className="font-label-md text-secondary uppercase tracking-[0.05em] text-caption bg-secondary/10 px-3 py-1.5 rounded-lg min-w-[200px] text-center inline-flex items-center justify-center gap-2 cursor-pointer hover:bg-secondary/20 transition-colors">
                                                    <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                                                    {getWeekRangeString()}
                                                </span>
                                                <input 
                                                    type="date"
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            setCurrentWeekStart(getMonday(parseLocalDate(e.target.value)));
                                                        }
                                                    }}
                                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                    title="Select Date to Jump"
                                                />
                                            </div>

                                            <button 
                                                onClick={() => {
                                                    const newDate = new Date(currentWeekStart);
                                                    newDate.setDate(newDate.getDate() + 7);
                                                    setCurrentWeekStart(newDate);
                                                }}
                                                className="p-1 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant flex items-center justify-center"
                                                title="Next Week"
                                            >
                                                <span className="material-symbols-outlined">chevron_right</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Daily Selector Tab Navigation */}
                                    <div className="flex overflow-x-auto no-scrollbar gap-2 bg-surface-container-low p-2 rounded-xl mb-6">
                                        {getWeekDays().map((day) => (
                                            <button
                                                key={day.name}
                                                onClick={() => setSelectedDay(day.name)}
                                                className={`flex-grow flex flex-col items-center py-2.5 px-2 rounded-lg text-caption transition-all duration-300 ${selectedDay === day.name
                                                        ? 'bg-primary text-white shadow-md scale-[1.02]'
                                                        : day.name === 'SAT' || day.name === 'SUN'
                                                            ? 'text-on-surface-variant opacity-40 hover:opacity-75 hover:bg-white/20'
                                                            : 'text-on-surface-variant hover:text-primary hover:bg-white/40'
                                                    }`}
                                            >
                                                <span className="font-bold tracking-wider text-[10px]">{day.name}</span>
                                                <span className="text-body-md font-bold mt-0.5">{day.dayNum}</span>
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
                                                        className={`flex items-center gap-6 p-4 rounded-xl border-l-4 transition-all duration-300 ${event.isCurrent
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
                                                <span className="material-symbols-outlined text-3xl">calendar_today</span>
                                                <p className="text-body-md font-label-md">No appointments scheduled</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Complete Appointment Log */}
                                <div className="glass-card rounded-2xl p-4 md:p-5 flex flex-col">
                                    <h3 className="text-headline-md font-headline-md text-primary mb-6">Complete Appointment Log</h3>
                                    <div className="overflow-y-auto max-h-[400px] pr-1 no-scrollbar space-y-4">
                                        {rawAppointments.length > 0 ? (
                                            rawAppointments.map((appt) => {
                                                const formattedDate = parseLocalDate(appt.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                });
                                                return (
                                                    <div key={appt._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white/40 rounded-xl border border-white/60 hover:bg-white/60 transition-colors gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${appt.type === 'Surgery' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                                                                <span className="material-symbols-outlined">
                                                                    {appt.type === 'Surgery' ? 'medical_services' : 'calendar_today'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <p className="font-label-md text-primary font-bold">{appt.title}</p>
                                                                <p className="text-caption text-on-surface-variant">
                                                                    {formattedDate} • {appt.timeSlot} • Patient: {appt.patient?.fullName || 'Unknown'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-caption font-label-md ${
                                                            appt.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                                                            appt.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                                            appt.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {appt.status}
                                                        </span>
                                                        {appt.status === 'Completed' && !appt.remindersSent?.includes('post4hr') && (
                                                            <button
                                                                onClick={() => handleTriggerPostVisit(appt._id)}
                                                                className="ml-4 bg-primary/10 text-primary text-caption px-3 py-1.5 rounded-lg font-bold hover:bg-primary/20 animate-smooth"
                                                            >
                                                                Send Post-Visit
                                                            </button>
                                                        )}
                                                        {appt.status === 'Completed' && appt.remindersSent?.includes('post4hr') && (
                                                            <span className="ml-4 text-caption text-emerald-600 font-medium">Follow-up Sent</span>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-caption text-on-surface-variant">No appointments registered.</p>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Right Column (Patient Cards & Surgery Queue) - Spans 4 cols */}
                        {(activeTab === 'dashboard' || activeTab === 'patients' || activeTab === 'appointments') && (
                            <section className={`col-span-1 md:col-span-12 ${activeTab === 'patients' ? 'lg:col-span-12' : 'lg:col-span-4'} flex flex-col gap-6 md:gap-gutter`}>
                                {/* Patient Requests Queue */}
                                {(activeTab === 'dashboard' || activeTab === 'patients') && (
                                    <div className="glass-card rounded-2xl p-4 md:p-5">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-headline-sm font-headline-md text-primary font-bold">New Patient Requests</h3>
                                            <span className="bg-secondary text-white text-caption font-bold px-2 py-0.5 rounded-full">
                                                {requests.filter(r => r.status === 'Pending').length} NEW
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-4">
                                            {requests.map(r => (
                                                <div key={r.id} className="p-5 rounded-xl bg-white/60 backdrop-blur-md border border-white/65 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 group">
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
                                                    <div className="mb-4 bg-surface-container-low/40 p-2.5 rounded-lg border border-outline-variant/15 flex flex-wrap items-center gap-x-2 gap-y-1 text-caption">
                                                        <div className="flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[16px] text-secondary">calendar_today</span>
                                                            <span className="font-semibold text-primary">{r.date}</span>
                                                        </div>
                                                        <span className="text-on-surface-variant hidden xs:inline">•</span>
                                                        <div className="flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[16px] text-secondary">schedule</span>
                                                            <span className="font-semibold text-primary">{r.timeSlot}</span>
                                                        </div>
                                                    </div>

                                                    {r.status === 'Pending' && (
                                                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                                                            <button
                                                                onClick={() => handleAccept(r.id)}
                                                                className="w-full sm:flex-1 py-2.5 sm:py-2 text-[12px] font-bold bg-[#2A7B4C] text-white rounded-lg hover:bg-[#1E5C38] transition-all text-center shadow-sm hover:shadow"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(r.id)}
                                                                className="w-full sm:flex-1 py-2.5 sm:py-2 text-[12px] font-bold bg-error-container/10 text-error border border-error/20 rounded-lg hover:bg-error hover:text-white transition-all text-center"
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
                                    <div className="glass-card rounded-2xl p-4 md:p-5 flex-grow">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-headline-sm font-headline-md text-primary font-bold">Surgery Queue</h3>
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
                                                            <div className={`absolute left-[-4px] top-0 w-2 h-2 rounded-full ${surg.status === 'Approved' ? 'bg-primary' : surg.status === 'Pending' ? 'bg-amber-400' : surg.status === 'Completed' ? 'bg-blue-400' : 'bg-outline-variant'}`}></div>
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
                            <section className="col-span-1 md:col-span-12 glass-card rounded-2xl p-6 md:p-5 mb-8">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                                    <div>
                                        <h3 className="text-headline-md font-headline-md text-primary">Active Patient Notes</h3>
                                        <p className="text-body-md text-on-surface-variant">Recent clinical annotations and observations.</p>
                                    </div>
                                    <button
                                        onClick={handleNewAnnotation}
                                        className="w-full md:w-auto px-6 py-2 border-2 border-primary text-primary rounded-lg font-label-md hover:bg-primary hover:text-white transition-all text-center"
                                    >
                                        New Annotation
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {notes.map(n => (
                                        <div key={n.id} className="p-6 rounded-xl bg-white border border-outline-variant/20 shadow-sm flex flex-col gap-4">
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
                        {/* Settings View */}
                        {activeTab === 'settings' && (
                            <section className="col-span-1 md:col-span-12 lg:col-span-12 flex flex-col gap-6 md:gap-gutter pb-8">
                                <div className="glass-card rounded-2xl p-6 md:p-8 flex flex-col">
                                    <h3 className="text-headline-md font-headline-md text-primary mb-2">Account Settings</h3>
                                    <p className="text-body-md text-on-surface-variant mb-8">Manage your profile, preferences, and notifications.</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Profile Section */}
                                        <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/20 shadow-sm flex flex-col gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <span className="material-symbols-outlined">person</span>
                                                </div>
                                                <h4 className="text-label-md font-bold text-primary">Profile Information</h4>
                                            </div>
                                            <div className="space-y-2 mt-2">
                                                <div className="flex justify-between items-center py-2 border-b border-outline-variant/10">
                                                    <span className="text-caption text-on-surface-variant">Full Name</span>
                                                    <span className="font-bold text-primary">{user?.fullName}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-outline-variant/10">
                                                    <span className="text-caption text-on-surface-variant">Specialization</span>
                                                    <span className="font-bold text-primary">{profileSpecialization}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-outline-variant/10">
                                                    <span className="text-caption text-on-surface-variant">Phone</span>
                                                    <span className="font-bold text-primary">{profilePhone || 'Not set'}</span>
                                                </div>
                                                <div className="pt-4 flex justify-end">
                                                    <button onClick={() => setShowProfileModal(true)} className="px-4 py-2 bg-secondary/10 text-secondary hover:bg-secondary/20 rounded-lg text-label-md font-bold transition-colors">
                                                        Edit Profile
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notification Preferences */}
                                        <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/20 shadow-sm flex flex-col gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                                                    <span className="material-symbols-outlined">notifications</span>
                                                </div>
                                                <h4 className="text-label-md font-bold text-primary">Notification Preferences</h4>
                                            </div>
                                            <div className="space-y-4 mt-2">
                                                <label className="flex items-center justify-between cursor-pointer">
                                                    <span className="text-body-md text-on-surface-variant">Email Alerts for New Appointments</span>
                                                    <input type="checkbox" defaultChecked className="toggle-checkbox w-5 h-5 accent-primary" />
                                                </label>
                                                <label className="flex items-center justify-between cursor-pointer">
                                                    <span className="text-body-md text-on-surface-variant">SMS Reminders for Pending Requests</span>
                                                    <input type="checkbox" defaultChecked className="toggle-checkbox w-5 h-5 accent-primary" />
                                                </label>
                                                <label className="flex items-center justify-between cursor-pointer">
                                                    <span className="text-body-md text-on-surface-variant">Weekly Summary Reports</span>
                                                    <input type="checkbox" className="toggle-checkbox w-5 h-5 accent-primary" />
                                                </label>
                                            </div>
                                        </div>

                                        {/* Security */}
                                        <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/20 shadow-sm flex flex-col gap-4 md:col-span-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                                    <span className="material-symbols-outlined">security</span>
                                                </div>
                                                <h4 className="text-label-md font-bold text-primary">Security Settings</h4>
                                            </div>
                                            <div className="flex items-center justify-between mt-2 p-4 bg-white rounded-lg border border-outline-variant/10">
                                                <div>
                                                    <h5 className="font-bold text-primary">Password</h5>
                                                    <p className="text-caption text-on-surface-variant">Last changed 3 months ago</p>
                                                </div>
                                                <button onClick={() => alert('Password reset link sent to your email.')} className="px-4 py-2 border border-outline-variant/30 text-primary hover:bg-surface-container rounded-lg text-label-md font-bold transition-colors">
                                                    Update
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between mt-2 p-4 bg-white rounded-lg border border-outline-variant/10">
                                                <div>
                                                    <h5 className="font-bold text-primary">Two-Factor Authentication</h5>
                                                    <p className="text-caption text-on-surface-variant">Add an extra layer of security to your account.</p>
                                                </div>
                                                <button onClick={() => alert('Feature coming soon')} className="px-4 py-2 border border-outline-variant/30 text-primary hover:bg-surface-container rounded-lg text-label-md font-bold transition-colors">
                                                    Enable 2FA
                                                </button>
                                            </div>
                                        </div>
                                    </div>
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
                <div className="p-6 md:p-5 h-full flex flex-col">
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
                                    className={`p-4 rounded-xl border-l-4 shadow-sm flex items-start gap-3 transition-all ${notif.badgeColor}`}
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
                                <span className="material-symbols-outlined text-3xl">notifications_off</span>
                                <p className="text-body-md font-label-md">No current activity notifications</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* New Clinical Note Modal */}
            {showNoteModal && (
                <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 md:p-5 max-w-md w-full shadow-2xl border border-outline-variant/20 relative overflow-hidden text-left flex flex-col max-h-[90vh]">
                        {/* Decorative background blob */}
                        <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] bg-secondary/10 rounded-full blur-xl pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col gap-4 overflow-hidden flex-grow">
                            <div className="flex items-center gap-3 mb-2 flex-shrink-0">
                                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                                    <span className="material-symbols-outlined">history_edu</span>
                                </div>
                                <div>
                                    <h3 className="text-headline-md font-headline-md text-primary font-bold">New Clinical Note</h3>
                                    <p className="text-caption text-on-surface-variant font-label-md">Add Annotation to Patient Record</p>
                                </div>
                            </div>

                            <div className="flex-grow overflow-y-auto no-scrollbar pr-1 space-y-4">
                                {!selectedPatientForNote ? (
                                    <div className="flex flex-col gap-3">
                                        <label className="block text-caption font-label-md text-on-surface-variant uppercase tracking-wider">Select Patient</label>
                                        <div className="relative">
                                            <input
                                                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg py-3 pl-10 pr-4 min-h-[48px] focus:ring-2 focus:ring-secondary/30 outline-none text-body-md"
                                                type="text"
                                                placeholder="Search by name or patient ID..."
                                                value={noteSearchQuery}
                                                onChange={(e) => setNoteSearchQuery(e.target.value)}
                                                autoFocus
                                            />
                                            <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant text-[22px]">search</span>
                                        </div>
                                        
                                        <div className="border border-outline-variant/20 rounded-xl max-h-[200px] overflow-y-auto bg-surface-container-lowest">
                                            {getFilteredPatients().length > 0 ? (
                                                <div className="divide-y divide-outline-variant/10">
                                                    {getFilteredPatients().map(p => (
                                                        <button
                                                            key={p._id}
                                                            type="button"
                                                            onClick={() => setSelectedPatientForNote(p)}
                                                            className="w-full px-4 py-3 text-left hover:bg-secondary/5 transition-all text-body-md font-medium text-primary flex items-center justify-between"
                                                        >
                                                            <span>{p.fullName}</span>
                                                            <span className="text-caption text-on-surface-variant font-mono text-xs">{p.patientId}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-6 text-center text-caption text-on-surface-variant">
                                                    No active patients match your search.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-fadeIn">
                                        <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/20 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">Selected Patient</p>
                                                <h5 className="text-body-md font-bold text-primary">{selectedPatientForNote.fullName}</h5>
                                                <p className="text-caption text-on-surface-variant font-mono">{selectedPatientForNote.patientId}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedPatientForNote(null)}
                                                className="px-3 py-1.5 text-xs text-secondary hover:underline font-label-md"
                                            >
                                                Change
                                            </button>
                                        </div>

                                        <form onSubmit={handleSubmitNote} className="space-y-4">
                                            <div>
                                                <label className="block text-caption font-label-md mb-2 text-on-surface-variant uppercase tracking-wider">Clinical Annotation</label>
                                                <textarea
                                                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg py-3 px-4 min-h-[100px] max-h-[160px] focus:ring-2 focus:ring-secondary/30 outline-none text-body-md resize-none"
                                                    placeholder="Enter medical observations, treatment recommendations, or general notes..."
                                                    value={newNoteText}
                                                    onChange={(e) => setNewNoteText(e.target.value)}
                                                    required
                                                    rows={4}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-caption font-label-md mb-2 text-on-surface-variant uppercase tracking-wider">Priority Level</label>
                                                <select
                                                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg py-3 px-4 min-h-[48px] focus:ring-2 focus:ring-secondary/30 outline-none text-body-md"
                                                    value={newNotePriority}
                                                    onChange={(e) => setNewNotePriority(e.target.value)}
                                                    required
                                                >
                                                    <option value="Routine">Routine</option>
                                                    <option value="Monitoring">Monitoring</option>
                                                    <option value="Urgent">Urgent</option>
                                                </select>
                                            </div>

                                            <div className="flex gap-3 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNoteModal(false)}
                                                    className="flex-1 py-3 border-2 border-outline-variant/40 rounded-lg font-label-md text-on-surface-variant hover:bg-surface-container transition-all text-center"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="flex-1 py-3 btn-gradient text-white rounded-lg font-label-md shadow-lg shadow-secondary/10"
                                                >
                                                    Save Note
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>

                            {!selectedPatientForNote && (
                                <div className="flex gap-3 pt-4 border-t border-outline-variant/10 flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setShowNoteModal(false)}
                                        className="w-full py-3 border-2 border-outline-variant/40 rounded-lg font-label-md text-on-surface-variant hover:bg-surface-container transition-all text-center"
                                    >
                                        Close
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Update Modal */}
            {showProfileModal && (
                <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 md:p-5 max-w-md w-full shadow-2xl border border-outline-variant/20 relative overflow-hidden text-left">
                        {/* Decorative background blob */}
                        <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] bg-primary/10 rounded-full blur-xl pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
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
                                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg py-3 px-4 min-h-[48px] focus:ring-2 focus:ring-primary/30 outline-none text-body-md"
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
                                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg py-3 px-4 min-h-[48px] focus:ring-2 focus:ring-primary/30 outline-none text-body-md"
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

                                <div>
                                    <label className="block text-caption font-label-md mb-2 text-on-surface-variant uppercase tracking-wider">Gender</label>
                                    <select
                                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg py-3 px-4 min-h-[48px] focus:ring-2 focus:ring-primary/30 outline-none text-body-md"
                                        value={profileGender}
                                        onChange={(e) => setProfileGender(e.target.value)}
                                        required
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowProfileModal(false)}
                                        className="flex-1 py-3 border-2 border-outline-variant/40 rounded-lg font-label-md text-on-surface-variant hover:bg-surface-container transition-all"
                                    >
                                        Later
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 btn-primary-gradient text-white rounded-lg font-label-md shadow-lg shadow-primary/10"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Stat Details Modal */}
            {statModal.isOpen && (
                <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 md:p-5 max-w-lg w-full shadow-2xl border border-outline-variant/20 relative overflow-hidden text-left flex flex-col max-h-[85vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-headline-md font-headline-md text-primary font-bold">{statModal.title}</h3>
                            <button 
                                onClick={() => setStatModal({ isOpen: false, title: '', type: '', data: [] })}
                                className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="flex-grow overflow-y-auto pr-2 no-scrollbar space-y-4">
                            {statModal.data.length === 0 ? (
                                <p className="text-on-surface-variant text-center py-8">No records found.</p>
                            ) : (
                                statModal.data.map((item, idx) => (
                                    <div key={idx} className="p-4 rounded-xl border border-outline-variant/20 bg-surface-container-lowest">
                                        {statModal.type === 'notes' ? (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="font-bold text-primary">{item.name}</span>
                                                    <span className={`text-[10px] font-bold ${item.badgeColor}`}>{item.badge}</span>
                                                </div>
                                                <p className="text-body-md text-on-surface-variant mt-2">{item.note}</p>
                                                <p className="text-caption mt-2 text-on-surface-variant/80">{item.time}</p>
                                            </>
                                        ) : statModal.type === 'requests' ? (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="font-bold text-primary">{item.name}</span>
                                                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{item.status}</span>
                                                </div>
                                                <p className="text-body-md text-on-surface-variant mt-2">{item.condition}</p>
                                                <p className="text-caption mt-2 text-on-surface-variant/80">{item.date} • {item.timeSlot}</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="font-bold text-primary">{item.title}</span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : item.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 'bg-surface-container text-on-surface-variant'}`}>{item.status}</span>
                                                </div>
                                                <p className="text-body-md text-on-surface-variant mt-2">Patient: {item.patient?.fullName || 'Unknown'}</p>
                                                <p className="text-caption mt-2 text-on-surface-variant/80">{item.date ? new Date(item.date).toLocaleDateString() : ''} • {item.timeSlot}</p>
                                            </>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Loader Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-on-surface/30 backdrop-blur-sm z-[100] flex flex-col items-center justify-center gap-4">
                    <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-outline-variant/30 flex flex-col items-center gap-4">
                        <img
                            src="/logo-ent.jpeg"
                            alt="PalmCrest Logo"
                            className="w-16 h-16 rounded-xl shadow-md animate-pulse object-contain"
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
