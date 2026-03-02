'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Phone, ArrowRight, X,
  CheckCircle, Shield, Truck, Star,
  AlertTriangle, Clock, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';
import useCartStore from '@/store/useCartStore';

const RS = String.fromCharCode(8377);

const FEATURES = [
  'Genuine agricultural products',
  'Free delivery above ' + RS + '500',
  'Easy 7-day returns',
  'Exclusive member-only deals',
];

const TRUST = [
  { Icon: Shield, label: 'Secure Signup' },
  { Icon: Truck,  label: 'Free Delivery' },
  { Icon: Star,   label: '4.8 Rated App' },
];

const STEPS = ['Your Details', 'Verify Email'];

function ErrorBanner({ banner, cooldownLeft, onClose }) {
  if (!banner) return null;

  const isRegistered = banner.type === 'registered';
  const isCooldown   = banner.type === 'cooldown';
  const isWarning    = banner.type === 'warning';

  const colorClass = (isRegistered || banner.type === 'error')
    ? 'bg-red-50 border-red-200 text-red-700'
    : 'bg-amber-50 border-amber-200 text-amber-700';

  const Icon = isRegistered ? AlertCircle : isCooldown ? Clock : AlertTriangle;

  return (
    <div className={'mb-5 rounded-xl px-4 py-3.5 flex items-start gap-3 text-sm font-semibold border ' + colorClass}>
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p>{banner.message}</p>
        {isRegistered && (
          <Link href="/login"
            className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-lg transition-colors">
            Go to Login <ArrowRight className="w-3 h-3" />
          </Link>
        )}
        {isCooldown && cooldownLeft > 0 && (
          <p className="mt-1 text-xs font-bold">Try again in {cooldownLeft}s</p>
        )}
        {isWarning && (
          <p className="mt-1 text-xs">Please fill in your details again below.</p>
        )}
      </div>
      <button onClick={onClose} className="flex-shrink-0 opacity-60 hover:opacity-100 mt-0.5">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function SignupPage() {
  const [step,         setStep]         = useState(1);
  const [form,         setForm]         = useState({ name: '', email: '', phone: '' });
  const [otp,          setOtp]          = useState(['', '', '', '', '', '']);
  const [loading,      setLoading]      = useState(false);
  const [timer,        setTimer]        = useState(0);
  const [errorBanner,  setErrorBanner]  = useState(null);
  const [cooldownLeft, setCooldownLeft] = useState(0);

  const router        = useRouter();
  const { setAuth }   = useAuthStore();
  const { fetchCart } = useCartStore();

  const startTimer = () => {
    setTimer(60);
    const t = setInterval(() => {
      setTimer(p => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; });
    }, 1000);
  };

  const startCooldownDisplay = () => {
    setCooldownLeft(60);
    const t = setInterval(() => {
      setCooldownLeft(p => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; });
    }, 1000);
  };

  const setField = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrorBanner(null);
  };

  const sendOTP = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!form.name || !form.email || !form.phone) { toast.error('All fields are required'); return; }
    if (form.phone.length !== 10) { toast.error('Enter valid 10-digit mobile number'); return; }
    setErrorBanner(null);
    setLoading(true);
    try {
      await api.post('/auth/signup/send-otp', form);
      toast.success('OTP sent to ' + form.email);
      setStep(2);
      setOtp(['', '', '', '', '', '']);
      startTimer();
    } catch (err) {
      const data   = err.response?.data || {};
      const status = err.response?.status;
      if (data.alreadyRegistered) {
        setErrorBanner({ type: 'registered', message: data.message });
      } else if (status === 429) {
        setErrorBanner({ type: 'cooldown', message: data.message });
        startCooldownDisplay();
      } else {
        setErrorBanner({ type: 'error', message: data.message || 'Failed to send OTP. Please try again.' });
      }
    } finally { setLoading(false); }
  };

  const handleOtpChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const n = [...otp];
    n[idx] = val.slice(-1);
    setOtp(n);
    if (val && idx < 5) document.getElementById('sotp-' + (idx + 1))?.focus();
  };

  const handleOtpKey = (e, idx) => {
    if (e.key === 'Backspace') {
      if (otp[idx]) { const n = [...otp]; n[idx] = ''; setOtp(n); }
      else if (idx > 0) document.getElementById('sotp-' + (idx - 1))?.focus();
    }
    if (e.key === 'ArrowLeft'  && idx > 0) document.getElementById('sotp-' + (idx - 1))?.focus();
    if (e.key === 'ArrowRight' && idx < 5) document.getElementById('sotp-' + (idx + 1))?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    const n = [...otp];
    text.split('').forEach((d, i) => { if (i < 6) n[i] = d; });
    setOtp(n);
    document.getElementById('sotp-' + Math.min(text.length, 5))?.focus();
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Enter complete 6-digit OTP'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/signup/verify-otp', { email: form.email, otp: code });
      setAuth(res.data.user, res.data.accessToken);
      try {
        const sessionId = localStorage.getItem('sessionId');
        if (sessionId) await api.post('/cart/merge', { sessionId });
        await fetchCart();
      } catch { /* ignore */ }
      toast.success('Welcome to KJN Shop, ' + res.data.user.name + '!');
      router.push('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid OTP';
      if (msg.toLowerCase().includes('session expired') || msg.toLowerCase().includes('signup again')) {
        setStep(1);
        setOtp(['', '', '', '', '', '']);
        setErrorBanner({ type: 'warning', message: 'Your session expired. Please enter your details again to get a fresh OTP.' });
      } else {
        toast.error(msg);
        setOtp(['', '', '', '', '', '']);
        document.getElementById('sotp-0')?.focus();
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Left brand panel - desktop only */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] flex-col justify-between bg-gradient-to-br from-primary-900 via-green-800 to-green-600 px-12 py-12 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-40 -right-16 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 left-16 w-64 h-64 rounded-full bg-white/5" />

        <div className="relative z-10">
          <Link href="/">
            <img
              src="https://image.cdn.shpy.in/386933/KJNLogo-1767688579320.jpeg?height=200&format=webp"
              alt="KJN Shop"
              className="h-12 w-auto object-contain brightness-0 invert"
            />
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-green-300 text-sm font-bold uppercase tracking-widest mb-3">
              Join 10,000+ Farmers
            </p>
            <h2 className="text-white font-heading font-extrabold text-4xl leading-tight mb-4">
              Start Your Journey With KJN Shop
            </h2>
            <p className="text-white/70 text-base leading-relaxed">
              Create your free account in under 2 minutes and get access to the best farm equipment deals.
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

        <div className="relative z-10 flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4">
          <div>
            <p className="text-white font-extrabold text-3xl">4.8</p>
            <div className="flex gap-0.5 mt-0.5">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={'w-3.5 h-3.5 ' + (s <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-white/30')} />
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

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-block">
              <img
                src="https://image.cdn.shpy.in/386933/KJNLogo-1767688579320.jpeg?height=200&format=webp"
                alt="KJN Shop"
                className="h-12 w-auto object-contain mx-auto"
              />
            </Link>
          </div>

          {/* Step progress */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={'w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm transition-all ' + (
                    step > i + 1
                      ? 'bg-primary-900 text-white'
                      : step === i + 1
                      ? 'bg-primary-900 text-white ring-4 ring-primary-900/20'
                      : 'bg-gray-200 text-gray-400'
                  )}>
                    {step > i + 1 ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={'text-[10px] font-bold mt-1 ' + (step === i + 1 ? 'text-primary-900' : 'text-gray-400')}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={'h-0.5 flex-1 mx-2 mb-4 rounded-full transition-all ' + (step > 1 ? 'bg-primary-900' : 'bg-gray-200')} />
                )}
              </div>
            ))}
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

            {/* Card header */}
            <div className="px-8 pt-8 pb-6 border-b border-gray-100">
              <h1 className="font-heading font-extrabold text-2xl text-gray-900">
                {step === 1 ? 'Create Your Account' : 'Verify Your Email'}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {step === 1
                  ? 'Fill in your details to get started'
                  : 'Enter the 6-digit OTP sent to ' + form.email}
              </p>
            </div>

            <div className="px-8 py-7">

              {/* Error banner */}
              <ErrorBanner
                banner={errorBanner}
                cooldownLeft={cooldownLeft}
                onClose={() => setErrorBanner(null)}
              />

              {/* Step 1 - Details */}
              {step === 1 && (
                <form onSubmit={sendOTP} className="space-y-5">

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setField('name', e.target.value)}
                        placeholder="Enter your full name"
                        required
                        autoFocus
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-primary-900 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setField('email', e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-primary-900 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number</label>
                    <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-primary-900 transition-colors">
                      <div className="flex items-center gap-2 px-3 py-3 bg-gray-50 border-r border-gray-200 flex-shrink-0">
                        <span className="text-sm">&#127470;&#127475;</span>
                        <span className="text-sm font-extrabold text-gray-700">+91</span>
                      </div>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => setField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-digit mobile number"
                        required
                        className="flex-1 px-4 py-3 text-sm font-medium bg-white focus:outline-none"
                      />
                    </div>
                    {form.phone.length > 0 && form.phone.length < 10 && (
                      <p className="text-xs text-orange-500 font-semibold mt-1.5">
                        {10 - form.phone.length} more digits needed
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-primary-900 hover:bg-primary-800 disabled:opacity-60 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    {loading
                      ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending OTP...</>
                      : <>Continue <ArrowRight className="w-4 h-4" /></>
                    }
                  </button>

                  <p className="text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary-900 font-bold hover:underline">Login</Link>
                  </p>
                </form>
              )}

              {/* Step 2 - OTP */}
              {step === 2 && (
                <form onSubmit={verifyOTP} className="space-y-6">

                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center">
                      <Mail className="w-7 h-7 text-primary-900" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">OTP sent to</p>
                      <p className="font-bold text-gray-900 text-sm">{form.email}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 text-center">
                      Enter 6-digit OTP
                    </label>
                    <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          id={'sotp-' + idx}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpChange(e.target.value, idx)}
                          onKeyDown={e => handleOtpKey(e, idx)}
                          style={{ height: '3.25rem' }}
                          className={'w-11 sm:w-12 text-center text-xl font-extrabold rounded-xl border-2 transition-all focus:outline-none ' + (
                            digit
                              ? 'border-primary-900 bg-primary-50 text-primary-900'
                              : 'border-gray-200 bg-white text-gray-900 focus:border-primary-900'
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-center text-xs text-gray-400 font-medium mt-2">
                      Tip: You can paste the OTP directly
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.join('').length !== 6}
                    className="w-full py-3.5 bg-primary-900 hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    {loading
                      ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating Account...</>
                      : <>Create Account <CheckCircle className="w-4 h-4" /></>
                    }
                  </button>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => { setStep(1); setOtp(['','','','','','']); }}
                      className="text-gray-500 font-semibold hover:text-gray-700 transition-colors"
                    >
                      &larr; Change details
                    </button>
                    {timer > 0
                      ? <span className="text-gray-400 font-semibold">Resend in {timer}s</span>
                      : (
                        <button type="button" onClick={sendOTP}
                          className="text-primary-900 font-bold hover:underline">
                          Resend OTP
                        </button>
                      )
                    }
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-8">
            {TRUST.map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-gray-500">
                <Icon className="w-4 h-4 text-primary-900" />
                <span className="text-xs font-semibold">{label}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-gray-600">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}