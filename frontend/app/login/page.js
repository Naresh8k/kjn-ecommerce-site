'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Phone, ArrowRight, Shield, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';

export default function LoginPage() {
  const [step, setStep] = useState(1);
  const [usePassword, setUsePassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const startTimer = () => {
    setTimer(60);
    const t = setInterval(() => {
      setTimer((p) => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; });
    }, 1000);
  };

  const sendOTP = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) { toast.error('Enter valid 10-digit mobile number'); return; }
    setLoading(true);
    try {
      await api.post('/auth/login/send-otp', { phone });
      toast.success('OTP sent successfully!');
      setStep(2);
      startTimer();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleOtpChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
    if (!val && idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus();
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length !== 6) { toast.error('Enter complete 6-digit OTP'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/login/verify-otp', { phone, otp: otpStr });
      setAuth(res.data.user, res.data.accessToken);
      toast.success(`Welcome back, ${res.data.user.name}! 👋`);
      // if the account is an admin or staff, send them to the admin dashboard
      if (res.data.user.role === 'ADMIN' || res.data.user.role === 'STAFF') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 50%, #FFF8E1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(27,94,32,0.3)' }}>
            <span style={{ color: 'white', fontFamily: 'Sora', fontWeight: 800, fontSize: 24 }}>KJN</span>
          </div>
          <h1 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 26, color: '#1F2937' }}>Welcome Back!</h1>
          <p style={{ color: '#6B7280', fontSize: 14, marginTop: 6 }}>Login to your KJN Shop account</p>
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: 20, padding: '32px 28px', boxShadow: '0 8px 40px rgba(0,0,0,0.10)' }}>
          {usePassword ? (
            <form onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              try {
                const res = await api.post('/auth/login/password', { email, password });
                setAuth(res.data.user, res.data.accessToken);
                toast.success(`Welcome back, ${res.data.user.name}! 👋`);
                if (res.data.user.role === 'ADMIN' || res.data.user.role === 'STAFF') {
                  router.push('/admin');
                } else {
                  router.push('/');
                }
              } catch (err) {
                toast.error(err.response?.data?.message || 'Login failed');
              } finally {
                setLoading(false);
              }
            }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#374151', marginBottom: 8 }}>Email address</label>
                <input
                  className="input"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#374151', marginBottom: 8 }}>Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#6B7280' }}>
                <button type="button" onClick={() => setUsePassword(false)} style={{ color: '#1B5E20', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
                  Use OTP instead
                </button>
              </p>
            </form>
          ) : step === 1 ? (
            <form onSubmit={sendOTP}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#374151', marginBottom: 8 }}>Mobile Number</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 8, borderRight: '2px solid #e5e7eb', paddingRight: 12 }}>
                    <span style={{ fontSize: 16 }}>🇮🇳</span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#374151' }}>+91</span>
                  </div>
                  <input
                    className="input"
                    style={{ paddingLeft: 90 }}
                    type="tel"
                    placeholder="Enter 10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button type="submit" disabled={loading || phone.length !== 10} className="btn btn-primary"
                style={{ width: '100%', opacity: phone.length !== 10 ? 0.6 : 1 }}>
                {loading ? 'Sending OTP...' : <>Send OTP <ArrowRight style={{ width: 16 }} /></>}
              </button>

              <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#6B7280' }}>
                New here?{' '}
                <Link href="/signup" style={{ color: '#1B5E20', fontWeight: 700 }}>Create Account</Link>
              </p>
              <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: '#6B7280' }}>
                <button type="button" onClick={() => setUsePassword(true)} style={{ color: '#1B5E20', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
                  Admin? Login with password
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={verifyOTP}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, background: '#E8F5E9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Phone style={{ width: 24, color: '#1B5E20' }} />
                </div>
                <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Verify OTP</h3>
                <p style={{ fontSize: 13, color: '#6B7280' }}>
                  OTP sent to <strong>+91 {phone}</strong>
                  <button type="button" onClick={() => setStep(1)} style={{ color: '#1B5E20', fontWeight: 700, background: 'none', border: 'none', marginLeft: 6, cursor: 'pointer', fontSize: 13 }}>
                    Change
                  </button>
                </p>
              </div>

              {/* OTP Boxes */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
                {otp.map((digit, idx) => (
                  <input key={idx} id={`otp-${idx}`}
                    type="text" inputMode="numeric"
                    maxLength={1} value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                    style={{
                      width: 48, height: 56, textAlign: 'center',
                      fontSize: 22, fontWeight: 800, fontFamily: 'Sora',
                      border: `2px solid ${digit ? '#1B5E20' : '#e5e7eb'}`,
                      borderRadius: 12, outline: 'none',
                      background: digit ? '#E8F5E9' : 'white',
                      transition: 'all 0.2s',
                    }} />
                ))}
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>

              <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#6B7280' }}>
                {timer > 0
                  ? `Resend OTP in ${timer}s`
                  : <button type="button" onClick={sendOTP} style={{ color: '#1B5E20', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Resend OTP</button>}
              </p>
            </form>
          )}
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 24 }}>
          {[
            { icon: Shield, text: 'Secure Login' },
            { icon: RefreshCw, text: 'OTP Based' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6B7280', fontSize: 12, fontWeight: 600 }}>
              <Icon style={{ width: 14, color: '#1B5E20' }} /> {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}