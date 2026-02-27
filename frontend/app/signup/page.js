'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
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
    if (!form.name || !form.email || !form.phone) { toast.error('All fields are required'); return; }
    if (form.phone.length !== 10) { toast.error('Enter valid 10-digit mobile number'); return; }
    setLoading(true);
    try {
      await api.post('/auth/signup/send-otp', form);
      toast.success('OTP sent to your email!');
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
      const res = await api.post('/auth/signup/verify-otp', { email: form.email, otp: otpStr });
      setAuth(res.data.user, res.data.accessToken);
      toast.success('Account created successfully! 🎉');
      router.push('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally { setLoading(false); }
  };

  const fields = [
    { key: 'name', label: 'Full Name', icon: User, placeholder: 'Enter your full name', type: 'text' },
    { key: 'email', label: 'Email Address', icon: Mail, placeholder: 'Enter your email', type: 'email' },
    { key: 'phone', label: 'Mobile Number', icon: Phone, placeholder: 'Enter 10-digit number', type: 'tel' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 50%, #FFF8E1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(27,94,32,0.3)' }}>
            <span style={{ color: 'white', fontFamily: 'Sora', fontWeight: 800, fontSize: 24 }}>KJN</span>
          </div>
          <h1 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 26, color: '#1F2937' }}>Create Account</h1>
          <p style={{ color: '#6B7280', fontSize: 14, marginTop: 6 }}>Join thousands of happy farmers</p>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 8 }}>
          {['Your Details', 'Verify Email'].map((label, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: step > i ? '#1B5E20' : step === i + 1 ? '#1B5E20' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', marginBottom: 4 }}>
                  {step > i + 1 ? <CheckCircle style={{ width: 18, color: 'white' }} /> : <span style={{ color: step === i + 1 ? 'white' : '#9CA3AF', fontWeight: 800, fontSize: 13 }}>{i + 1}</span>}
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: step === i + 1 ? '#1B5E20' : '#9CA3AF' }}>{label}</span>
              </div>
              {i < 1 && <div style={{ height: 2, flex: 0.5, background: step > 1 ? '#1B5E20' : '#e5e7eb', borderRadius: 99, transition: 'all 0.3s', marginBottom: 16 }} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: 20, padding: '32px 28px', boxShadow: '0 8px 40px rgba(0,0,0,0.10)' }}>
          {step === 1 ? (
            <form onSubmit={sendOTP}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {fields.map(({ key, label, icon: Icon, placeholder, type }) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#374151', marginBottom: 8 }}>{label}</label>
                    <div style={{ position: 'relative' }}>
                      <Icon style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, color: '#9CA3AF' }} />
                      <input
                        className="input"
                        style={{ paddingLeft: 44 }}
                        type={type}
                        placeholder={placeholder}
                        value={form[key]}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (key === 'phone') val = val.replace(/\D/g, '').slice(0, 10);
                          setForm({ ...form, [key]: val });
                        }}
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: 24 }}>
                {loading ? 'Sending OTP...' : <>Continue <ArrowRight style={{ width: 16 }} /></>}
              </button>

              <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#6B7280' }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color: '#1B5E20', fontWeight: 700 }}>Login</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={verifyOTP}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, background: '#E8F5E9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Mail style={{ width: 24, color: '#1B5E20' }} />
                </div>
                <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Check Your Email</h3>
                <p style={{ fontSize: 13, color: '#6B7280' }}>OTP sent to <strong>{form.email}</strong></p>
              </div>

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
                {loading ? 'Creating Account...' : 'Verify & Create Account 🎉'}
              </button>

              <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#6B7280' }}>
                {timer > 0
                  ? `Resend in ${timer}s`
                  : <button type="button" onClick={sendOTP} style={{ color: '#1B5E20', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Resend OTP</button>}
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}