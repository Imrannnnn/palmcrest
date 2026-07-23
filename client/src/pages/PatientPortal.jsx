import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const isAppointmentPast = (dateStr, timeSlot) => {
    if (!dateStr) return false;
    
    const str = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const [year, month, day] = str.split('-');
    const apptDate = new Date(year, month - 1, day);
    
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

// Safely parse date string to local date, ignoring timezones
const parseLocalDate = (dateString) => {
    if (!dateString) return new Date();
    const str = dateString.includes('T') ? dateString.split('T')[0] : dateString;
    const [year, month, day] = str.split('-');
    return new Date(year, month - 1, day);
};

export default function PatientPortal() {
    const navigate = useNavigate();
    const todayLocal = new Date();
    const todayStr = `${todayLocal.getFullYear()}-${String(todayLocal.getMonth() + 1).padStart(2, '0')}-${String(todayLocal.getDate()).padStart(2, '0')}`;

    // Sidebar state
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

    // Tab state
    const [activeTab, setActiveTab] = useState('dashboard');
    const [user, setUser] = useState(() => {
        const u = localStorage.getItem('user');
        return u ? JSON.parse(u) : null;
    });

    // Booking state
    const [doctors, setDoctors] = useState([]);
    const [specialist, setSpecialist] = useState('');
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('09:00 AM');
    const [bookingReason, setBookingReason] = useState('Clinical Consultation');
    const [customReason, setCustomReason] = useState('');
    const [bookings, setBookings] = useState([]);

    // Profile Update Modal state
    const [showProfileModal, setShowProfileModal] = useState(() => {
        if (!user) return false;
        const isPhoneMissing = !user.phoneNumber;
        const isDobMissing = !user.dateOfBirth;
        const isGenderMissing = user.gender !== 'Male' && user.gender !== 'Female';
        return isPhoneMissing || isDobMissing || isGenderMissing;
    });
    const [profilePhone, setProfilePhone] = useState(() => {
        return user?.phoneNumber || '';
    });
    const [profileDob, setProfileDob] = useState(() => {
        if (!user?.dateOfBirth) return '';
        try {
            return new Date(user.dateOfBirth).toISOString().split('T')[0];
        } catch {
            return '';
        }
    });
    const [profileGender, setProfileGender] = useState(() => {
        if (!user) return 'Male';
        const isGenderMissing = user.gender !== 'Male' && user.gender !== 'Female';
        return isGenderMissing ? 'Male' : user.gender;
    });

    // Loader state
    const [isLoading, setIsLoading] = useState(false);

    // Notifications state
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notes, setNotes] = useState([]);

    const toggleNotifications = () => {
        setIsNotificationsOpen(!isNotificationsOpen);
    };

    const fetchNotes = async () => {
        try {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            if (!storedUser) return;
            const parsedUser = JSON.parse(storedUser);
            const response = await fetch(`/api/notes/patient/${parsedUser._id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setNotes(data);
            }
        } catch (err) {
            console.error('Failed to fetch patient notes:', err);
        }
    };

    const getLiveNotifications = () => {
        const list = [];

        // 1. Bookings notifications
        bookings.forEach(appt => {
            let statusText = '';
            let icon = 'calendar_today';
            let badgeColor = 'border-l-primary bg-primary/5 text-primary';

            if (appt.status === 'Pending') {
                statusText = 'Awaiting confirmation';
                badgeColor = 'border-l-amber-400 bg-amber-500/5 text-amber-800';
            } else if (appt.status === 'Approved') {
                statusText = 'Confirmed & Scheduled';
                icon = 'check_circle';
                badgeColor = 'border-l-emerald-500 bg-emerald-500/5 text-emerald-800';
            } else if (appt.status === 'Cancelled') {
                statusText = 'Cancelled';
                icon = 'cancel';
                badgeColor = 'border-l-rose-500 bg-rose-500/5 text-rose-800';
            } else if (appt.status === 'Completed') {
                statusText = 'Completed';
                icon = 'task_alt';
                badgeColor = 'border-l-blue-500 bg-blue-500/5 text-blue-800';
            }

            list.push({
                id: `appt-${appt.id}`,
                type: 'appt',
                title: appt.title,
                message: `${appt.title} is ${statusText}.`,
                time: appt.date,
                icon: icon,
                badgeColor: badgeColor
            });
        });

        // 2. Clinical Notes notifications
        notes.forEach(note => {
            const formattedDate = new Date(note.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            list.push({
                id: `note-${note._id}`,
                type: 'note',
                title: `Clinical Record Update`,
                message: `New observation: "${note.note.substring(0, 55)}${note.note.length > 55 ? '...' : ''}"`,
                time: formattedDate,
                icon: 'history_edu',
                badgeColor: note.priority === 'Urgent'
                    ? 'border-l-rose-500 bg-rose-500/5 text-rose-800'
                    : 'border-l-secondary bg-secondary/5 text-secondary'
            });
        });

        return list;
    };

    const getUpcomingAppointment = () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const upcoming = bookings.filter(b => {
            if (b.status === 'Completed' || b.status === 'Cancelled') return false;
            const dateStr = b.date.split(' • ')[0]; // wait, b.date here might be the already formatted string? No, b.date is from bookings, which is transformed in fetchAppointments.
            // Wait, fetchAppointments maps `date` to `formattedDate` and stores it back as `date: formattedDate`.
            // So b.date IS actually already formatted! e.g., "Jul 3, 2026"
            const apptDate = new Date(dateStr); 
            return apptDate >= today;
        });

        return upcoming.length > 0 ? upcoming[0] : null;
    };

    // Live Concierge Chat state
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState([
        { id: 1, sender: 'agent', text: 'Hello Johnathan! How can I assist with your appointment today?' }
    ]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-100 text-emerald-800';
            case 'Approved': return 'bg-blue-100 text-blue-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-surface-container text-on-surface';
        }
    };

    const getBgClass = (type) => {
        return type === 'Surgery' ? 'bg-secondary-fixed' : 'bg-primary-fixed';
    };

    const getIcon = (title) => {
        const t = title.toLowerCase();
        if (t.includes('hearing') || t.includes('audiology') || t.includes('tympanometry')) return 'hearing';
        if (t.includes('surgery') || t.includes('septoplasty')) return 'medical_services';
        return 'stethoscope';
    };

    const getIconColor = (type) => {
        return type === 'Surgery' ? 'text-secondary' : 'text-primary';
    };

    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/appointments', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                const transformed = data.map(appt => {
                    const formattedDate = parseLocalDate(appt.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    });

                    let displayStatus = appt.status;
                    if (appt.status === 'Approved' && isAppointmentPast(appt.date, appt.timeSlot)) {
                        displayStatus = 'Completed';
                    }

                    return {
                        id: appt._id,
                        title: appt.title,
                        date: `${formattedDate} • ${appt.timeSlot}`,
                        status: displayStatus,
                        statusColor: getStatusColor(displayStatus),
                        bgClass: getBgClass(appt.type),
                        icon: getIcon(appt.title),
                        iconColor: getIconColor(appt.type)
                    };
                });
                setBookings(transformed);
            }
        } catch (err) {
            console.error('Failed to fetch appointments:', err);
        }
    };

    const fetchDoctors = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/doctors', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setDoctors(data);
                if (data.length > 0) {
                    setSpecialist(data[0]._id);
                }
            }
        } catch (err) {
            console.error('Failed to fetch doctors:', err);
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
        if (parsedUser.role !== 'patient') {
            localStorage.clear();
            navigate('/portal');
            return;
        }

        // Profile verification details check is handled synchronously during state initialization

        Promise.resolve().then(() => {
            fetchDoctors();
            fetchAppointments();
            fetchNotes();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]);

    const handleBookNow = async (e) => {
        e.preventDefault();
        if (!bookingDate) return alert('Please select a date.');
        if (bookingDate < todayStr) {
            return alert("You cannot book an appointment for a past date. Please select today's date or a future date.");
        }
        if (isAppointmentPast(bookingDate, bookingTime)) {
            return alert("You cannot book an appointment for a time slot that has already passed today. Please select a future time slot.");
        }
        if (!specialist) return alert('Please select a doctor.');

        let titleToBook = bookingReason;
        if (bookingReason === 'Other (Specify below...)') {
            if (!customReason.trim()) {
                return alert('Please specify your reason for the appointment.');
            }
            titleToBook = customReason.trim();
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    doctor: specialist,
                    title: titleToBook,
                    date: bookingDate,
                    timeSlot: bookingTime,
                    type: 'Appointment'
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                alert(errData.message || 'Failed to book appointment.');
                return;
            }

            setBookingDate('');
            setBookingTime('09:00 AM');
            setBookingReason('Clinical Consultation');
            setCustomReason('');
            alert('Appointment request submitted successfully!');
            fetchAppointments();
        } catch (err) {
            console.error('Error booking appointment:', err);
            alert('Network error booking appointment.');
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
                    dateOfBirth: profileDob,
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

    const handleRequestSurgery = async () => {
        if (!specialist) {
            alert('Please select a specialist first in the booking section.');
            return;
        }
        const title = prompt("Enter requested surgery procedure name:", "Septoplasty");
        if (!title) return;
        const date = prompt("Enter preferred surgery date (YYYY-MM-DD):", todayStr);
        if (!date) return;
        if (date < todayStr) {
            alert("You cannot request surgery for a past date. Please select today's date or a future date.");
            return;
        }
        const time = prompt("Enter preferred surgery time (e.g. 08:30 AM):", "08:30 AM");
        if (!time) return;
        if (isAppointmentPast(date, time)) {
            alert("You cannot request surgery for a time slot that has already passed today. Please select a future time slot.");
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    doctor: specialist,
                    title: title,
                    date: date,
                    timeSlot: time,
                    type: 'Surgery'
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                alert(errData.message || 'Failed to submit surgery request.');
                return;
            }

            alert('Surgery request submitted successfully!');
            fetchAppointments();
        } catch (err) {
            console.error(err);
            alert('Network error submitting surgery request.');
        } finally {
            setIsLoading(false);
        }
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
        localStorage.clear();
        navigate('/portal');
    };

    const handleEmergencyPortal = () => {
        alert('Connecting to 24/7 Priority Emergency Team at +234 805 691 3057.');
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
                    <div className="mb-8 flex items-center gap-3">
                        <img
                            alt="PalmCrest ENT Logo"
                            className="h-10 w-auto object-contain shadow-sm rounded-lg"
                            src="/logo-ent.jpeg"
                        />
                        <div>
                            <h1 className="text-headline-sm font-headline-md text-primary leading-tight">PalmCrest ENT</h1>
                            <p className="text-caption text-on-surface-variant">Clinical Excellence</p>
                        </div>
                    </div>
                    <nav className="flex-1 space-y-2">
                        <button
                            onClick={() => { setActiveTab('dashboard'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg font-bold transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-white/70 backdrop-blur-md text-primary' : 'text-on-surface-variant hover:translate-x-1 hover:bg-secondary-container/10'}`}
                        >
                            <span className="material-symbols-outlined" style={activeTab === 'dashboard' ? { fontVariationSettings: "'FILL' 1" } : {}}>dashboard</span>
                            <span className="font-label-md tracking-[0.05em]">Dashboard</span>
                        </button>

                        <button
                            onClick={() => { setActiveTab('appointments'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg font-bold transition-all duration-300 ${activeTab === 'appointments' ? 'bg-white/70 backdrop-blur-md text-primary' : 'text-on-surface-variant hover:translate-x-1 hover:bg-secondary-container/10'}`}
                        >
                            <span className="material-symbols-outlined" style={activeTab === 'appointments' ? { fontVariationSettings: "'FILL' 1" } : {}}>calendar_today</span>
                            <span className="font-label-md tracking-[0.05em]">Appointments</span>
                        </button>

                        <a className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:translate-x-1 transition-transform hover:bg-secondary-container/10 rounded-lg" href="#">
                            <span className="material-symbols-outlined">settings</span>
                            <span className="font-label-md tracking-[0.05em]">Settings</span>
                        </a>
                    </nav>
                    <div className="mt-auto space-y-4">
                        <button
                            onClick={handleEmergencyPortal}
                            className="w-full btn-primary-gradient text-white py-3 px-4 rounded-lg font-label-md flex items-center justify-center gap-2"
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
                                    className="p-2 min-w-[44px] min-h-[44px] rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-primary flex items-center justify-center shadow-sm"
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
                                <button 
                                    onClick={toggleNotifications}
                                    className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-surface-container transition-colors relative"
                                >
                                    <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
                                    {getLiveNotifications().length > 0 && (
                                        <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full"></span>
                                    )}
                                </button>
                                <div className="flex items-center gap-3 ml-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="font-label-md text-primary">{user?.fullName || 'Patient'}</p>
                                        <p className="text-caption text-on-surface-variant">Patient ID: {user?.patientId || '#PC-8821'}</p>
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
                        </div>
                    </header>

                    <div className="pt-20 px-4 md:px-margin-desktop pb-8 max-w-container-max mx-auto">
                        {/* Hero Greeting Banner */}
                        <section className="mb-6">
                            <div className="relative bg-[#2A7B4C] rounded-xl p-6 md:px-6 md:py-6 overflow-hidden flex items-center justify-between shadow-md">
                                {/* Decorative concentric circles */}
                                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[400px] h-[400px] border-[40px] border-white/10 rounded-full pointer-events-none -ml-32"></div>
                                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[250px] h-[250px] border-[30px] border-white/5 rounded-full pointer-events-none -ml-16"></div>

                                <div className="relative z-10 w-full md:w-2/3">
                                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Welcome back, {user?.fullName ? user.fullName.split(' ')[0] : 'Patient'}.</h3>
                                    {getUpcomingAppointment() ? (
                                        <p className="text-sm md:text-base text-white/90 max-w-2xl">Your health journey is our priority. You have an upcoming consultation: {getUpcomingAppointment().title} on {getUpcomingAppointment().date}.</p>
                                    ) : (
                                        <p className="text-sm md:text-base text-white/90 max-w-2xl">Your health journey is our priority. You have no upcoming appointments scheduled.</p>
                                    )}
                                </div>

                                {/* Decorative people image on the right */}
                                <div className="hidden md:block absolute right-0 bottom-0 top-0 w-1/3 pointer-events-none">
                                    <img src="/ent_hero.png" alt="" className="w-full h-full object-cover object-right-top opacity-90" style={{ WebkitMaskImage: 'linear-gradient(to left, black 40%, transparent 100%)', maskImage: 'linear-gradient(to left, black 40%, transparent 100%)' }} />
                                </div>
                            </div>
                        </section>

                        {/* Grid Layout */}
                        {activeTab === 'dashboard' && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-gutter">
                                {/* Left Column: Summary & Quick Actions */}
                                <div className="lg:col-span-8 space-y-6 md:space-y-gutter">
                                    {/* Upcoming Appointment Summary */}
                                    <div className="glass-card rounded-2xl p-6 md:p-stack-md relative overflow-hidden border-l-4 border-secondary">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-headline-sm md:text-headline-md font-headline-md text-primary flex items-center gap-2">
                                                <span className="material-symbols-outlined text-secondary">event_available</span>
                                                Upcoming Appointment
                                            </h4>
                                            <button onClick={() => setActiveTab('appointments')} className="text-secondary font-label-md hover:underline">Manage</button>
                                        </div>
                                        {getUpcomingAppointment() ? (
                                            <div className="flex items-center gap-4 p-4 bg-white/40 rounded-xl border border-white/60">
                                                <div className={`w-12 h-12 ${getUpcomingAppointment().bgClass} rounded-lg flex items-center justify-center ${getUpcomingAppointment().iconColor}`}>
                                                    <span className="material-symbols-outlined">{getUpcomingAppointment().icon}</span>
                                                </div>
                                                <div>
                                                    <p className="font-label-md text-primary">{getUpcomingAppointment().title}</p>
                                                    <p className="text-caption text-on-surface-variant">{getUpcomingAppointment().date}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-body-md text-on-surface-variant">No upcoming appointment there.</p>
                                        )}
                                    </div>

                                    {/* Surgery Request Card */}
                                    <div className="bg-primary text-white rounded-2xl p-6 md:p-stack-md shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary rounded-full blur-[60px] opacity-20 -mr-16 -mt-16"></div>
                                        <h4 className="text-headline-sm md:text-headline-md font-headline-md mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-secondary-fixed">medical_services</span>
                                            Surgery Request
                                        </h4>
                                        <p className="text-body-md text-on-primary-container mb-6">Need to schedule a procedure? Submit a fast-track request for our surgical team.</p>
                                        <div className="space-y-4">
                                            <div className="bg-white/10 p-4 rounded-lg border border-white/10 text-left">
                                                <p className="text-caption font-label-md text-secondary-fixed mb-1">Fast Track Process</p>
                                                <p className="text-body-md text-white/90">Typical review time: 24-48 hours</p>
                                            </div>
                                            <button 
                                                onClick={handleRequestSurgery}
                                                className="w-full bg-white text-primary py-3 rounded-lg font-label-md hover:bg-secondary-fixed transition-colors"
                                            >
                                                Start Request
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Support & Tips */}
                                <div className="lg:col-span-4 space-y-6 md:space-y-gutter">
                                    {/* Chat Support */}
                                    <div className="glass-card rounded-2xl p-6 md:p-stack-md border-t-4 border-t-secondary">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="relative">
                                                <img
                                                    alt="Support Agent"
                                                    className="w-12 h-12 rounded-full bg-secondary-container object-cover"
                                                    src="/5p.jpeg"
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
                                                    className={`p-3 rounded-xl text-body-md ${msg.sender === 'user'
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
                                    <div className="p-6 bg-tertiary-container rounded-2xl text-on-tertiary">
                                        <span className="material-symbols-outlined text-tertiary-fixed text-3xl mb-4">lightbulb</span>
                                        <h5 className="font-headline-md mb-2 text-white">Winter ENT Care</h5>
                                        <p className="text-body-md text-white/80 mb-4">Keep indoor humidity between 30% and 50% to prevent dry nasal passages during the colder months.</p>
                                        <a className="text-tertiary-fixed font-label-md flex items-center gap-1 hover:gap-2 transition-all" href="#">
                                            Learn more <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'appointments' && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-gutter">
                                <div className="lg:col-span-12 space-y-6 md:space-y-gutter">
                                    {/* Book Appointment Widget */}
                                    <div className="glass-card rounded-2xl p-6 md:p-stack-md">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="text-headline-sm md:text-headline-md font-headline-md text-primary flex items-center gap-2">
                                                <span className="material-symbols-outlined text-secondary">add_task</span>
                                                Book New Appointment
                                            </h4>
                                        </div>
                                        <form onSubmit={handleBookNow} className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-stack-sm">
                                                <div>
                                                    <label className="block text-caption font-label-md mb-2 text-on-surface-variant uppercase tracking-wider">Select Specialist</label>
                                                    <select
                                                        value={specialist}
                                                        onChange={(e) => setSpecialist(e.target.value)}
                                                        className="w-full bg-white/50 border border-outline-variant/20 rounded-lg py-3 px-4 min-h-[48px] focus:ring-2 focus:ring-secondary/50 outline-none text-body-md"
                                                    >
                                                        {doctors.map(doc => (
                                                            <option key={doc._id} value={doc._id}>
                                                                {doc.fullName} ({doc.specialization})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-caption font-label-md mb-2 text-on-surface-variant uppercase tracking-wider">Preferred Date</label>
                                                    <input
                                                        className="w-full bg-white/50 border border-outline-variant/20 rounded-lg py-3 px-4 min-h-[48px] focus:ring-2 focus:ring-secondary/50 outline-none text-body-md"
                                                        type="date"
                                                        value={bookingDate}
                                                        min={todayStr}
                                                        onChange={(e) => setBookingDate(e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-caption font-label-md mb-2 text-on-surface-variant uppercase tracking-wider">Preferred Time</label>
                                                    <select
                                                        value={bookingTime}
                                                        onChange={(e) => setBookingTime(e.target.value)}
                                                        className="w-full bg-white/50 border border-outline-variant/20 rounded-lg py-3 px-4 min-h-[48px] focus:ring-2 focus:ring-secondary/50 outline-none text-body-md"
                                                    >
                                                        <option value="08:00 AM">08:00 AM</option>
                                                        <option value="08:30 AM">08:30 AM</option>
                                                        <option value="09:00 AM">09:00 AM</option>
                                                        <option value="09:30 AM">09:30 AM</option>
                                                        <option value="10:00 AM">10:00 AM</option>
                                                        <option value="10:30 AM">10:30 AM</option>
                                                        <option value="11:00 AM">11:00 AM</option>
                                                        <option value="11:30 AM">11:30 AM</option>
                                                        <option value="12:00 PM">12:00 PM</option>
                                                        <option value="12:30 PM">12:30 PM</option>
                                                        <option value="01:00 PM">01:00 PM</option>
                                                        <option value="01:30 PM">01:30 PM</option>
                                                        <option value="02:00 PM">02:00 PM</option>
                                                        <option value="02:30 PM">02:30 PM</option>
                                                        <option value="03:00 PM">03:00 PM</option>
                                                        <option value="03:30 PM">03:30 PM</option>
                                                        <option value="04:00 PM">04:00 PM</option>
                                                        <option value="04:30 PM">04:30 PM</option>
                                                        <option value="05:00 PM">05:00 PM</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-caption font-label-md mb-2 text-on-surface-variant uppercase tracking-wider">Reason for Appointment</label>
                                                    <select
                                                        value={bookingReason}
                                                        onChange={(e) => setBookingReason(e.target.value)}
                                                        className="w-full bg-white/50 border border-outline-variant/20 rounded-lg py-3 px-4 min-h-[48px] focus:ring-2 focus:ring-secondary/50 outline-none text-body-md"
                                                    >
                                                        <option value="Clinical Consultation">Clinical Consultation</option>
                                                        <option value="Ear Ache / Infection">Ear Ache / Infection</option>
                                                        <option value="Nasal Congestion / Allergy">Nasal Congestion / Allergy</option>
                                                        <option value="Hearing Evaluation">Hearing Evaluation</option>
                                                        <option value="Throat Pain / Tonsils">Throat Pain / Tonsils</option>
                                                        <option value="Other (Specify below...)">Other (Specify below...)</option>
                                                    </select>
                                                </div>
                                            </div>
                                            {bookingReason === 'Other (Specify below...)' && (
                                                <div className="transition-all duration-300">
                                                    <label className="block text-caption font-label-md mb-2 text-on-surface-variant uppercase tracking-wider">Specify Custom Reason</label>
                                                    <input
                                                        className="w-full bg-white/50 border border-outline-variant/20 rounded-lg py-3 px-4 min-h-[48px] focus:ring-2 focus:ring-secondary/50 outline-none text-body-md"
                                                        type="text"
                                                        placeholder="E.g., Difficulty swallowing, ear ringing, sinus pressure..."
                                                        value={customReason}
                                                        onChange={(e) => setCustomReason(e.target.value)}
                                                    />
                                                </div>
                                            )}
                                            <div className="flex justify-end pt-2">
                                                <button
                                                    className="w-full sm:w-auto px-5 py-2 btn-primary-gradient text-white rounded-lg font-label-md shadow-lg shadow-primary/10"
                                                    type="submit"
                                                >
                                                    Book Now
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                    {/* Booking History List */}
                                    <div className="glass-card rounded-2xl p-6 md:p-stack-md overflow-hidden">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="text-headline-sm md:text-headline-md font-headline-md text-primary">All Appointments</h4>
                                        </div>
                                        <div className="space-y-4">
                                            {bookings.map((b) => (
                                                <div
                                                    key={b.id}
                                                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white/40 rounded-xl border border-white/60 hover:bg-white/60 transition-colors gap-4"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 ${b.bgClass} rounded-lg flex items-center justify-center ${b.iconColor}`}>
                                                            <span className="material-symbols-outlined">{b.icon}</span>
                                                        </div>
                                                        <div className="flex-grow min-w-0">
                                                            <h4 className="font-label-md text-body-md font-bold text-on-surface truncate">
                                                                {b.title}
                                                            </h4>
                                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-caption text-on-surface-variant">
                                                                <div className="flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-[14px]">event</span>
                                                                    <span>{parseLocalDate(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-caption font-label-md ${b.statusColor}`}>{b.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <footer className="w-full py-12 bg-surface-container-lowest border-t border-outline-variant/30 mt-stack-lg">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-gutter px-6 md:px-margin-desktop max-w-container-max mx-auto">
                            <div className="col-span-1 md:col-span-1">
                                <h2 className="text-headline-sm font-headline-md text-primary mb-2">PalmCrest ENT</h2>
                                <p className="text-caption text-on-surface-variant mb-4">Advanced Sanctuary of Care.</p>
                                <div className="flex gap-3">
                                    <a href="https://www.facebook.com/share/1JdiM6CWBq/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-secondary transition-colors" aria-label="Facebook">
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                            <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                                        </svg>
                                    </a>
                                    <a href="https://www.tiktok.com/@palmcrest.ent.spe?_r=1&_t=ZS-97fnezTeyua" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-secondary transition-colors" aria-label="TikTok">
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.8 1 1.89 1.73 3.11 2.14v3.83c-1.46-.07-2.88-.63-4.04-1.57-.42-.34-.78-.73-1.1-1.16v6.4c.03 2.14-.65 4.31-2.03 5.92-1.6 1.86-4.06 2.94-6.52 2.87-2.6-.08-5.11-1.43-6.52-3.66-1.52-2.39-1.57-5.56-.16-8 1.34-2.35 3.84-3.86 6.55-3.95v3.87c-1.28.1-2.48.83-3.13 1.94-.71 1.22-.64 2.89.2 4.02.83 1.12 2.27 1.76 3.66 1.55 1.48-.22 2.68-1.52 2.89-3v-12.2c.01-1.34 0-2.68.01-4.02z"/>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                            <div>
                                <h5 className="font-label-md text-primary mb-4">Contact</h5>
                                <ul className="space-y-2">
                                    <li><a className="text-on-surface-variant text-body-md hover:text-primary transition-all" href="/emergency">Emergency: +234 805 691 3057</a></li>
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
                            <p className="text-caption text-on-surface-variant">© 2026 PalmCrest ENT Hospital. Advanced Sanctuary of Care.</p>
                        </div>
                    </footer>

                    {/* Notification Center Overlay */}
                    <div
                        className={`fixed right-0 top-0 h-full w-[85%] sm:w-[400px] bg-white/95 backdrop-blur-3xl shadow-2xl z-50 transform transition-transform duration-500 ease-smooth border-l border-outline-variant/30 ${isNotificationsOpen ? 'translate-x-0' : 'translate-x-full'
                            }`}
                        id="notification-center"
                    >
                        <div className="p-6 md:p-5 h-full flex flex-col text-left">
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
                                                    <span className="material-symbols-outlined text-[12px]">schedule</span>
                                                    {notif.time}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-on-surface-variant/50 gap-2 py-12">
                                        <span className="material-symbols-outlined text-3xl">notifications_off</span>
                                        <p className="text-body-md font-label-md">No current activity notifications</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Profile Update Modal */}
                    {showProfileModal && (
                        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl p-6 md:p-5 max-w-md w-full shadow-2xl border border-outline-variant/20 relative overflow-hidden text-left">
                                {/* Decorative background blob */}
                                <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] bg-primary/10 rounded-full blur-xl pointer-events-none"></div>
                                
                                <div className="relative z-10 flex flex-col gap-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined">account_box</span>
                                        </div>
                                        <div>
                                            <h3 className="text-headline-md font-headline-md text-primary font-bold">Complete Profile</h3>
                                            <p className="text-caption text-on-surface-variant font-label-md">Clinical Record Verification</p>
                                        </div>
                                    </div>
                                    
                                    <p className="text-body-md text-on-surface-variant">
                                        Please take a moment to update your contact and clinical details to complete your patient file.
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
                                            <label className="block text-caption font-label-md mb-2 text-on-surface-variant uppercase tracking-wider">Date of Birth</label>
                                            <input
                                                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg py-3 px-4 min-h-[48px] focus:ring-2 focus:ring-primary/30 outline-none text-body-md"
                                                type="date"
                                                value={profileDob}
                                                onChange={(e) => setProfileDob(e.target.value)}
                                                required
                                            />
                                        </div>

                                        {(!user?.gender || (user?.gender !== 'Male' && user?.gender !== 'Female')) && (
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
                                        )}
                                        
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
                </main>
        </div>
    );
}
