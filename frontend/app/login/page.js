'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Phone, ArrowRight, Shield, Smartphone,
  Eye, EyeOff, CheckCircle, Lock, Mail
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';
import useCartStore from '@/store/useCartStore';

const TRUST = [
  { icon: Shield,      label: 'Secure & Encrypted' },
  { icon: Smartphone,  label: 'OTP Verification'   },
  { icon: CheckCircle, label: '10,000+ Farmers'     },
];

const FEATURES = [
  'Genuine agricultural products',
  'Free delivery above \u20b9500',
  'Easy 7-day returns',
  'Exclusive app-only deals',
];

export default function LoginPage() {
  const [step,        setStep]        = useState(1);
  const [usePassword, setUsePassword] = useState(false);
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPwd,     setShowPwd]     = useState(false);
  const [phone,       setPhone]       = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otp,         setOtp]         = useState(['', '', '', '', '', '']);
  const [loading,     setLoading]     = useState(false);
  const [timer,       setTimer]       = useState(0);

  const router    = useRouter();
  const { setAuth }    = useAuthStore();
  const { fetchCart }  = useCartStore();

  const startTimer = () => {
    setTimer(60);
    const t = setInterval(() => {
      setTimer(p => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; });
    }, 1000);
  };

  const afterLogin = async (user, token) => {
    setAuth(user, token);
    try {
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) await api.post('/cart/merge', { sessionId });
      await fetchCart();
    } catch { /* ignore */ }
    toast.success(`Welcome back, ${user.name}!`);
    router.push(user.role === 'ADMIN' || user.role === 'STAFF' ? '/admin' : '/');
  };

  const sendOTP = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) { toast.error('Enter valid 10-digit number'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/login/send-otp', { phone });
      setMaskedEmail(res.data.maskedEmail || '');
      toast.success(res.data.message || 'OTP sent to your registered email!');
      setStep(2);
      startTimer();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Enter complete 6-digit OTP'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/login/verify-otp', { phone, otp: code });
      await afterLogin(res.data.user, res.data.accessToken);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally { setLoading(false); }
  };

  const loginPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login/password', { email, password });
      await afterLogin(res.data.user, res.data.accessToken);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleOtpChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const n = [...otp];
    n[idx] = val.slice(-1);
    setOtp(n);
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  const handleOtpKey = (e, idx) => {
    if (e.key === 'Backspace') {
      if (otp[idx]) {
        const n = [...otp]; n[idx] = ''; setOtp(n);
      } else if (idx > 0) {
        document.getElementById(`otp-${idx - 1}`)?.focus();
      }
    }
    if (e.key === 'ArrowLeft'  && idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus();
    if (e.key === 'ArrowRight' && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    const n = [...otp];
    text.split('').forEach((d, i) => { if (i < 6) n[i] = d; });
    setOtp(n);
    document.getElementById(`otp-${Math.min(text.length, 5)}`)?.focus();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Left panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] flex-col justify-between bg-gradient-to-br from-primary-900 via-green-800 to-green-600 px-12 py-12 relative overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-40 -right-16 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 left-16 w-64 h-64 rounded-full bg-white/5" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/">
            <img
              src="https://image.cdn.shpy.in/386933/KJNLogo-1767688579320.jpeg?height=200&format=webp"
              alt="KJN Shop"
              className="h-12 w-auto object-contain brightness-0 invert"
            />
          </Link>
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-green-300 text-sm font-bold uppercase tracking-widest mb-3">
              Trusted by 10,000+ Farmers
            </p>
            <h2 className="text-white font-heading font-extrabold text-4xl leading-tight mb-4">
              India&apos;s Most Trusted Farm Equipment Store
            </h2>
            <p className="text-white/70 text-base leading-relaxed">
              Quality sprayers, seeders, motors, tools and more — delivered straight to your farm.
            </p>
          </div>

          <ul className="space-y-3">
            {FEATURES.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-white/90 text-sm font-semibold">
                <span className="w-5 h-5 rounded-full bg-green-400/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3 h-3 text-green-300" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Rating bar */}
        <div className="relative z-10 flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4">
          <div>
            <p className="text-white font-extrabold text-3xl">4.8</p>
            <div className="flex gap-0.5 mt-0.5">
              {[1,2,3,4,5].map(s => (
                <span key={s} className="text-yellow-400 text-sm">{s <= 4 ? '★' : '☆'}</span>
              ))}
            </div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div>
            <p className="text-white font-bold text-sm">Average Rating</p>
            <p className="text-white/60 text-xs">Based on 2,000+ reviews</p>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-block">
              <img
                src="https://image.cdn.shpy.in/386933/KJNLogo-1767688579320.jpeg?height=200&format=webp"
                alt="KJN Shop" className="h-12 w-auto object-contain mx-auto"
              />
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

            {/* Card header */}
            <div className="px-8 pt-8 pb-6 border-b border-gray-100">
              <h1 className="font-heading font-extrabold text-2xl text-gray-900">
                {usePassword ? 'Admin Login' : step === 1 ? 'Welcome Back!' : 'Verify OTP'}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {usePassword
                  ? 'Login with your admin credentials'
              : step === 1
                  ? 'Enter your mobile number to continue'
                  : `OTP sent to ${maskedEmail || 'your registered email'}`}
              </p>
            </div>

            <div className="px-8 py-7">

              {/* ── Password Login ── */}
              {usePassword && (
                <form onSubmit={loginPassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus
                        placeholder="admin@kjnshop.com"
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-primary-900 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-primary-900 focus:outline-none transition-colors"
                      />
                      <button type="button" onClick={() => setShowPwd(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 bg-primary-900 hover:bg-primary-800 disabled:opacity-60 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors">
                    {loading
                      ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Logging in...</>
                      : <>Login <ArrowRight className="w-4 h-4" /></>}
                  </button>

                  <p className="text-center text-sm text-gray-500">
                    <button type="button" onClick={() => setUsePassword(false)}
                      className="text-primary-900 font-bold hover:underline">
                      Use OTP instead
                    </button>
                  </p>
                </form>
              )}

              {/* ── OTP Step 1: Phone ── */}
              {!usePassword && step === 1 && (
                <form onSubmit={sendOTP} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number</label>
                    <div className="flex gap-0 border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-primary-900 transition-colors">
                      <div className="flex items-center gap-2 px-3 py-3 bg-gray-50 border-r border-gray-200 flex-shrink-0">
                        <span className="text-base">&#127470;&#127475;</span>
                        <span className="text-sm font-extrabold text-gray-700">+91</span>
                      </div>
                      <input
                        type="tel" value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="Enter 10-digit number"
                        className="flex-1 px-4 py-3 text-sm font-medium bg-white focus:outline-none"
                        required autoFocus
                      />
                    </div>
                    {phone.length > 0 && phone.length < 10 && (
                      <p className="text-xs text-orange-500 font-semibold mt-1.5">{10 - phone.length} more digits needed</p>
                    )}
                  </div>

                  <button type="submit" disabled={loading || phone.length !== 10}
                    className="w-full py-3.5 bg-primary-900 hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 transition-all">
                    {loading
                      ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending OTP...</>
                      : <>Send OTP <ArrowRight className="w-4 h-4" /></>}
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 font-semibold">OR</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-500">
                      New here?{' '}
                      <Link href="/signup" className="text-primary-900 font-bold hover:underline">
                        Create Account
                      </Link>
                    </p>
                    <button type="button" onClick={() => setUsePassword(true)}
                      className="text-sm text-gray-500 hover:text-gray-700 font-semibold transition-colors">
                      Admin? Login with password &rarr;
                    </button>
                  </div>
                </form>
              )}

       
              {!usePassword && step === 2 && (
                <form onSubmit={verifyOTP} className="space-y-6">
                  {/* OTP boxes */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 text-center">
                      Enter 6-digit OTP
                    </label>
                    <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpChange(e.target.value, idx)}
                          onKeyDown={e => handleOtpKey(e, idx)}
                          className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-extrabold rounded-xl border-2 transition-all focus:outline-none ${
                            digit
                              ? 'border-primary-900 bg-primary-50 text-primary-900'
                              : 'border-gray-200 bg-white text-gray-900 focus:border-primary-900'
                          }`}
                          style={{ height: '3.25rem' }}
                        />
                      ))}
                    </div>
                    <p className="text-center text-xs text-gray-400 font-medium mt-2">
                      Tip: You can paste the OTP directly
                    </p>
                  </div>

                  <button type="submit" disabled={loading || otp.join('').length !== 6}
                    className="w-full py-3.5 bg-primary-900 hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 transition-all">
                    {loading
                      ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying...</>
                      : <>Verify &amp; Login <ArrowRight className="w-4 h-4" /></>}
                  </button>

                  <div className="flex items-center justify-between text-sm">
                    <button type="button" onClick={() => { setStep(1); setOtp(['','','','','','']); }}
                      className="text-gray-500 font-semibold hover:text-gray-700 flex items-center gap-1 transition-colors">
                      &larr; Change number
                    </button>
                    {timer > 0
                      ? <span className="text-gray-400 font-semibold">Resend in {timer}s</span>
                      : <button type="button" onClick={sendOTP}
                          className="text-primary-900 font-bold hover:underline transition-colors">
                          Resend OTP
                        </button>
                    }
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-8">
            {TRUST.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-gray-500">
                <Icon className="w-4 h-4 text-primary-900" />
                <span className="text-xs font-semibold">{label}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-gray-600">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}