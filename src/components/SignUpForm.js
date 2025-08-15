import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const SignUpForm = ({ onSwitchToSignIn, onEmailSent }) => {
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signUp(formData.email, formData.password, formData.fullName);
      onEmailSent(formData.email);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">NEXUS</h1>
        <h2>Create Account</h2>
        
        <button onClick={() => signInWithGoogle()} className="google-btn">
          🔍 Continue with Google
        </button>
        
        <div className="divider">or</div>
        
        <form onSubmit={handleSubmit}>
          <input
            name="fullName"
            type="text"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData(prev => ({...prev, [e.target.name]: e.target.value}))}
            required
            disabled={loading}
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({...prev, [e.target.name]: e.target.value}))}
            required
            disabled={loading}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({...prev, [e.target.name]: e.target.value}))}
            required
            disabled={loading}
          />
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <p className="switch-auth">
          Already have an account? 
          <button onClick={onSwitchToSignIn} className="link-btn">Sign in</button>
        </p>
      </div>
    </div>
  );
};

export const EmailVerification = ({ email, onVerified, onBackToSignIn }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { verifyEmail, resendCode } = useAuth();

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await verifyEmail(email, code);
      onVerified();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendCode(email);
      alert('Verification code resent!');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">NEXUS</h1>
        <h2>Verify Email</h2>
        <p>Enter the verification code sent to {email}</p>
        
        <form onSubmit={handleVerify}>
          <input
            type="text"
            placeholder="Enter verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            disabled={loading}
          />
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
        
        <button onClick={handleResend} className="link-btn">Resend Code</button>
        <button onClick={onBackToSignIn} className="link-btn">Back to Sign In</button>
      </div>
    </div>
  );
};
