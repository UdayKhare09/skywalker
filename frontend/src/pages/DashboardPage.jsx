import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PasskeyManager from '../components/PasskeyManager';
import api from '../api/axios';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Shield, Key, Link2, LogOut, Eye, EyeOff,
  Layers, AlertCircle, CheckCircle, Mail, Smartphone,
  ScanLine, ToggleLeft, ToggleRight, Copy, RefreshCw
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

function StatusBadge({ active, label }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
      ${active
        ? 'bg-accent/15 text-accent border border-accent/20'
        : 'bg-surface-overlay text-text-tertiary border border-surface-border'
      }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-accent' : 'bg-text-tertiary'}`} />
      {label}
    </span>
  );
}

function AuthMethodCard({ icon, title, description, status, statusLabel }) {
  return (
    <div className="group relative p-5 rounded-2xl bg-surface-raised border border-surface-border
                    hover:border-surface-overlay transition-all duration-300
                    hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border
          ${status
            ? 'bg-accent/10 border-accent/20 text-accent'
            : 'bg-surface-overlay border-surface-border text-text-tertiary'
          }`}>
          {icon}
        </div>
        <StatusBadge active={status} label={statusLabel} />
      </div>
      <h3 className="text-sm font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-xs text-text-secondary leading-relaxed">{description}</p>
    </div>
  );
}

function PasswordStrengthBar({ password }) {
  if (!password) return null;
  const checks = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password)];
  const strength = checks.filter(Boolean).length;
  const colors = ['bg-danger', 'bg-[oklch(0.75_0.15_85)]', 'bg-[oklch(0.75_0.15_85)]', 'bg-accent'];
  const labels = ['', 'Weak', 'Fair', 'Strong'];
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1,2,3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? colors[strength] : 'bg-surface-border'}`} />
        ))}
      </div>
      {strength > 0 && <p className={`text-xs ${colors[strength].replace('bg-','text-')}`}>{labels[strength]}</p>}
    </div>
  );
}

/* ── Toggle switch UI component ───────────────────────────────────────────── */
function Toggle({ enabled, onToggle, disabled, loading }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled || loading}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 cursor-pointer
                  disabled:opacity-40 disabled:cursor-not-allowed
                  ${enabled ? 'bg-accent' : 'bg-surface-border'}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300
                        ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

/* ── MFA Settings Section ─────────────────────────────────────────────────── */
function MfaSettingsSection() {
  const [status, setStatus]         = useState(null);  // MfaStatusResponse
  const [loading, setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  // TOTP setup flow
  const [totpSetup, setTotpSetup]   = useState(null);  // { qrCodeBase64, secret }
  const [totpCode, setTotpCode]     = useState('');
  const [showSecret, setShowSecret] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/api/mfa/status');
      setStatus(res.data);
    } catch {/* ignore */}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStatus(); }, []);

  const act = async (label, fn) => {
    setActionLoading(label);
    setError(''); setSuccess('');
    try {
      await fn();
      await fetchStatus();
      setSuccess({
        'email-on':    'Email OTP enabled.',
        'email-off':   'Email OTP disabled.',
        'totp-setup':  'Scan the QR code with your authenticator app.',
        'totp-confirm':'Authenticator app connected!',
        'totp-off':    'TOTP disabled.',
        'pwd-off':     'Password login disabled.',
        'pwd-on':      'Password login re-enabled.',
      }[label] || 'Done.');
    } catch (e) {
      setError(e.response?.data?.error || e.response?.data?.message || 'Action failed.');
    } finally { setActionLoading(''); }
  };

  const toggleEmailOtp = () => act(
    status?.emailOtpEnabled ? 'email-off' : 'email-on',
    () => api.post(status?.emailOtpEnabled ? '/api/mfa/email-otp/disable' : '/api/mfa/email-otp/enable')
  );

  const startTotpSetup = () => act('totp-setup', async () => {
    const res = await api.post('/api/mfa/totp/setup');
    setTotpSetup(res.data);
    setTotpCode('');
  });

  const confirmTotp = () => act('totp-confirm', async () => {
    await api.post(`/api/mfa/totp/confirm?code=${totpCode}`);
    setTotpSetup(null);
    setTotpCode('');
  });

  const disableTotp = () => act('totp-off', () => api.post('/api/mfa/totp/disable'));

  const togglePasswordLogin = () => act(
    status?.passwordLoginDisabled ? 'pwd-on' : 'pwd-off',
    () => api.post(status?.passwordLoginDisabled ? '/api/mfa/password-login/enable' : '/api/mfa/password-login/disable')
  );

  if (loading) {
    return (
      <div className="mt-8">
        <div className="h-5 w-40 rounded shimmer mb-4" />
        <div className="h-44 rounded-2xl shimmer" />
      </div>
    );
  }

  const isLoading = (key) => actionLoading === key;

  return (
    <div className="mt-8">
      <h2 className="text-base font-semibold mb-1">Multi-factor authentication</h2>
      <p className="text-sm text-text-secondary mb-5">Add extra verification steps to protect your account.</p>

      <div className="rounded-2xl bg-surface-raised border border-surface-border overflow-hidden">
        {/* Feedback banners */}
        {(error || success) && (
          <div className={`flex items-center gap-2 px-5 py-3 text-sm border-b
            ${ error
                ? 'bg-danger-muted border-danger/20 text-danger'
                : 'bg-accent/10 border-accent/20 text-accent' }`}>
            {error ? <AlertCircle size={14}/> : <CheckCircle size={14}/>}
            {error || success}
          </div>
        )}

        {/* ── Email OTP ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-surface-border">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
            ${status?.emailOtpEnabled ? 'bg-accent/10 text-accent' : 'bg-surface-overlay text-text-tertiary'}`}>
            <Mail size={17}/>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Email OTP</p>
            <p className="text-xs text-text-secondary mt-0.5">Receive a 6-character code by email on every login</p>
          </div>
          {isLoading('email-on') || isLoading('email-off')
            ? <RefreshCw size={16} className="animate-spin text-text-tertiary"/>
            : <Toggle enabled={!!status?.emailOtpEnabled} onToggle={toggleEmailOtp}/>}
        </div>

        {/* ── TOTP ──────────────────────────────────────────────────────────── */}
        <div className="px-5 py-4 border-b border-surface-border">
          <div className="flex items-center gap-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
              ${status?.totpEnabled && status?.totpConfirmed ? 'bg-accent/10 text-accent' : 'bg-surface-overlay text-text-tertiary'}`}>
              <Smartphone size={17}/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Authenticator app (TOTP)</p>
              <p className="text-xs text-text-secondary mt-0.5">
                {status?.totpEnabled && status?.totpConfirmed
                  ? 'Connected — Google Authenticator / Authy / etc.'
                  : 'Use any TOTP app like Google Authenticator or Authy'}
              </p>
            </div>
            {isLoading('totp-setup') || isLoading('totp-off')
              ? <RefreshCw size={16} className="animate-spin text-text-tertiary"/>
              : status?.totpEnabled && status?.totpConfirmed
                ? <button onClick={disableTotp}
                    className="text-xs text-danger hover:underline cursor-pointer transition-colors">
                    Remove
                  </button>
                : !totpSetup && (
                    <button onClick={startTotpSetup}
                      className="h-8 px-3 rounded-lg bg-accent/15 border border-accent/25 text-accent text-xs font-medium
                                 hover:bg-accent/25 transition-colors cursor-pointer">
                      Set up
                    </button>
                  )}
          </div>

          {/* QR Setup wizard */}
          {totpSetup && (
            <div className="mt-4 p-4 rounded-xl bg-surface border border-surface-border animate-scale-in">
              <div className="flex items-start gap-4">
                {/* QR Code */}
                <div className="shrink-0">
                  <img src={totpSetup.qrCodeBase64} alt="TOTP QR Code"
                    className="w-36 h-36 rounded-lg bg-white p-1"/>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-text-secondary mb-1">1. Scan with your authenticator app</p>
                    <p className="text-xs text-text-tertiary">Open Google Authenticator, Authy, or any TOTP app and scan the QR code.</p>
                  </div>
                  {/* Manual secret */}
                  <div>
                    <p className="text-xs font-medium text-text-secondary mb-1">Or enter the key manually:</p>
                    <div className="flex items-center gap-2">
                      <code className={`text-xs font-mono bg-surface-overlay px-2 py-1 rounded border border-surface-border tracking-wider
                        ${showSecret ? '' : 'blur-sm select-none'}`}>
                        {totpSetup.secret}
                      </code>
                      <button onClick={() => setShowSecret(s => !s)}
                        className="text-text-tertiary hover:text-text-secondary cursor-pointer transition-colors">
                        {showSecret ? <EyeOff size={13}/> : <Eye size={13}/>}
                      </button>
                      <button onClick={() => navigator.clipboard?.writeText(totpSetup.secret)}
                        className="text-text-tertiary hover:text-accent cursor-pointer transition-colors">
                        <Copy size={13}/>
                      </button>
                    </div>
                  </div>
                  {/* Verify code */}
                  <div>
                    <p className="text-xs font-medium text-text-secondary mb-1.5">2. Enter the 6-digit code to confirm</p>
                    <div className="flex gap-2">
                      <input
                        id="totp-confirm-code"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        autoFocus
                        value={totpCode}
                        onChange={e => setTotpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="w-28 h-9 px-3 rounded-lg bg-surface border border-surface-border text-sm font-mono
                                   text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-accent/40
                                   focus:border-accent/50 transition-all"
                      />
                      <button onClick={confirmTotp}
                        disabled={totpCode.length < 6 || isLoading('totp-confirm')}
                        className="h-9 px-4 rounded-lg bg-accent text-surface text-xs font-semibold
                                   hover:bg-accent-hover active:scale-[0.97] disabled:opacity-40
                                   disabled:cursor-not-allowed cursor-pointer transition-all">
                        {isLoading('totp-confirm') ? <RefreshCw size={13} className="animate-spin"/> : 'Verify'}
                      </button>
                      <button onClick={() => setTotpSetup(null)}
                        className="h-9 px-3 rounded-lg border border-surface-border text-xs text-text-secondary
                                   hover:bg-surface-overlay cursor-pointer transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Passkeys note ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-surface-border">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
            bg-surface-overlay text-text-tertiary`}>
            <ScanLine size={17}/>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Passkeys</p>
            <p className="text-xs text-text-secondary mt-0.5">Managed above — passkeys are phishing-resistant and replace passwords</p>
          </div>
          <span className="text-xs text-text-tertiary italic">See Passkeys section</span>
        </div>

        {/* ── Disable password login ─────────────────────────────────────────── */}
        <div className="flex items-center gap-4 px-5 py-4">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
            ${status?.passwordLoginDisabled ? 'bg-danger/15 text-danger' : 'bg-surface-overlay text-text-tertiary'}`}>
            <Key size={17}/>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Disable password login</p>
            <p className="text-xs text-text-secondary mt-0.5">
              {status?.passwordLoginDisabled
                ? '⚠ Password login is disabled — you must use MFA or passkeys'
                : 'Requires at least one MFA method to be active first'}
            </p>
          </div>
          {isLoading('pwd-on') || isLoading('pwd-off')
            ? <RefreshCw size={16} className="animate-spin text-text-tertiary"/>
            : <Toggle
                enabled={!!status?.passwordLoginDisabled}
                onToggle={togglePasswordLogin}
                disabled={!status?.emailOtpEnabled && !status?.totpEnabled && !status?.passwordLoginDisabled}
              />}
        </div>
      </div>
    </div>
  );
}

function ChangePasswordSection({ hasPassword }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent]         = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [isLoading, setIsLoading]             = useState(false);
  const [error, setError]                     = useState('');
  const [success, setSuccess]                 = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (hasPassword && newPassword === currentPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/api/auth/change-password', {
        currentPassword: hasPassword ? currentPassword : null,
        newPassword,
      });
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-slide-up stagger-3 mt-8">
      <h2 className="text-base font-semibold mb-1">{hasPassword ? 'Change password' : 'Set a password'}</h2>
      <p className="text-sm text-text-secondary mb-5">
        {hasPassword ? 'Update your password to keep your account secure.' : 'Add a password login method to your account.'}
      </p>

      <div className="p-6 rounded-2xl bg-surface-raised border border-surface-border">
        {success && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-accent/10 border border-accent/25 text-sm text-accent animate-fade-in flex items-center gap-2">
            <CheckCircle size={16} className="shrink-0" />
            Password updated successfully!
          </div>
        )}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-danger-muted border border-danger/20 text-sm text-danger animate-fade-in flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
          {hasPassword && (
            <div>
              <label htmlFor="current-pass" className="block text-sm font-medium text-text-secondary mb-1.5">Current password</label>
              <div className="relative">
                <input
                  id="current-pass"
                  type={showCurrent ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-4 pr-11 rounded-xl bg-surface border border-surface-border text-sm text-text-primary
                             placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50
                             transition-all duration-200"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer">
                  {showCurrent ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="new-pass" className="block text-sm font-medium text-text-secondary mb-1.5">New password</label>
            <div className="relative">
              <input
                id="new-pass"
                type={showNew ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-4 pr-11 rounded-xl bg-surface border border-surface-border text-sm text-text-primary
                           placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50
                           transition-all duration-200"
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer">
                {showNew ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
            <PasswordStrengthBar password={newPassword} />
          </div>

          <div>
            <label htmlFor="confirm-pass" className="block text-sm font-medium text-text-secondary mb-1.5">Confirm new password</label>
            <div className="relative">
              <input
                id="confirm-pass"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full h-11 px-4 pr-11 rounded-xl bg-surface border text-sm text-text-primary
                           placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50
                           transition-all duration-200
                           ${confirmPassword && newPassword !== confirmPassword ? 'border-danger' : 'border-surface-border'}`}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer">
                {showConfirm ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="mt-1 text-xs text-danger">Passwords do not match</p>
            )}
          </div>

          <button
            id="change-password-btn"
            type="submit"
            disabled={isLoading || !newPassword || !confirmPassword || (hasPassword && !currentPassword)}
            className="w-full h-11 rounded-xl bg-accent text-surface font-semibold text-sm
                       hover:bg-accent-hover active:scale-[0.98]
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all duration-200 cursor-pointer
                       shadow-[0_0_20px_oklch(0.72_0.19_155_/_0.2)]"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin" />
                Saving…
              </div>
            ) : (
              hasPassword ? 'Change password' : 'Set password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout, fetchUser } = useAuth();
  const navigate = useNavigate();
  const mainRef  = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.from('[data-gsap="hero"]', { opacity: 0, y: 30, duration: 0.7, ease: 'power3.out' });
      // Stagger stats
      gsap.from('[data-gsap="stat"]', { opacity: 0, y: 20, stagger: 0.1, duration: 0.55, ease: 'power3.out', delay: 0.2 });
      // ScrollTrigger sections
      gsap.utils.toArray('[data-gsap="section"]').forEach((el) => {
        gsap.from(el, {
          opacity: 0, y: 40,
          duration: 0.65, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
        });
      });
    }, mainRef);
    return () => ctx.revert();
  }, []);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const initials = user?.fullName
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="min-h-screen" ref={mainRef}>
      {/* Top bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-surface/80 border-b border-surface-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
              <Layers size={15} className="text-accent" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Skywalker</span>
          </div>
          <button id="logout-btn" onClick={handleLogout}
            className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm text-text-secondary
                       hover:text-text-primary hover:bg-surface-raised active:scale-[0.97]
                       transition-all duration-200 cursor-pointer">
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Profile header */}
        <div data-gsap="hero" className="flex items-center gap-5 mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/30 to-[oklch(0.5_0.15_280)]/30
                          border border-surface-border flex items-center justify-center
                          text-xl font-bold text-text-primary">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{user?.fullName}</h1>
            <p className="text-sm text-text-secondary mt-0.5">{user?.email}</p>
            {memberSince && (
              <p className="text-xs text-text-tertiary mt-1">Member since {memberSince}</p>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            {
              label: 'Security score',
              value: [user?.hasPassword, user?.hasOAuth2, user?.hasPasskey].filter(Boolean).length >= 2 ? 'Strong' : 'Fair',
              sub: `${[user?.hasPassword, user?.hasOAuth2, user?.hasPasskey].filter(Boolean).length} of 3 methods active`,
              color: [user?.hasPassword, user?.hasOAuth2, user?.hasPasskey].filter(Boolean).length >= 2 ? 'text-accent' : 'text-[oklch(0.75_0.15_85)]'
            },
            {
              label: 'Role',
              value: user?.role?.replace('ROLE_', '') || 'User',
              sub: 'Account type',
              color: 'text-text-primary'
            },
            {
              label: 'Account ID',
              value: user?.id?.slice(0, 8) + '…',
              sub: 'Unique identifier',
              color: 'text-text-primary'
            }
          ].map((stat) => (
            <div data-gsap="stat" key={stat.label} className="p-4 rounded-2xl bg-surface-raised border border-surface-border">
              <p className="text-xs text-text-tertiary mb-1">{stat.label}</p>
              <p className={`text-lg font-semibold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-text-secondary mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Auth methods */}
        <div data-gsap="section">
          <h2 className="text-base font-semibold mb-1">Authentication methods</h2>
          <p className="text-sm text-text-secondary mb-5">Manage how you sign in to your account</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AuthMethodCard icon={<Key size={18}/>} title="Password"
              description="Classic email and password with BCrypt hashing."
              status={user?.hasPassword} statusLabel={user?.hasPassword ? 'Active' : 'Not set'} />
            <AuthMethodCard icon={<Link2 size={18}/>} title="Google OAuth"
              description="Sign in with your Google account, linked by email."
              status={user?.hasOAuth2} statusLabel={user?.hasOAuth2 ? 'Linked' : 'Not linked'} />
            <AuthMethodCard icon={<Shield size={18}/>} title="Passkeys"
              description="Passwordless biometric auth via WebAuthn/FIDO2."
              status={user?.hasPasskey} statusLabel={user?.hasPasskey ? 'Registered' : 'Not set up'} />
          </div>
        </div>

        {/* Passkey management */}
        <div data-gsap="section">
          <PasskeyManager onPasskeyChange={fetchUser} />
        </div>

        {/* MFA Settings */}
        <div data-gsap="section">
          <MfaSettingsSection />
        </div>

        {/* Change/Set password */}
        <div data-gsap="section">
          <ChangePasswordSection hasPassword={user?.hasPassword} />
        </div>

        {/* How it works */}
        <div data-gsap="section" className="mt-10 p-6 rounded-2xl bg-surface-raised border border-surface-border">
          <h3 className="text-sm font-semibold mb-3">How it works</h3>
          <div className="space-y-3">
            {[
              { step: '01', text: 'All auth methods are tied to a single email identity.' },
              { step: '02', text: 'JWT tokens are stored in HTTP-only cookies — never exposed to JavaScript.' },
              { step: '03', text: 'Signing in with Google auto-links to your existing account if the email matches.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-3 items-start">
                <span className="text-xs font-mono text-accent bg-accent/10 rounded-md px-2 py-0.5 border border-accent/15">
                  {item.step}
                </span>
                <p className="text-sm text-text-secondary leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
