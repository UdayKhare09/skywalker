import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const MailIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post(`/api/auth/forgot-password?email=${encodeURIComponent(email)}`);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-surface-raised rounded-2xl p-8 border border-surface-border text-center shadow-2xl animate-fade-in shadow-[0_0_40px_rgba(0,0,0,0.2)]">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <MailIcon />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-3">Check your inbox</h2>
          <p className="text-text-secondary mb-8 leading-relaxed">
            If an account exists for <span className="font-medium text-text-primary">{email}</span>, 
            we've sent a password reset link. It expires in 1 hour.
          </p>
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-surface-overlay border border-surface-border font-medium text-sm hover:bg-surface-border active:scale-[0.98] transition-all"
          >
            <ArrowLeftIcon />
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden items-end p-12">
        <div className="absolute top-[10%] right-[15%] w-80 h-80 rounded-full bg-[oklch(0.5_0.15_280)]/20 blur-[100px]"
             style={{ animation: 'pulse-glow 7s ease-in-out infinite' }} />
        <div className="absolute bottom-[20%] left-[10%] w-60 h-60 rounded-full bg-accent/20 blur-[80px]"
             style={{ animation: 'pulse-glow 9s ease-in-out infinite 3s' }} />
        <div className="absolute inset-0 opacity-[0.04]"
             style={{
               backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                 linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
               backgroundSize: '60px 60px'
             }} />
        <div className="relative z-10 max-w-md animate-slide-up">
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
            Forgot your<br />
            <span className="text-text-secondary">password?</span>
          </h1>
          <p className="text-text-secondary text-base leading-relaxed">
            No worries — it happens to the best of us. Enter your email and we'll send you a secure link to reset it.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
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
            <h2 className="text-2xl font-semibold tracking-tight mb-1">Reset your password</h2>
            <p className="text-text-secondary text-sm mb-8">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {error && (
            <div className="animate-fade-in mb-4 px-4 py-3 rounded-xl bg-danger-muted border border-danger/20 text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up stagger-2">
            <div>
              <label htmlFor="fp-email" className="block text-sm font-medium text-text-secondary mb-1.5">
                Email address
              </label>
              <input
                id="fp-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 px-4 rounded-xl bg-surface-raised border border-surface-border text-sm text-text-primary
                           placeholder:text-text-tertiary
                           focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50
                           transition-all duration-200"
              />
            </div>

            <button
              id="forgot-password-btn"
              type="submit"
              disabled={isLoading || !email}
              className="w-full h-11 rounded-xl bg-accent text-surface font-semibold text-sm
                         hover:bg-accent-hover active:scale-[0.98]
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200 cursor-pointer
                         shadow-[0_0_20px_oklch(0.72_0.19_155_/_0.25)]
                         hover:shadow-[0_0_30px_oklch(0.72_0.19_155_/_0.35)]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin" />
                  Sending link…
                </div>
              ) : (
                'Send reset link'
              )}
            </button>
          </form>

          <p className="animate-slide-up stagger-3 mt-6 text-center text-sm text-text-secondary">
            Remember it now?{' '}
            <Link to="/login" className="text-accent hover:text-accent-hover font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
