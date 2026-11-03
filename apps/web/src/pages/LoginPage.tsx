import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Globe, UserRound, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../lib/api';
import { useSeo } from '../lib/seo';
import { site } from '../config/site';
import PasswordInput from '../components/PasswordInput';
import Spinner from '../components/Spinner';
import FloatingContact from '../components/FloatingContact';
import SiteJsonLd from '../components/SiteJsonLd';
import { breadcrumbSchema } from '../lib/structuredData';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useSeo({
    title: `Sign in | ${site.name}`,
    description: 'Sign in to manage reservations, housekeeping, folios and every department across your properties.',
    path: '/login',
    jsonLd: breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Sign in', path: '/login' }])
  });

  if (user) return <Navigate to="/" replace />;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <SiteJsonLd />
      <FloatingContact />
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
            <img className="brand-logo" src="/brand/sahara-logo-white.png" alt="Sahara Hospitality Suite" width="1000" height="248" />
          </div>
          <h2 className="visual-title">Run the whole hotel from one calm place.</h2>
          <p>Front desk, housekeeping, restaurants, finance and engineering share a single record — no end-of-shift re-typing, no missing charges.</p>
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
          <img className="login-logo" src="/brand/sahara-logo-full.png" alt="Sahara Hospitality Suite" width="1000" height="262" />
          <div>
            <h1>Welcome back</h1>
            <p>Sign in to pick up your shift exactly where the last one ended.</p>
          </div>
          <label>
            <span>Email address</span>
            <input
              type="email"
              value={email}
              placeholder="name@hotel.com"
              autoComplete="username"
              onChange={event => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            <span>Password</span>
            <PasswordInput value={password} onChange={setPassword} placeholder="Your password" required />
          </label>
          {error && <div className="alert error" role="alert">{error}</div>}
          <button className="login-button" disabled={loading}>
            {loading ? <Spinner /> : <LogIn size={17} aria-hidden />}
            {loading ? 'Signing you in…' : 'Sign in'}
          </button>
          <div className="login-credit">
            <Link to="/help"><ArrowRight size={13} aria-hidden /> Help &amp; FAQ</Link>
            <a href={site.social.website} target="_blank" rel="noreferrer"><UserRound size={13} aria-hidden /> Built by {site.author}</a>
            <a href={`mailto:${site.email}`}><Mail size={13} aria-hidden /> {site.email}</a>
            <a href={site.social.website} target="_blank" rel="noreferrer"><Globe size={13} aria-hidden /> {site.social.website.replace('https://', '')}</a>
          </div>
        </form>
      </section>
    </div>
  );
}
