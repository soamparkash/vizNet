import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, ShieldCheck, ArrowLeft, Mail } from 'lucide-react';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Pass
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const { forgotPassword, resetPassword } = useAuth();
    const navigate = useNavigate();

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await forgotPassword(email);
            setStep(2);
        } catch (err) { setError(err.message); }
        setLoading(false);
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await resetPassword(email, otp, password);
            alert("Password reset successful! Please login.");
            navigate('/login');
        } catch (err) { setError(err.message); }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10">
                <Link to="/login" className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 font-bold text-sm mb-8 transition">
                    <ArrowLeft size={18}/> Back to Login
                </Link>

                {step === 1 ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                            <KeyRound size={32} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-2">Forgot Password?</h2>
                        <p className="text-gray-500 mb-8">Enter your email and we'll send you a 6-digit reset code.</p>
                        <form onSubmit={handleRequestOtp} className="space-y-4">
                            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition font-bold" required />
                            <button disabled={loading} type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
                                {loading ? 'Sending...' : 'Send Code'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                            <ShieldCheck size={32} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-2">Reset Password</h2>
                        <p className="text-gray-500 mb-8">Enter the code sent to your email and choose a new password.</p>
                        <form onSubmit={handleReset} className="space-y-4">
                            <input type="text" placeholder="6-Digit Code" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full text-center tracking-[0.5em] px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition font-black" required />
                            <input type="password" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-600 outline-none transition font-bold" required />
                            <button disabled={loading} type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
                                {loading ? 'Resetting...' : 'Update Password'}
                            </button>
                        </form>
                    </div>
                )}
                {error && <p className="text-rose-500 text-center mt-4 font-bold text-sm">{error}</p>}
            </div>
        </div>
    );
};

export default ForgotPassword;