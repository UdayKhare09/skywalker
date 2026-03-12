import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CheckCircleIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const XCircleIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-danger">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState(token ? 'verifying' : 'error');
  const [errorMessage, setErrorMessage] = useState(token ? '' : 'Verification token is missing from the URL.');

  const hasAttempted = useRef(false);

  useEffect(() => {
    if (!token) return;
    if (hasAttempted.current) return;
    hasAttempted.current = true;

    const verifyToken = async () => {
      try {
        await api.post(`/api/auth/verify-email?token=${token}`);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setErrorMessage(err.response?.data?.error || 'Verification failed. The token may be invalid or expired.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
      <div className="w-full max-w-md bg-surface-raised rounded-2xl p-8 border border-surface-border text-center shadow-2xl animate-fade-in shadow-[0_0_40px_rgba(0,0,0,0.2)]">
        
        {status === 'verifying' && (
          <div className="animate-slide-up">
            <div className="w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold tracking-tight mb-3">Verifying your email</h2>
            <p className="text-text-secondary">Please wait a moment...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="animate-slide-up">
            <div className="flex justify-center mb-6">
              <CheckCircleIcon />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-3">Email Verified!</h2>
            <p className="text-text-secondary mb-8 leading-relaxed">
              Your account has been successfully verified. You can now sign in.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full h-11 rounded-xl bg-accent text-surface font-semibold text-sm
                         hover:bg-accent-hover active:scale-[0.98] transition-all cursor-pointer"
            >
              Continue to Login
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="animate-slide-up">
            <div className="flex justify-center mb-6">
              <XCircleIcon />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-3">Verification Failed</h2>
            <p className="text-text-secondary mb-8 leading-relaxed">
              {errorMessage}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full h-11 mb-3 rounded-xl bg-surface-overlay border border-surface-border font-medium text-sm
                         hover:bg-surface-border active:scale-[0.98] transition-all cursor-pointer"
            >
              Go to Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="w-full h-11 rounded-xl bg-surface text-text-secondary font-medium text-sm hover:text-text-primary transition-colors cursor-pointer"
            >
              Create a new account
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
