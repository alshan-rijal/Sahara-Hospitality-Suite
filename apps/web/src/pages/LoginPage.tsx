import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Globe, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../lib/api';

const demos = [
  ['Corporate Admin', 'corporate_admin@grandstay.test'],
  ['General Manager', 'general_manager@grandstay.test'],
  ['Front Office', 'front_office_manager@grandstay.test'],
  ['Receptionist', 'receptionist@grandstay.test'],
  ['Housekeeping', 'housekeeping_manager@grandstay.test'],
  ['F&B Manager', 'fnb_manager@grandstay.test'],
  ['Finance Manager', 'finance_manager@grandstay.test'],
  ['Technician', 'technician@grandstay.test']
];

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('corporate_admin@grandstay.test');
  const [password, setPassword] = useState('Hotel@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-visual">
        <div className="login-aura" aria-hidden><span /><span /><span /></div>
        <svg className="login-waves" viewBox="0 0 2880 320" preserveAspectRatio="none" aria-hidden>
          <path fill="rgba(37, 99, 235, .38)" d="M0,210 Q360,130 720,210 T1440,210 T2160,210 T2880,210 L2880,320 L0,320 Z" />
        </svg>
        <svg className="login-waves reverse" viewBox="0 0 2880 320" preserveAspectRatio="none" aria-hidden>
          <path fill="rgba(217, 164, 65, .22)" d="M0,238 Q360,300 720,238 T1440,238 T2160,238 T2880,238 L2880,320 L0,320 Z" />
        </svg>
        <div className="visual-content">
          <div className="brand">
            <img className="brand-logo" src="/brand/sahara-logo-white.png" alt="Sahara Hospitality Suite" />
          </div>
          <h1>One operating system for every hotel department.</h1>
          <p>Multi-property control, property-scoped access and complete guest-to-finance workflows — from the front desk to the back office.</p>
          <div className="feature-grid">
            <div><b>20</b><span>Seeded roles</span></div>
            <div><b>14+</b><span>Working modules</span></div>
            <div><b>3</b><span>Access levels</span></div>
            <div><b>100%</b><span>API enforced</span></div>
          </div>
        </div>
      </section>
      <section className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <img className="login-logo" src="/brand/sahara-logo-full.png" alt="Sahara Hospitality Suite" />
          <div>
            <h2>Welcome back</h2>
            <p>Sign in with your hotel account to pick up where you left off.</p>
          </div>
          <label>
            <span>Email address</span>
            <input type="email" value={email} placeholder="you@yourhotel.com" onChange={event => setEmail(event.target.value)} required />
          </label>
          <label>
            <span>Password</span>
            <input type="password" value={password} placeholder="Enter your password" onChange={event => setPassword(event.target.value)} required />
          </label>
          {error && <div className="alert error">{error}</div>}
          <button className="login-button" disabled={loading}>
            <LogIn size={17} aria-hidden />
            {loading ? 'Signing you in…' : 'Sign in'}
          </button>
          <div className="demo-box">
            <strong>Try a demo account</strong>
            <p>Tap any role below — every demo account uses <code>Hotel@123</code>.</p>
            <div className="demo-list">
              {demos.map(([label, value]) => (
                <button type="button" key={value} onClick={() => { setEmail(value); setPassword('Hotel@123'); }}>
                  <span>{label}</span>
                  <small>{value}</small>
                </button>
              ))}
            </div>
          </div>
          <div className="login-credit">
            <a href="https://alshanrijal.com.np" target="_blank" rel="noreferrer"><UserRound size={13} aria-hidden /> Built by Alshan Rijal</a>
            <a href="https://alshanrijal.com.np" target="_blank" rel="noreferrer"><Globe size={13} aria-hidden /> alshanrijal.com.np</a>
            <a href="mailto:contact@alshanrijal.com.np"><Mail size={13} aria-hidden /> contact@alshanrijal.com.np</a>
          </div>
        </form>
      </section>
    </div>
  );
}
