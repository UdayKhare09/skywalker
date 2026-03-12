import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

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

const FingerprintIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/>
    <path d="M14 13.12c0 2.38 0 6.38-1 8.88"/>
    <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/>
    <path d="M2 12a10 10 0 0 1 18-6"/>
    <path d="M2 16h.01"/>
    <path d="M21.8 16c.2-2 .131-5.354 0-6"/>
    <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/>
    <path d="M8.65 22c.21-.66.45-1.32.57-2"/>
    <path d="M9 6.8a6 6 0 0 1 9 5.2v2"/>
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);
  const { login, fetchUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data?.fieldErrors) {
        setFieldErrors(data.fieldErrors);
      } else {
        setError(data?.error || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/oauth2/authorization/google';
  };

  const handlePasskeyLogin = async () => {
    setError('');
    setIsPasskeyLoading(true);

    try {
      // 1. Get authentication options from server
      const optionsRes = await api.get('/api/webauthn/authenticate/options');
      const options = optionsRes.data;

      // Convert base64url challenge to ArrayBuffer
      const challengeStr = options.challenge;
      const base64 = challengeStr.replace(/-/g, '+').replace(/_/g, '/');
      const pad = base64.length % 4;
      const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
      const binary = atob(padded);
      const challengeBytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        challengeBytes[i] = binary.charCodeAt(i);
      }

      // 2. Get credential via browser WebAuthn API
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: challengeBytes.buffer,
          rpId: options.rpId,
          timeout: options.timeout,
          userVerification: options.userVerification,
          allowCredentials: (options.allowCredentials || []).map(cred => ({
            ...cred,
            id: (() => {
              const b = cred.id.replace(/-/g, '+').replace(/_/g, '/');
              const p = b.length % 4;
              const pp = p ? b + '='.repeat(4 - p) : b;
              const bin = atob(pp);
              const bytes = new Uint8Array(bin.length);
              for (let j = 0; j < bin.length; j++) bytes[j] = bin.charCodeAt(j);
              return bytes.buffer;
            })(),
          })),
        },
      });

      // 3. Encode response to base64url
      const toBase64Url = (buffer) => {
        const bytes = new Uint8Array(buffer);
        let bin = '';
        for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
        return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      };

      // 4. Send assertion to server
      await api.post('/api/webauthn/authenticate', {
        credentialId: toBase64Url(credential.rawId),
        authenticatorData: toBase64Url(credential.response.authenticatorData),
        clientDataJSON: toBase64Url(credential.response.clientDataJSON),
        signature: toBase64Url(credential.response.signature),
        userHandle: credential.response.userHandle ? toBase64Url(credential.response.userHandle) : null,
      });

      // 5. Fetch user and navigate
      await fetchUser();
      navigate('/dashboard');

    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Passkey authentication was cancelled.');
      } else {
        setError(err.response?.data?.error || 'Passkey authentication failed.');
      }
    } finally {
      setIsPasskeyLoading(false);
    }
  };

  const supportsWebAuthn = !!window.PublicKeyCredential;

  return (
    <div className="min-h-screen flex">
      {/* Left panel — Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden items-end p-12">
        {/* Animated orbs */}
        <div className="absolute top-[15%] left-[20%] w-72 h-72 rounded-full bg-accent/20 blur-[100px]"
             style={{ animation: 'pulse-glow 6s ease-in-out infinite' }} />
        <div className="absolute bottom-[20%] right-[10%] w-56 h-56 rounded-full bg-[oklch(0.5_0.15_280)]/20 blur-[80px]"
             style={{ animation: 'pulse-glow 8s ease-in-out infinite 2s' }} />
        <div className="absolute top-[50%] left-[50%] w-40 h-40 rounded-full bg-[oklch(0.6_0.12_200)]/15 blur-[60px]"
             style={{ animation: 'pulse-glow 7s ease-in-out infinite 4s' }} />

        {/* Grid pattern */}
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
              Authentication<br />
              <span className="text-text-secondary">reimagined.</span>
            </h1>
            <p className="text-text-secondary text-base leading-relaxed">
              Passwords, passkeys, social login — unified into one seamless experience. 
              Built for the way people actually sign in.
            </p>
          </div>

          <div className="mt-12 flex gap-6 text-sm text-text-tertiary animate-slide-up stagger-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>End-to-end encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>FIDO2 compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — Form */}
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
            <h2 className="text-2xl font-semibold tracking-tight mb-1">Welcome back</h2>
            <p className="text-text-secondary text-sm mb-8">Sign in to your account to continue</p>
          </div>

          {/* Google button */}
          <button
            id="google-login-btn"
            onClick={handleGoogleLogin}
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

          {/* Passkey button */}
          {supportsWebAuthn && (
            <button
              id="passkey-login-btn"
              onClick={handlePasskeyLogin}
              disabled={isPasskeyLoading}
              className="animate-slide-up stagger-2 w-full flex items-center justify-center gap-3 h-11 rounded-xl
                         bg-surface-raised border border-surface-border
                         text-sm font-medium text-text-primary
                         hover:bg-surface-overlay hover:border-text-tertiary
                         active:scale-[0.98]
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200 cursor-pointer mb-6"
            >
              {isPasskeyLoading ? (
                <div className="w-4 h-4 border-2 border-text-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <FingerprintIcon />
              )}
              Sign in with passkey
            </button>
          )}

          {/* Divider */}
          <div className="animate-slide-up stagger-3 flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-surface-border" />
            <span className="text-xs text-text-tertiary uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-surface-border" />
          </div>

          {/* Error */}
          {error && (
            <div className="animate-fade-in mb-4 px-4 py-3 rounded-xl bg-danger-muted border border-danger/20 text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="animate-slide-up stagger-3">
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`w-full h-11 px-4 rounded-xl bg-surface-raised border text-sm text-text-primary
                           placeholder:text-text-tertiary
                           focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50
                           transition-all duration-200
                           ${fieldErrors.email ? 'border-danger' : 'border-surface-border'}`}
              />
              {fieldErrors.email && <p className="mt-1 text-xs text-danger">{fieldErrors.email}</p>}
            </div>

            <div className="animate-slide-up stagger-4">
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
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
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="animate-slide-up stagger-5 w-full h-11 rounded-xl bg-accent text-surface font-semibold text-sm
                         hover:bg-accent-hover active:scale-[0.98]
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200 cursor-pointer
                         shadow-[0_0_20px_oklch(0.72_0.19_155_/_0.25)]
                         hover:shadow-[0_0_30px_oklch(0.72_0.19_155_/_0.35)]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="animate-slide-up stagger-6 mt-6 text-center text-sm text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-accent hover:text-accent-hover font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
