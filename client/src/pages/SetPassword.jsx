import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function SetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`/api/auth/admin/setup-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await res.json();
            
            if (res.ok) {
                alert(data.message || 'Password set successfully! Please log in.');
                navigate('/login');
            } else {
                setError(data.message || 'Failed to set password. Token might be expired.');
            }
        } catch (err) {
            console.error('Setup password error:', err);
            setError('A network error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-container flex flex-col justify-center items-center p-4">
            <div className="glass-card rounded-2xl w-full max-w-md p-8 shadow-lg">
                <div className="text-center mb-8">
                    <span className="material-symbols-outlined text-5xl text-primary mb-2">lock_reset</span>
                    <h2 className="text-headline-md font-headline-md font-bold text-primary">Set Your Password</h2>
                    <p className="text-body-md text-on-surface-variant mt-2">Create a secure password to access your Admin Dashboard.</p>
                </div>

                {error && (
                    <div className="bg-error-container/20 text-error px-4 py-3 rounded-lg mb-6 text-label-md flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-label-md font-bold text-on-surface">New Password</label>
                        <input
                            type="password"
                            className="bg-surface-container-low px-4 py-3 rounded-lg border border-outline-variant/30 text-body-md focus:outline-none focus:ring-2 focus:ring-primary w-full"
                            placeholder="Enter password (min 8 chars)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-label-md font-bold text-on-surface">Confirm Password</label>
                        <input
                            type="password"
                            className="bg-surface-container-low px-4 py-3 rounded-lg border border-outline-variant/30 text-body-md focus:outline-none focus:ring-2 focus:ring-primary w-full"
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                Set Password
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
