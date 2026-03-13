import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PasskeyManager from '../components/PasskeyManager';
import api from '../api/axios';

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
  </svg>
);

const KeyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1h1v-1h1a1 1 0 0 0 .707-.293l.586-.586A8 8 0 1 0 2.586 17.414Z"/>
    <circle cx="16.5" cy="7.5" r="1.5"/>
  </svg>
);

const LinkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

const LogOutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" x2="9" y1="12" y2="12"/>
  </svg>
);

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

const EyeIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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

function PasswordStrengthBar({ password }) {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
  ];
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
      {strength > 0 && (
        <p className={`text-xs ${colors[strength].replace('bg-', 'text-')}`}>{labels[strength]}</p>
      )}
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Password updated successfully!
          </div>
        )}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-danger-muted border border-danger/20 text-sm text-danger animate-fade-in">
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
                  <EyeIcon open={showCurrent} />
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
                <EyeIcon open={showNew} />
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
                <EyeIcon open={showConfirm} />
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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-surface/80 border-b border-surface-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                <path d="M12 2L2 7l10 5 10-5-10-5Z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight">Skywalker</span>
          </div>

          <button
            id="logout-btn"
            onClick={handleLogout}
            className="flex items-center gap-2 h-9 px-4 rounded-lg
                       text-sm text-text-secondary
                       hover:text-text-primary hover:bg-surface-raised
                       active:scale-[0.97]
                       transition-all duration-200 cursor-pointer"
          >
            <LogOutIcon />
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Profile header */}
        <div className="animate-slide-up flex items-center gap-5 mb-10">
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
        <div className="animate-slide-up stagger-1 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
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
            <div key={stat.label} className="p-4 rounded-2xl bg-surface-raised border border-surface-border">
              <p className="text-xs text-text-tertiary mb-1">{stat.label}</p>
              <p className={`text-lg font-semibold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-text-secondary mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Auth methods */}
        <div className="animate-slide-up stagger-2">
          <h2 className="text-base font-semibold mb-1">Authentication methods</h2>
          <p className="text-sm text-text-secondary mb-5">Manage how you sign in to your account</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AuthMethodCard
              icon={<KeyIcon />}
              title="Password"
              description="Classic email and password authentication with BCrypt hashing."
              status={user?.hasPassword}
              statusLabel={user?.hasPassword ? 'Active' : 'Not set'}
            />
            <AuthMethodCard
              icon={<LinkIcon />}
              title="Google OAuth"
              description="Sign in with your Google account. Linked automatically by email."
              status={user?.hasOAuth2}
              statusLabel={user?.hasOAuth2 ? 'Linked' : 'Not linked'}
            />
            <AuthMethodCard
              icon={<ShieldIcon />}
              title="Passkeys"
              description="Passwordless authentication with biometrics via WebAuthn/FIDO2."
              status={user?.hasPasskey}
              statusLabel={user?.hasPasskey ? 'Registered' : 'Not set up'}
            />
          </div>
        </div>

        {/* Passkey management */}
        <PasskeyManager onPasskeyChange={fetchUser} />

        {/* Change/Set password */}
        <ChangePasswordSection hasPassword={user?.hasPassword} />

        {/* Activity / info section */}
        <div className="animate-slide-up stagger-3 mt-10 p-6 rounded-2xl bg-surface-raised border border-surface-border">
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
