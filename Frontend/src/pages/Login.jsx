import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Chrome, ArrowRight, ShieldCheck, Loader2, RefreshCw, KeyRound, CheckCircle2 } from 'lucide-react';

const Login = () => {
  // Mode State: 'login', 'signup', 'verify-email', 'forgot-email', 'forgot-otp', 'reset-password'
  const [mode, setMode] = useState('login'); 
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Single form state for all inputs
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  
  const { login, register, verifyOtp, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // ⏱️ Resend OTP Timer Logic
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval;
    if ((mode === 'verify-email' || mode === 'forgot-otp') && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [mode, timer]);

  const handleStartTimer = () => {
    setTimer(60);
    setCanResend(false);
  };

  // 1. LOGIN & SIGNUP HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        await register(form.name, form.email, form.password);
        setMode('verify-email');
        handleStartTimer();
      } else {
        await login(form.email, form.password);
        navigate('/');
      }
    } catch (err) {
      if (err.message?.toLowerCase().includes('verify')) {
        setMode('verify-email');
        handleStartTimer();
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. VERIFY EMAIL OTP HANDLER
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyOtp(form.email, otp);
      navigate('/');
    } catch (err) {
      setError(err.message || "Invalid OTP code");
    } finally {
      setLoading(false);
    }
  };

  // 3. FORGOT PASSWORD - SEND OTP
  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(form.email); // Make sure AuthContext has this function
      setMode('forgot-otp');
      handleStartTimer();
    } catch (err) {
      setError(err.message || "User not found");
    } finally {
      setLoading(false);
    }
  };

  // 4. FORGOT PASSWORD - RESET WITH OTP
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }
    
    setLoading(true);
    try {
      // Backend expects: { email, otp, password }
      await resetPassword(form.email, otp, form.password); 
      // Auto-login or redirect to login
      alert("Password changed successfully! Please login.");
      setMode('login');
      setForm({ ...form, password: '', confirmPassword: '' });
      setOtp('');
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setLoading(true);
    try {
      if (mode === 'verify-email') {
         await register(form.name || "User", form.email, form.password);
      } else {
         await forgotPassword(form.email);
      }
      handleStartTimer();
      setError('');
    } catch (err) {
      setError("Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ================= RENDER: OTP SCREENS (Verify or Forgot) =================
  if (mode === 'verify-email' || mode === 'forgot-otp') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl p-8 border border-slate-100 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {mode === 'forgot-otp' ? 'Password Reset Code' : 'Verify Email'}
          </h2>
          <p className="text-slate-500 mb-8 text-sm px-4">
            Enter the 6-digit code sent to <span className="font-semibold text-slate-900">{form.email}</span>
          </p>

          <form onSubmit={(e) => {
             // If verifying email -> handleVerifyOtp
             // If forgot password -> just validate OTP format locally then move to next step
             e.preventDefault();
             if (mode === 'verify-email') {
               handleVerifyOtp(e);
             } else {
               // For Reset Password, we verify OTP *with* the new password in the next step.
               // Or you can verify OTP first if your backend supports it.
               // Assuming we just move to next step if OTP length is correct for now:
               if(otp.length === 6) setMode('reset-password');
               else setError("Please enter 6 digit code");
             }
          }} className="space-y-6">
            <div className="flex justify-center">
              <input
                type="text"
                maxLength="6"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full text-center text-4xl tracking-[0.75rem] font-mono font-bold py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all shadow-inner"
                required
              />
            </div>

            {error && <p className="text-rose-500 font-semibold text-xs bg-rose-50 py-2 rounded-lg">{error}</p>}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (mode === 'forgot-otp' ? "Verify Code" : "Complete Verification")}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100">
            {canResend ? (
              <button onClick={handleResendOtp} className="flex items-center justify-center gap-2 mx-auto text-indigo-600 font-bold hover:text-indigo-700 transition">
                <RefreshCw size={16} /> Resend New Code
              </button>
            ) : (
              <p className="text-slate-400 text-sm font-medium">Resend code in <span className="text-slate-900">{timer}s</span></p>
            )}
            <button 
              onClick={() => { setMode('login'); setOtp(''); }} 
              className="mt-4 text-xs font-semibold text-slate-400 hover:text-slate-600 block mx-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= RENDER: FORGOT PASSWORD (EMAIL STEP) =================
  if (mode === 'forgot-email') {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl p-8 border border-slate-100 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 -rotate-3">
            <KeyRound size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Forgot Password?</h2>
          <p className="text-slate-500 mb-8 text-sm px-4">
            No worries! Enter your email address and we'll send you a code to reset it.
          </p>

          <form onSubmit={handleForgotEmailSubmit} className="space-y-6">
            <div className="relative group text-left">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-semibold text-slate-700"
                  required
                />
            </div>

            {error && <p className="text-rose-500 font-semibold text-xs bg-rose-50 py-2 rounded-lg">{error}</p>}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Send Reset Code"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <button 
              onClick={() => setMode('login')} 
              className="text-sm font-bold text-slate-400 hover:text-slate-600 block mx-auto"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= RENDER: RESET PASSWORD (NEW PASS STEP) =================
  if (mode === 'reset-password') {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl p-8 border border-slate-100 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Set New Password</h2>
          <p className="text-slate-500 mb-8 text-sm px-4">
            Create a new secure password for your account.
          </p>

          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <div className="relative group text-left">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  type="password"
                  placeholder="New Password"
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-semibold text-slate-700"
                  required
                />
            </div>
            <div className="relative group text-left">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  minLength={6}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-semibold text-slate-700"
                  required
                />
            </div>

            {error && <p className="text-rose-500 font-semibold text-xs bg-rose-50 py-2 rounded-lg">{error}</p>}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ================= RENDER: LOGIN & SIGNUP =================
  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-100 via-white to-slate-50 flex items-center justify-center py-12 px-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-white relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-rose-500"></div>
        
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 uppercase italic">
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <div className="h-1 w-12 bg-indigo-500 mx-auto rounded-full"></div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl text-center mb-6 font-bold text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Your Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-semibold text-slate-700"
                required
              />
            </div>
          )}

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-semibold text-slate-700"
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              type="password"
              placeholder="Password"
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-semibold text-slate-700"
              required
            />
          </div>

          {/* FORGOT PASSWORD BUTTON */}
          {mode === 'login' && (
             <div className="text-right">
                <button 
                  type="button" 
                  onClick={() => setMode('forgot-email')} 
                  className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  Forgot Password?
                </button>
             </div>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 group"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (mode === 'signup' ? 'GET STARTED' : 'LOG IN')}
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black text-slate-400"><span className="bg-white px-4">Social Connect</span></div>
        </div>

        <button
          onClick={() => window.location.href = "http://localhost:5000/api/auth/google"}
          className="w-full bg-white border border-slate-200 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
        >
          <Chrome className="text-rose-500" size={18} />
          Continue with Google
        </button>

        <p className="text-center mt-8 text-slate-400 font-bold text-sm">
          {mode === 'signup' ? 'Member already?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => { 
                setMode(mode === 'signup' ? 'login' : 'signup'); 
                setError(''); 
                setForm({name:'', email:'', password:'', confirmPassword:''}); 
            }}
            className="text-indigo-600 hover:text-indigo-700 font-black decoration-2 hover:underline"
          >
            {mode === 'signup' ? 'SIGN IN' : 'JOIN NOW'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;