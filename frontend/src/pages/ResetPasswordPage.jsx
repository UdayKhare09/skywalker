import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Eye, EyeOff, Check, Layers, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const CheckIcon = () => <Check size={14} />;

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

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Validate token exists
  const tokenMissing = !token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post(`/api/auth/reset-password?token=${encodeURIComponent(token)}&newPassword=${encodeURIComponent(password)}`);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed. The link may be invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenMissing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-surface-raised rounded-2xl p-8 border border-surface-border text-center shadow-2xl animate-fade-in">
          <div className="w-12 h-12 bg-danger/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <XCircle size={24} className="text-danger" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-3">Invalid Reset Link</h2>
          <p className="text-text-secondary mb-8">This password reset link is missing or malformed.</p>
          <Link to="/forgot-password"
            className="inline-flex items-center justify-center w-full h-11 rounded-xl bg-accent text-surface font-semibold text-sm hover:bg-accent-hover active:scale-[0.98] transition-all">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-surface-raised rounded-2xl p-8 border border-surface-border text-center shadow-2xl animate-fade-in shadow-[0_0_40px_rgba(0,0,0,0.2)]">
          <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={24} className="text-accent" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-3">Password Updated!</h2>
          <p className="text-text-secondary mb-8 leading-relaxed">
            Your password has been changed successfully. You can now sign in with your new password.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full h-11 rounded-xl bg-accent text-surface font-semibold text-sm
                       hover:bg-accent-hover active:scale-[0.98] transition-all cursor-pointer
                       shadow-[0_0_20px_oklch(0.72_0.19_155_/_0.25)]"
          >
            Continue to Login
          </button>
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
              <Layers size={20} className="text-accent" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Skywalker</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight leading-[1.1] mb-4">
            Choose a new<br />
            <span className="text-text-secondary">strong password.</span>
          </h1>
          <p className="text-text-secondary text-base leading-relaxed">
            Make it memorable but hard to guess. Use a mix of uppercase letters, numbers, and symbols for best security.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 animate-slide-up">
            <div className="w-9 h-9 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
              <Layers size={16} className="text-accent" />
            </div>
            <span className="text-base font-semibold tracking-tight">Skywalker</span>
          </div>

          <div className="animate-slide-up stagger-1">
            <h2 className="text-2xl font-semibold tracking-tight mb-1">Set new password</h2>
            <p className="text-text-secondary text-sm mb-8">Must be at least 8 characters</p>
          </div>

          {error && (
            <div className="animate-fade-in mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-danger-muted border border-danger/20 text-sm text-danger">
              <AlertCircle size={14} className="shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="animate-slide-up stagger-2">
              <label htmlFor="new-password" className="block text-sm font-medium text-text-secondary mb-1.5">
                New password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-4 pr-11 rounded-xl bg-surface-raised border border-surface-border text-sm text-text-primary
                             placeholder:text-text-tertiary
                             focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50
                             transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            {/* Confirm Password */}
            <div className="animate-slide-up stagger-3">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-text-secondary mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full h-11 px-4 pr-11 rounded-xl bg-surface-raised border text-sm text-text-primary
                             placeholder:text-text-tertiary
                             focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50
                             transition-all duration-200
                             ${confirmPassword && password !== confirmPassword ? 'border-danger' : 'border-surface-border'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-danger">Passwords do not match</p>
              )}
            </div>

            <button
              id="reset-password-btn"
              type="submit"
              disabled={isLoading || !password || !confirmPassword}
              className="animate-slide-up stagger-4 w-full h-11 rounded-xl bg-accent text-surface font-semibold text-sm
                         hover:bg-accent-hover active:scale-[0.98]
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200 cursor-pointer
                         shadow-[0_0_20px_oklch(0.72_0.19_155_/_0.25)]
                         hover:shadow-[0_0_30px_oklch(0.72_0.19_155_/_0.35)]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin" />
                  Resetting…
                </div>
              ) : (
                'Reset password'
              )}
            </button>
          </form>

          <p className="animate-slide-up stagger-5 mt-6 text-center text-sm text-text-secondary">
            <Link to="/forgot-password" className="text-accent hover:text-accent-hover font-medium transition-colors">
              Request a new link
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
