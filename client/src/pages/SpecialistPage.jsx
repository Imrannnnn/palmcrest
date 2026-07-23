import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SpecialistPage() {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('All');

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await fetch(`${backendUrl}/api/auth/public-doctors`);
                if (res.ok) {
                    const data = await res.json();
                    setDoctors(data);
                } else {
                    console.error('Failed to fetch specialists');
                }
            } catch (err) {
                console.error('Network error fetching specialists:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    // Filter logic
    const filteredDoctors = doctors.filter(doc => {
        const matchesSearch = doc.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (doc.specialization && doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesSpecialty = selectedSpecialty === 'All' || 
            (doc.specialization && doc.specialization.toLowerCase() === selectedSpecialty.toLowerCase());

        return matchesSearch && matchesSpecialty;
    });

    const specialties = ['All', 'Otologist', 'Rhinologist', 'Laryngologist', 'General ENT'];

    return (
        <div className="min-h-screen text-[#191c1e] bg-gradient-to-br from-[#f8fdff] via-white to-[#f4fcff] flex flex-col font-body-md relative overflow-hidden">
            {/* Ambient glows */}
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
            <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-12 md:py-20">
                <div className="text-center max-w-xl mx-auto mb-12">
                    <span className="inline-block text-secondary text-[11px] font-bold uppercase tracking-[0.22em] mb-3">Our Clinical Team</span>
                    <h1 className="font-display text-4xl sm:text-5xl font-bold text-primary mb-4">Meet Our Board-Certified Specialists</h1>
                    <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed">
                        Leading otolaryngologists dedicated to diagnosing, treating, and restoring your ear, nose, throat, and hearing health.
                    </p>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-outline-variant/20 shadow-sm mb-12 flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Search */}
                    <div className="relative w-full md:w-80">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                        <input
                            type="text"
                            placeholder="Search by name or specialty..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl py-3 pl-12 pr-4 min-h-[48px] focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
                        />
                    </div>

                    {/* Specialties Tabs */}
                    <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
                        {specialties.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setSelectedSpecialty(tab)}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                                    selectedSpecialty.toLowerCase() === tab.toLowerCase()
                                        ? 'bg-primary text-white border-primary shadow-md'
                                        : 'bg-white hover:bg-primary/5 text-on-surface-variant border-outline-variant/20'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading state */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-on-surface-variant text-sm font-medium">Retrieving specialist directory...</p>
                    </div>
                ) : filteredDoctors.length === 0 ? (
                    <div className="text-center py-20 bg-white/30 rounded-3xl border border-dashed border-outline-variant/30">
                        <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40 mb-3">clinical_notes</span>
                        <h3 className="font-bold text-primary text-lg">No Specialists Found</h3>
                        <p className="text-on-surface-variant text-sm mt-1">Try adjusting your filters or search keywords.</p>
                    </div>
                ) : (
                    /* Doctors Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDoctors.map(doc => {
                            const isFemale = doc.gender === 'Female';
                            const avatarChar = doc.fullName.charAt(0);
                            return (
                                <div 
                                    key={doc._id}
                                    className="group bg-white rounded-3xl border border-outline-variant/20 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Avatar area with professional background */}
                                        <div className="relative aspect-[4/3] bg-gradient-to-tr from-primary/10 to-secondary/10 flex items-center justify-center overflow-hidden">
                                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center text-primary font-display text-4xl font-bold border-2 border-primary/20 transform group-hover:scale-105 transition-transform duration-300">
                                                {avatarChar}
                                            </div>
                                            <div className="absolute bottom-4 left-4">
                                                <span className="inline-block bg-white/90 backdrop-blur-md text-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm border border-outline-variant/10">
                                                    {doc.specialization || 'ENT Specialist'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="p-6 space-y-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-primary leading-tight">Dr. {doc.fullName}</h3>
                                                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mt-1">
                                                    {isFemale ? 'Female Physician' : 'Male Physician'}
                                                </p>
                                            </div>
                                            
                                            <div className="space-y-2 text-sm text-on-surface-variant border-t border-outline-variant/10 pt-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-[18px] text-primary">mail</span>
                                                    <span className="break-all">{doc.email}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-[18px] text-primary">call</span>
                                                    <span>{doc.phoneNumber || '+234 805 691 3057'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action button */}
                                    <div className="p-6 pt-0">
                                        <button 
                                            onClick={() => navigate('/portal')}
                                            className="w-full py-3 bg-primary/5 hover:bg-primary hover:text-white text-primary font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                            Book Consultation
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="py-6 border-t border-outline-variant/10 text-center bg-white mt-20">
                <p className="text-xs text-on-surface-variant">© 2026 PalmCrest ENT Hospital. Advanced Sanctuary of Care.</p>
            </footer>
        </div>
    );
}
