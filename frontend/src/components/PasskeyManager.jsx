import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const FingerprintIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" x2="12" y1="5" y2="19"/>
    <line x1="5" x2="19" y1="12" y2="12"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
);

function base64UrlToBuffer(base64url) {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function bufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export default function PasskeyManager({ onPasskeyChange }) {
  const [passkeys, setPasskeys] = useState([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const [showLabelPrompt, setShowLabelPrompt] = useState(false);

  const fetchPasskeys = useCallback(async () => {
    try {
      const res = await api.get('/api/webauthn/passkeys');
      setPasskeys(res.data);
    } catch {
      // User may not have passkeys yet
    }
  }, []);

  useEffect(() => {
    fetchPasskeys();
  }, [fetchPasskeys]);

  const handleRegisterPasskey = async () => {
    setError('');
    setSuccess('');
    setIsRegistering(true);

    try {
      // 1. Get registration options from server
      const optionsRes = await api.get('/api/webauthn/register/options');
      const options = optionsRes.data;

      // 2. Prepare options for navigator.credentials.create()
      const publicKeyOptions = {
        challenge: base64UrlToBuffer(options.challenge),
        rp: options.rp,
        user: {
          ...options.user,
          id: base64UrlToBuffer(options.user.id),
        },
        pubKeyCredParams: options.pubKeyCredParams,
        timeout: options.timeout,
        excludeCredentials: (options.excludeCredentials || []).map(cred => ({
          ...cred,
          id: base64UrlToBuffer(cred.id),
        })),
        authenticatorSelection: options.authenticatorSelection,
        attestation: options.attestation,
      };

      // 3. Create credential via browser WebAuthn API
      const credential = await navigator.credentials.create({
        publicKey: publicKeyOptions,
      });

      // 4. Show label prompt
      setShowLabelPrompt(true);
      setIsRegistering(false);

      // Store credential temporarily for the label step
      window._pendingCredential = credential;

    } catch (err) {
      setIsRegistering(false);
      if (err.name === 'NotAllowedError') {
        setError('Registration was cancelled or timed out.');
      } else {
        setError(err.message || 'Failed to register passkey.');
      }
    }
  };

  const handleSaveWithLabel = async () => {
    const credential = window._pendingCredential;
    if (!credential) return;

    setIsRegistering(true);
    setError('');

    try {
      const response = credential.response;

      // 5. Send attestation to server
      await api.post('/api/webauthn/register', {
        credentialId: bufferToBase64Url(credential.rawId),
        attestationObject: bufferToBase64Url(response.attestationObject),
        clientDataJSON: bufferToBase64Url(response.clientDataJSON),
        label: labelInput || 'My Passkey',
        transports: credential.response.getTransports?.()?.join(',') || '',
      });

      setSuccess('Passkey registered successfully!');
      setShowLabelPrompt(false);
      setLabelInput('');
      window._pendingCredential = null;
      fetchPasskeys();
      onPasskeyChange?.();

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save passkey.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDeletePasskey = async (credentialId) => {
    if (!confirm('Remove this passkey? You won\'t be able to sign in with it anymore.')) return;

    try {
      await api.delete(`/api/webauthn/passkeys/${encodeURIComponent(credentialId)}`);
      setSuccess('Passkey removed.');
      fetchPasskeys();
      onPasskeyChange?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete passkey.');
    }
  };

  const supportsWebAuthn = !!window.PublicKeyCredential;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  return (
    <div className="mt-10 animate-slide-up stagger-4">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold">Passkeys</h2>
          <p className="text-sm text-text-secondary">Sign in with biometrics instead of a password</p>
        </div>
        {supportsWebAuthn && !showLabelPrompt && (
          <button
            id="add-passkey-btn"
            onClick={handleRegisterPasskey}
            disabled={isRegistering}
            className="flex items-center gap-2 h-9 px-4 rounded-xl
                       bg-accent/10 border border-accent/20 text-accent text-sm font-medium
                       hover:bg-accent/20 active:scale-[0.97]
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200 cursor-pointer"
          >
            {isRegistering ? (
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            ) : (
              <PlusIcon />
            )}
            Add passkey
          </button>
        )}
      </div>

      {!supportsWebAuthn && (
        <div className="px-4 py-3 rounded-xl bg-surface-raised border border-surface-border text-sm text-text-secondary">
          Your browser doesn't support WebAuthn/Passkeys. Try Chrome, Safari, or Edge.
        </div>
      )}

      {error && (
        <div className="animate-fade-in mb-4 px-4 py-3 rounded-xl bg-danger-muted border border-danger/20 text-sm text-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="animate-fade-in mb-4 px-4 py-3 rounded-xl bg-accent-muted border border-accent/20 text-sm text-accent">
          {success}
        </div>
      )}

      {/* Label prompt */}
      {showLabelPrompt && (
        <div className="animate-fade-in mb-4 p-5 rounded-2xl bg-surface-raised border border-accent/20">
          <p className="text-sm font-medium text-text-primary mb-3">Name this passkey</p>
          <div className="flex gap-3">
            <input
              id="passkey-label-input"
              type="text"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              placeholder='e.g. "MacBook TouchID"'
              autoFocus
              className="flex-1 h-10 px-4 rounded-xl bg-surface border border-surface-border text-sm text-text-primary
                         placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/40
                         transition-all duration-200"
              onKeyDown={(e) => e.key === 'Enter' && handleSaveWithLabel()}
            />
            <button
              onClick={handleSaveWithLabel}
              disabled={isRegistering}
              className="h-10 px-5 rounded-xl bg-accent text-surface text-sm font-semibold
                         hover:bg-accent-hover active:scale-[0.97]
                         disabled:opacity-50 transition-all duration-200 cursor-pointer"
            >
              {isRegistering ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => { setShowLabelPrompt(false); window._pendingCredential = null; }}
              className="h-10 px-4 rounded-xl text-sm text-text-secondary hover:text-text-primary
                         hover:bg-surface-overlay transition-all duration-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Passkey list */}
      {passkeys.length > 0 ? (
        <div className="space-y-3">
          {passkeys.map((pk) => (
            <div
              key={pk.credentialId}
              className="group flex items-center justify-between p-4 rounded-2xl bg-surface-raised border border-surface-border
                         hover:border-surface-overlay transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                  <FingerprintIcon />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{pk.label || 'Passkey'}</p>
                  <div className="flex items-center gap-3 text-xs text-text-tertiary mt-0.5">
                    <span>Added {formatDate(pk.createdAt)}</span>
                    {pk.lastUsedAt && <span>Last used {formatDate(pk.lastUsedAt)}</span>}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDeletePasskey(pk.credentialId)}
                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-text-tertiary
                           hover:text-danger hover:bg-danger-muted
                           transition-all duration-200 cursor-pointer"
                title="Remove passkey"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      ) : (
        !showLabelPrompt && supportsWebAuthn && (
          <div className="p-8 rounded-2xl border border-dashed border-surface-border text-center">
            <div className="w-12 h-12 rounded-xl bg-surface-overlay border border-surface-border
                            flex items-center justify-center text-text-tertiary mx-auto mb-3">
              <FingerprintIcon />
            </div>
            <p className="text-sm text-text-secondary mb-1">No passkeys configured</p>
            <p className="text-xs text-text-tertiary">Add a passkey to sign in with fingerprint or face recognition</p>
          </div>
        )
      )}
    </div>
  );
}
