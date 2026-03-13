import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { gsap } from 'gsap';
import {
  Eye, EyeOff, Fingerprint, ArrowRight,
  Layers, ShieldCheck, Mail, AlertCircle, KeyRound
} from 'lucide-react';

/* ── Google brand SVG (not in Lucide) ─────────────────────────────────────── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908C16.618 14.083 17.64 11.773 17.64 9.2Z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
  </svg>
);

/* ── MFA Challenge step ────────────────────────────────────────────────────── */
function MfaChallenge({ pendingToken, availableMethods, onSuccess }) {
  const [method, setMethod]       = useState(availableMethods[0]);
  const [code, setCode]           = useState('');
  const [otpSent, setOtpSent]     = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');
  const containerRef              = useRef(null);

  useEffect(() => {
    gsap.fromTo(containerRef.current,
      { opacity: 0, scale: 0.94 },
      { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.5)' }
    );
  }, []);

  const sendOtp = async () => {
    setError('');
    setIsLoading(true);
    try {
      await api.post(`/api/mfa/send-email-otp?pendingToken=${pendingToken}`);
      setOtpSent(true);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to send code.');
    } finally {
      setIsLoading(false);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.post('/api/mfa/complete', { pendingToken, method, code });
      onSuccess();
    } catch (e) {
      setError(e.response?.data?.error || 'Verification failed.');
      gsap.fromTo(containerRef.current, { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(3,0.3)' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="w-full max-w-[380px] bg-surface-raised border border-surface-border rounded-2xl p-8 shadow-2xl shadow-black/40">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center">
          <ShieldCheck size={18} className="text-accent" />
        </div>
        <div>
          <h2 className="text-base font-semibold">Two-factor verification</h2>
          <p className="text-xs text-text-tertiary mt-0.5">Choose a verification method</p>
        </div>
      </div>

      {/* Method switcher */}
      {availableMethods.length > 1 && (
        <div className="flex gap-2 mb-5">
          {availableMethods.map(m => (
            <button key={m} onClick={() => { setMethod(m); setCode(''); setOtpSent(false); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-medium border cursor-pointer transition-all duration-200
                ${method === m ? 'bg-accent/15 border-accent/30 text-accent' : 'bg-surface border-surface-border text-text-secondary hover:text-text-primary hover:bg-surface-overlay'}`}>
              {m === 'email_otp' ? <Mail size={13} /> : <KeyRound size={13} />}
              {m === 'email_otp' ? 'Email OTP' : 'Authenticator'}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-danger-muted border border-danger/20 text-sm text-danger animate-fade-in">
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </div>
      )}

      {method === 'email_otp' && !otpSent ? (
        <button onClick={sendOtp} disabled={isLoading}
          className="w-full h-11 rounded-xl bg-accent text-surface font-semibold text-sm
                     hover:bg-accent-hover active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all cursor-pointer shadow-[0_0_20px_oklch(0.72_0.19_155_/_0.25)]">
          {isLoading ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin" />Sending…</span>
                     : <span className="flex items-center justify-center gap-2"><Mail size={15} />Send code to email</span>}
        </button>
      ) : (
        <form onSubmit={verify} className="space-y-4">
          {method === 'email_otp' && (
            <p className="text-xs text-text-secondary">Check your email for a 6-character code.</p>
          )}
          {method === 'totp' && (
            <p className="text-xs text-text-secondary">Enter the 6-digit code from your authenticator app.</p>
          )}
          <input
            id="mfa-code"
            type="text"
            inputMode={method === 'totp' ? 'numeric' : 'text'}
            autoComplete="one-time-code"
            autoFocus
            maxLength={method === 'email_otp' ? 6 : 6}
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder={method === 'email_otp' ? 'AB3X7Y' : '000000'}
            className="w-full h-14 px-4 rounded-xl bg-surface border border-surface-border text-center text-2xl font-mono tracking-[0.4em]
                       text-text-primary placeholder:text-text-tertiary placeholder:text-base placeholder:tracking-normal
                       focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-all"
          />
          <button type="submit" disabled={isLoading || code.length < 6}
            className="w-full h-11 rounded-xl bg-accent text-surface font-semibold text-sm
                       hover:bg-accent-hover active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all cursor-pointer shadow-[0_0_20px_oklch(0.72_0.19_155_/_0.25)]">
            {isLoading ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin" />Verifying…</span>
                       : <span className="flex items-center justify-center gap-2"><ShieldCheck size={15} />Verify</span>}
          </button>
          {method === 'email_otp' && (
            <button type="button" onClick={() => { setOtpSent(false); setCode(''); }}
              className="w-full text-xs text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer">
              Didn't receive it? Send again
            </button>
          )}
        </form>
      )}
    </div>
  );
}

/* ── Main LoginPage ────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const [email,          setEmail]          = useState('');
  const [password,       setPassword]       = useState('');
  const [showPassword,   setShowPassword]   = useState(false);
  const [error,          setError]          = useState('');
  const [fieldErrors,    setFieldErrors]    = useState({});
  const [isLoading,      setIsLoading]      = useState(false);
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);
  const [mfaState,       setMfaState]       = useState(null); // { pendingToken, availableMethods }

  const { login, fetchUser } = useAuth();
  const navigate             = useNavigate();
  const formRef              = useRef(null);
  const brandRef             = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-gsap="brand-item"]', {
        opacity: 0, y: 30, stagger: 0.1, duration: 0.7, ease: 'power3.out', delay: 0.1,
      });
      gsap.from('[data-gsap="form-item"]', {
        opacity: 0, y: 20, stagger: 0.07, duration: 0.55, ease: 'power3.out', delay: 0.2,
      });
    });
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setIsLoading(true);
    try {
      const result = await login(email, password);
      if (result?.mfaRequired) {
        setMfaState({ pendingToken: result.pendingToken, availableMethods: result.availableMfaMethods });
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.fieldErrors) {
        setFieldErrors(data.fieldErrors);
      } else {
        setError(data?.error || 'Login failed. Please try again.');
      }
      gsap.fromTo(formRef.current, { x: -6 }, { x: 0, duration: 0.4, ease: 'elastic.out(3,0.3)' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => { window.location.href = '/oauth2/authorization/google'; };

  const handlePasskeyLogin = async () => {
    setError('');
    setIsPasskeyLoading(true);
    try {
      const optionsRes    = await api.get('/api/webauthn/authenticate/options');
      const options       = optionsRes.data;
      const decodeB64     = (s) => { const b = s.replace(/-/g,'+').replace(/_/g,'/'); const p = b.length%4; const pp = p ? b+'='.repeat(4-p) : b; const bin = atob(pp); const arr = new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) arr[i]=bin.charCodeAt(i); return arr.buffer; };
      const credential    = await navigator.credentials.get({ publicKey: { challenge: decodeB64(options.challenge), rpId: options.rpId, timeout: options.timeout, userVerification: options.userVerification, allowCredentials: (options.allowCredentials||[]).map(c=>({...c,id:decodeB64(c.id)})) } });
      const toB64         = (buf) => { const b=new Uint8Array(buf); let s=''; for(let i=0;i<b.length;i++) s+=String.fromCharCode(b[i]); return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); };
      await api.post('/api/webauthn/authenticate', { credentialId: toB64(credential.rawId), authenticatorData: toB64(credential.response.authenticatorData), clientDataJSON: toB64(credential.response.clientDataJSON), signature: toB64(credential.response.signature), userHandle: credential.response.userHandle ? toB64(credential.response.userHandle) : null });
      await fetchUser();
      navigate('/dashboard');
    } catch (err) {
      setError(err.name === 'NotAllowedError' ? 'Passkey authentication was cancelled.' : (err.response?.data?.error || 'Passkey authentication failed.'));
    } finally {
      setIsPasskeyLoading(false);
    }
  };

  const supportsWebAuthn = !!window.PublicKeyCredential;

  /* MFA challenge view */
  if (mfaState) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <MfaChallenge
          pendingToken={mfaState.pendingToken}
          availableMethods={mfaState.availableMethods}
          onSuccess={async () => { await fetchUser(); navigate('/dashboard'); }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left branding panel ──────────────────────────────────────────────── */}
      <div ref={brandRef} className="hidden lg:flex lg:w-[45%] relative overflow-hidden items-end p-12">
        <div className="absolute top-[15%] left-[20%] w-72 h-72 rounded-full bg-accent/20 blur-[100px]"
             style={{ animation: 'pulse-glow 6s ease-in-out infinite' }} />
        <div className="absolute bottom-[20%] right-[10%] w-56 h-56 rounded-full bg-[oklch(0.5_0.15_280)]/20 blur-[80px]"
             style={{ animation: 'pulse-glow 8s ease-in-out infinite 2s' }} />
        <div className="absolute inset-0 opacity-[0.04]"
             style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        <div className="relative z-10 max-w-md">
          <div data-gsap="brand-item" className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
              <Layers size={20} className="text-accent" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Skywalker</span>
          </div>
          <h1 data-gsap="brand-item" className="text-4xl font-bold tracking-tight leading-[1.1] mb-4">
            Authentication<br />
            <span className="text-text-secondary">reimagined.</span>
          </h1>
          <p data-gsap="brand-item" className="text-text-secondary text-base leading-relaxed">
            Passwords, passkeys, social login — unified into one seamless experience.
          </p>
          <div data-gsap="brand-item" className="mt-12 flex gap-6 text-sm text-text-tertiary">
            {[{ dot: true, label: 'End-to-end encrypted' }, { dot: true, label: 'FIDO2 compliant' }].map(i => (
              <div key={i.label} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span>{i.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div ref={formRef} className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div data-gsap="form-item" className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
              <Layers size={16} className="text-accent" />
            </div>
            <span className="text-base font-semibold tracking-tight">Skywalker</span>
          </div>

          <div data-gsap="form-item">
            <h2 className="text-2xl font-semibold tracking-tight mb-1">Welcome back</h2>
            <p className="text-text-secondary text-sm mb-8">Sign in to your account to continue</p>
          </div>

          {/* Social buttons */}
          <div data-gsap="form-item" className="space-y-3 mb-6">
            <button id="google-login-btn" onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 h-11 rounded-xl bg-surface-raised border border-surface-border
                         text-sm font-medium text-text-primary hover:bg-surface-overlay hover:border-text-tertiary
                         active:scale-[0.98] transition-all duration-200 cursor-pointer">
              <GoogleIcon />
              Continue with Google
            </button>
            {supportsWebAuthn && (
              <button id="passkey-login-btn" onClick={handlePasskeyLogin} disabled={isPasskeyLoading}
                className="w-full flex items-center justify-center gap-3 h-11 rounded-xl bg-surface-raised border border-surface-border
                           text-sm font-medium text-text-primary hover:bg-surface-overlay hover:border-text-tertiary
                           active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer">
                {isPasskeyLoading
                  ? <div className="w-4 h-4 border-2 border-text-primary border-t-transparent rounded-full animate-spin" />
                  : <Fingerprint size={16} className="text-text-secondary" />}
                Sign in with passkey
              </button>
            )}
          </div>

          {/* Divider */}
          <div data-gsap="form-item" className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-surface-border" />
            <span className="text-xs text-text-tertiary uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-surface-border" />
          </div>

          {/* Error */}
          {error && (
            <div className="animate-fade-in mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-danger-muted border border-danger/20 text-sm text-danger">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div data-gsap="form-item">
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
              <input id="email" type="email" autoComplete="email" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                className={`w-full h-11 px-4 rounded-xl bg-surface-raised border text-sm text-text-primary
                           placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/40
                           focus:border-accent/50 transition-all duration-200
                           ${fieldErrors.email ? 'border-danger' : 'border-surface-border'}`} />
              {fieldErrors.email && <p className="mt-1 text-xs text-danger">{fieldErrors.email}</p>}
            </div>

            <div data-gsap="form-item">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-medium text-text-secondary">Password</label>
                <Link to="/forgot-password" className="text-xs text-accent hover:text-accent-hover font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password"
                  value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className={`w-full h-11 px-4 pr-11 rounded-xl bg-surface-raised border text-sm text-text-primary
                             placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/40
                             focus:border-accent/50 transition-all duration-200
                             ${fieldErrors.password ? 'border-danger' : 'border-surface-border'}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-danger">{fieldErrors.password}</p>}
            </div>

            <button data-gsap="form-item" id="login-submit-btn" type="submit" disabled={isLoading}
              className="w-full h-11 rounded-xl bg-accent text-surface font-semibold text-sm
                         hover:bg-accent-hover active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200 cursor-pointer
                         shadow-[0_0_20px_oklch(0.72_0.19_155_/_0.25)] hover:shadow-[0_0_30px_oklch(0.72_0.19_155_/_0.35)]">
              {isLoading
                ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin" />Signing in…</span>
                : <span className="flex items-center justify-center gap-2">Sign in <ArrowRight size={15} /></span>}
            </button>
          </form>

          <p data-gsap="form-item" className="mt-6 text-center text-sm text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-accent hover:text-accent-hover font-medium transition-colors">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
