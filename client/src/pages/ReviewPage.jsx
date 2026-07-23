import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ReviewPage() {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    
    const [apptInfo, setApptInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comments, setComments] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchAppointmentInfo = async () => {
            try {
                const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await fetch(`${backendUrl}/api/reviews/appointment/${appointmentId}`);
                if (res.ok) {
                    const data = await res.json();
                    setApptInfo(data);
                } else {
                    const errData = await res.json();
                    setError(errData.message || 'Failed to retrieve appointment information.');
                }
            } catch (err) {
                console.error(err);
                setError('Network error loading review page.');
            } finally {
                setLoading(false);
            }
        };
        
        if (appointmentId) {
            fetchAppointmentInfo();
        } else {
            setError('Invalid appointment link.');
            setLoading(false);
        }
    }, [appointmentId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comments.trim()) return alert('Please enter your comments');
        
        setSubmitting(true);
        try {
            const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await fetch(`${backendUrl}/api/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    appointmentId,
                    rating,
                    comments
                })
            });

            if (res.ok) {
                setSubmitted(true);
            } else {
                const errData = await res.json();
                alert(errData.message || 'Failed to submit review');
            }
        } catch (err) {
            console.error(err);
            alert('Network error submitting review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen text-[#191c1e] bg-gradient-to-br from-[#fcfcff] via-white to-[#f5fbfd] flex flex-col font-body-md relative overflow-hidden">
            {/* Ambient Background Blur */}
            <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Header */}
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
                        <span className="material-symbols-outlined text-[18px]">home</span>
                        Go Home
                    </button>
                </div>
            </nav>

            {/* Content Body */}
            <main className="flex-1 max-w-[600px] w-full mx-auto px-6 py-12 md:py-20 flex flex-col justify-center">
                {loading ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-20 bg-white/50 border border-outline-variant/20 rounded-3xl backdrop-blur-md shadow-sm">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-on-surface-variant text-sm font-medium">Loading clinical appointment info...</p>
                    </div>
                ) : error ? (
                    <div className="text-center p-8 bg-white border border-outline-variant/30 rounded-3xl shadow-lg">
                        <span className="material-symbols-outlined text-error text-[48px] mb-4">error</span>
                        <h2 className="text-xl font-bold text-primary">Unable to Leave Review</h2>
                        <p className="text-on-surface-variant mt-2 text-sm">{error}</p>
                        <button 
                            onClick={() => navigate('/')}
                            className="mt-6 px-6 py-3 btn-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md"
                        >
                            Back to Home
                        </button>
                    </div>
                ) : submitted ? (
                    <div className="text-center p-8 bg-white border border-outline-variant/30 rounded-3xl shadow-2xl space-y-6">
                        <div className="w-20 h-20 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto">
                            <span className="material-symbols-outlined text-[48px]">check_circle</span>
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-display font-bold text-primary">Review Submitted!</h2>
                            <p className="text-on-surface-variant text-sm mt-2 max-w-sm mx-auto leading-relaxed">
                                Thank you for sharing your experience, {apptInfo.patientName}. Your feedback helps us maintain the highest standard of otolaryngology care.
                            </p>
                        </div>
                        <button 
                            onClick={() => navigate('/')}
                            className="w-full py-4 btn-primary text-white rounded-xl text-sm font-bold uppercase tracking-wider shadow-md"
                        >
                            Return to Homepage
                        </button>
                    </div>
                ) : apptInfo.alreadyReviewed ? (
                    <div className="text-center p-8 bg-white border border-outline-variant/30 rounded-3xl shadow-xl space-y-6">
                        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                            <span className="material-symbols-outlined text-[48px]">rate_review</span>
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-display font-bold text-primary">Already Reviewed</h2>
                            <p className="text-on-surface-variant text-sm mt-2 max-w-sm mx-auto leading-relaxed">
                                You have already submitted feedback for your appointment with Dr. {apptInfo.doctorName} on {new Date(apptInfo.date).toDateString()}.
                            </p>
                        </div>
                        <button 
                            onClick={() => navigate('/')}
                            className="w-full py-4 btn-primary text-white rounded-xl text-sm font-bold tracking-wider uppercase"
                        >
                            Go to Homepage
                        </button>
                    </div>
                ) : (
                    /* Review Form */
                    <form 
                        onSubmit={handleSubmit}
                        className="bg-white border border-outline-variant/20 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md space-y-6"
                    >
                        <div className="text-center mb-6">
                            <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">Leave a Review</h1>
                            <p className="text-xs text-on-surface-variant mt-1 uppercase tracking-wider font-semibold">Post-Appointment Consultation Feedback</p>
                        </div>

                        {/* Consultation Details Box */}
                        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10 text-sm space-y-2">
                            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Consultation Details</p>
                            <p className="text-on-surface-variant"><strong className="text-primary">Specialist:</strong> Dr. {apptInfo.doctorName}</p>
                            <p className="text-on-surface-variant"><strong className="text-primary">Patient:</strong> {apptInfo.patientName}</p>
                            <p className="text-on-surface-variant">
                                <strong className="text-primary">Date:</strong> {new Date(apptInfo.date).toDateString()} | {apptInfo.timeSlot}
                            </p>
                            <p className="text-on-surface-variant"><strong className="text-primary">Reason:</strong> {apptInfo.title}</p>
                        </div>

                        {/* Rating selector */}
                        <div className="space-y-2 text-center">
                            <label className="block text-caption font-label-md text-on-surface-variant uppercase tracking-wider">How would you rate your visit?</label>
                            <div className="flex justify-center gap-2 mt-2">
                                {[1, 2, 3, 4, 5].map((star) => {
                                    const isActive = (hoverRating || rating) >= star;
                                    return (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="focus:outline-none hover:scale-125 transition-transform"
                                            aria-label={`${star} Star Rating`}
                                        >
                                            <span 
                                                className={`material-symbols-outlined text-[36px] ${isActive ? 'text-amber-400' : 'text-outline-variant/45'}`}
                                                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                                            >
                                                star
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Review Input */}
                        <div className="space-y-2">
                            <label className="block text-caption font-label-md text-on-surface-variant uppercase tracking-wider">Share your experience</label>
                            <textarea
                                required
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder="Write your review here... How was the diagnosis, bedside manner, and overall hospitality?"
                                rows="4"
                                className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
                            ></textarea>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-4 btn-primary text-white rounded-xl font-bold tracking-wider uppercase text-sm shadow-lg disabled:opacity-50 transition-opacity"
                        >
                            {submitting ? 'Submitting Review...' : 'Submit Review'}
                        </button>
                    </form>
                )}
            </main>

            {/* Footer */}
            <footer className="py-6 border-t border-outline-variant/10 text-center bg-white mt-12">
                <p className="text-xs text-on-surface-variant">© 2026 PalmCrest ENT Hospital. Advanced Sanctuary of Care.</p>
            </footer>
        </div>
    );
}
