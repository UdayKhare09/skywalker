import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
  </svg>
);

const EyeIcon = ({ open }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
        <line x1="2" x2="22" y1="2" y2="22"/>
      </>
    )}
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
  ];

  const strength = checks.filter(c => c.met).length;
  const strengthPercent = (strength / checks.length) * 100;
  const strengthColor = strength <= 1 ? 'bg-danger' : strength === 2 ? 'bg-[oklch(0.75_0.15_85)]' : 'bg-accent';

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2 animate-fade-in">
      <div className="h-1 rounded-full bg-surface-border overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${strengthColor}`}
          style={{ width: `${strengthPercent}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {checks.map((check) => (
          <span key={check.label} className={`flex items-center gap-1 text-xs transition-colors duration-300
            ${check.met ? 'text-accent' : 'text-text-tertiary'}`}>
            {check.met && <CheckIcon />}
            {check.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setIsLoading(true);

    try {
      await register(fullName, email, password);
      setIsSuccess(true);
    } catch (err) {
      const data = err.response?.data;
      if (data?.fieldErrors) {
        setFieldErrors(data.fieldErrors);
      } else {
        setError(data?.error || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = '/oauth2/authorization/google';
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-surface-raised rounded-2xl p-8 border border-surface-border text-center shadow-2xl animate-fade-in shadow-[0_0_40px_rgba(0,0,0,0.2)]">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 text-accent">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-3">Check your inbox</h2>
          <p className="text-text-secondary mb-8 leading-relaxed">
            We've sent a verification link to <span className="font-medium text-text-primary">{email}</span>. 
            Please check your email to verify your account before logging in.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full h-11 rounded-xl bg-surface-overlay border border-surface-border font-medium text-sm
                       hover:bg-surface-border active:scale-[0.98] transition-all cursor-pointer"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden items-end p-12">
        <div className="absolute top-[10%] right-[15%] w-80 h-80 rounded-full bg-[oklch(0.5_0.15_280)]/20 blur-[100px]"
             style={{ animation: 'pulse-glow 7s ease-in-out infinite' }} />
        <div className="absolute bottom-[15%] left-[15%] w-60 h-60 rounded-full bg-accent/20 blur-[80px]"
             style={{ animation: 'pulse-glow 9s ease-in-out infinite 3s' }} />

        <div className="absolute inset-0 opacity-[0.04]"
             style={{
               backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                 linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
               backgroundSize: '60px 60px'
             }} />

        <div className="relative z-10 max-w-md">
          <div className="animate-slide-up">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                  <path d="M12 2L2 7l10 5 10-5-10-5Z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-lg font-semibold tracking-tight">Skywalker</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight leading-[1.1] mb-4">
              Start building<br />
              <span className="text-text-secondary">in seconds.</span>
            </h1>
            <p className="text-text-secondary text-base leading-relaxed">
              Create your account and get immediate access. 
              No credit card required, no setup hassle.
            </p>
          </div>

          <div className="mt-12 space-y-3 animate-slide-up stagger-2">
            {['Multiple authentication methods', 'Account linking built-in', 'Enterprise-grade security'].map((f, i) => (
              <div key={f} className="flex items-center gap-3 text-sm text-text-secondary">
                <div className="w-5 h-5 rounded-md bg-accent/15 border border-accent/20 flex items-center justify-center text-accent">
                  <CheckIcon />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center gap-3 mb-10 animate-slide-up">
            <div className="w-9 h-9 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                <path d="M12 2L2 7l10 5 10-5-10-5Z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-base font-semibold tracking-tight">Skywalker</span>
          </div>

          <div className="animate-slide-up stagger-1">
            <h2 className="text-2xl font-semibold tracking-tight mb-1">Create your account</h2>
            <p className="text-text-secondary text-sm mb-8">Get started — it only takes a moment</p>
          </div>

          <button
            id="google-signup-btn"
            onClick={handleGoogleSignup}
            className="animate-slide-up stagger-2 w-full flex items-center justify-center gap-3 h-11 rounded-xl
                       bg-surface-raised border border-surface-border
                       text-sm font-medium text-text-primary
                       hover:bg-surface-overlay hover:border-text-tertiary
                       active:scale-[0.98]
                       transition-all duration-200 cursor-pointer mb-6"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="animate-slide-up stagger-2 flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-surface-border" />
            <span className="text-xs text-text-tertiary uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-surface-border" />
          </div>

          {error && (
            <div className="animate-fade-in mb-4 px-4 py-3 rounded-xl bg-danger-muted border border-danger/20 text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="animate-slide-up stagger-3">
              <label htmlFor="fullName" className="block text-sm font-medium text-text-secondary mb-1.5">Full name</label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Luke Skywalker"
                className={`w-full h-11 px-4 rounded-xl bg-surface-raised border text-sm text-text-primary
                           placeholder:text-text-tertiary
                           focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50
                           transition-all duration-200
                           ${fieldErrors.fullName ? 'border-danger' : 'border-surface-border'}`}
              />
              {fieldErrors.fullName && <p className="mt-1 text-xs text-danger">{fieldErrors.fullName}</p>}
            </div>

            <div className="animate-slide-up stagger-4">
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="luke@jedi.com"
                className={`w-full h-11 px-4 rounded-xl bg-surface-raised border text-sm text-text-primary
                           placeholder:text-text-tertiary
                           focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50
                           transition-all duration-200
                           ${fieldErrors.email ? 'border-danger' : 'border-surface-border'}`}
              />
              {fieldErrors.email && <p className="mt-1 text-xs text-danger">{fieldErrors.email}</p>}
            </div>

            <div className="animate-slide-up stagger-5">
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full h-11 px-4 pr-11 rounded-xl bg-surface-raised border text-sm text-text-primary
                             placeholder:text-text-tertiary
                             focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50
                             transition-all duration-200
                             ${fieldErrors.password ? 'border-danger' : 'border-surface-border'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-danger">{fieldErrors.password}</p>}
              <PasswordStrength password={password} />
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              disabled={isLoading}
              className="animate-slide-up stagger-6 w-full h-11 rounded-xl bg-accent text-surface font-semibold text-sm
                         hover:bg-accent-hover active:scale-[0.98]
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200 cursor-pointer
                         shadow-[0_0_20px_oklch(0.72_0.19_155_/_0.25)]
                         hover:shadow-[0_0_30px_oklch(0.72_0.19_155_/_0.35)]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin" />
                  Creating account…
                </div>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="animate-slide-up stagger-6 mt-6 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:text-accent-hover font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
