import React, { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import './App.css';

// Import your KYC components here
import { PersonalInfoStep } from './components/PersonalInfoStep';
import { SelfieStep } from './components/SelfieStep';
import { ProgressBar } from './components/ProgressBar';
import { useKYCForm } from './hooks/useKYCForm';
import { countries } from './data/countries';
import './App.css';

function App() {
  const auth = useAuth();
  const [showKYC, setShowKYC] = useState(false);
  const [kycComplete, setKycComplete] = useState(false);
  const [authFlow, setAuthFlow] = useState('signin');
  const [tempEmail, setTempEmail] = useState('');
  
  const {
    currentStep,
    formData,
    errors,
    isSubmitting,
    updatePersonalInfo,
    updateDocument,
    updateDocumentType,
    updateSelfie,
    nextStep,
    previousStep,
    submitForm,
  } = useKYCForm();

  // Auto-redirect to KYC if authenticated and no KYC completed
  React.useEffect(() => {
    if (auth.isAuthenticated && !kycComplete && !showKYC) {
      setShowKYC(true);
    }
  }, [auth.isAuthenticated, kycComplete, showKYC]);

  // Enhanced Loading State
  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600 text-sm font-medium">Authenticating...</p>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced Error State
  if (auth.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-red-100 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Authentication Error</h2>
            <p className="text-sm text-gray-600 mb-6">{auth.error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced KYC Flow
  if (auth.isAuthenticated && auth.user && showKYC) {
    const renderStep = () => {
      switch (currentStep) {
        case 1:
          return (
            <PersonalInfoStep
              formData={formData.personal}
              errors={errors}
              countries={countries}
              onFieldChange={updatePersonalInfo}
              onNext={nextStep}
            />
          );
        case 2:
          return (
            <EnhancedDocumentUploadStep
              documentData={formData.document}
              onDocumentUpload={updateDocument}
              onDocumentTypeChange={updateDocumentType}
              onNext={nextStep}
              onBack={previousStep}
            />
          );
        case 3:
          return (
            <SelfieStep
              capturedSelfie={formData.selfie}
              onSelfieCapture={updateSelfie}
              onNext={nextStep}
              onBack={previousStep}
            />
          );
        case 4:
          return (
            <EnhancedReviewStep
              formData={formData}
              countries={countries}
              onSubmit={async () => {
                await submitForm();
                setKycComplete(true);
                setShowKYC(false);
              }}
              onBack={previousStep}
            />
          );
        default:
          return null;
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 max-w-lg w-full overflow-hidden">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative z-10">
                <h1 className="text-xl font-bold mb-1">Identity Verification</h1>
                <p className="text-blue-100 text-sm">Secure verification process</p>
              </div>
            </div>
            
            {/* Enhanced Progress */}
            <div className="p-4 bg-gray-50/50">
              <ProgressBar currentStep={currentStep} totalSteps={4} />
            </div>
            
            {/* Content */}
            <div className="p-6">
              {renderStep()}
            </div>
          </div>
          
          {/* Enhanced Loading Overlay */}
          {isSubmitting && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/30">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-700 font-medium">Processing verification...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Enhanced Dashboard
  if (auth.isAuthenticated && kycComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">N</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">NEXUS</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{auth.user?.profile?.email}</span>
                <button
                  onClick={() => auth.signoutRedirect()}
                  className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Success Content */}
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Complete</h1>
            <p className="text-gray-600 mb-8">Ready for investment</p>

            <div className="bg-emerald-50/80 backdrop-blur-sm border border-emerald-200 rounded-2xl p-6 mb-8">
              <h3 className="text-sm font-semibold text-emerald-800 mb-3">Next Steps</h3>
              <div className="space-y-2 text-sm text-emerald-700">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span>Set up payment method</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span>Browse available properties</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span>Start investing</span>
                </div>
              </div>
            </div>

            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced Authentication Flow
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6">
      {/* Enhanced Logo */}
      <div className="mb-8">
        <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">NEXUS</span>
      </div>

      {/* Enhanced Auth Card */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 w-full max-w-md">
        {authFlow === 'signin' && <SignInForm onSwitchToSignUp={() => setAuthFlow('signup')} />}
        {authFlow === 'signup' && <SignUpForm onSwitchToSignIn={() => setAuthFlow('signin')} onSignUpSuccess={(email) => {setTempEmail(email); setAuthFlow('verify');}} />}
        {authFlow === 'verify' && <VerifyEmailForm email={tempEmail} onVerified={() => setAuthFlow('setpassword')} onBack={() => setAuthFlow('signup')} />}
        {authFlow === 'setpassword' && <SetPasswordForm email={tempEmail} onPasswordSet={() => auth.signinRedirect()} onBack={() => setAuthFlow('verify')} />}
      </div>
    </div>
  );
}

// Enhanced Sign In Form
const SignInForm = ({ onSwitchToSignUp }) => {
  const auth = useAuth();
  
  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
        <p className="text-gray-600 text-sm">Sign in to your account</p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => auth.signinRedirect()}
          className="w-full bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-center space-x-3 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="font-medium text-gray-700">Continue with Google</span>
        </button>
      </div>

      <div className="flex items-center mb-6">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="px-4 text-sm text-gray-500">or</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      <EmailPasswordForm onSubmit={() => auth.signinRedirect()} buttonText="Sign in" />

      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign up
          </button>
        </p>
      </div>
    </>
  );
};

// Enhanced Sign Up Form
const SignUpForm = ({ onSwitchToSignIn, onSignUpSuccess }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSignUpSuccess(email);
    }, 1000);
  };

  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
        <p className="text-gray-600 text-sm">Start your verification</p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </>
  );
};

// Enhanced Email Verification
const VerifyEmailForm = ({ email, onVerified, onBack }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onVerified();
    }, 1000);
  };

  return (
    <>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Check your email</h1>
        <p className="text-gray-600 text-sm">Code sent to <strong>{email}</strong></p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-70"
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </form>
    </>
  );
};

// Enhanced Set Password
const SetPasswordForm = ({ email, onPasswordSet, onBack }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onPasswordSet();
    }, 1000);
  };

  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Set password</h1>
        <p className="text-gray-600 text-sm">Create secure password for {email}</p>
      </div>

      <form onSubmit={handleSetPassword} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
            minLength={8}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-70"
          >
            {isLoading ? 'Setting...' : 'Set password'}
          </button>
        </div>
      </form>
    </>
  );
};

// Enhanced Email/Password Form
const EmailPasswordForm = ({ onSubmit, buttonText }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
      <input
        type="email"
        placeholder="Enter your email"
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
      <input
        type="password"
        placeholder="Enter your password"
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
    </div>

    <div className="flex justify-between items-center text-sm">
      <label className="flex items-center space-x-2 cursor-pointer">
        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        <span className="text-gray-600">Remember me</span>
      </label>
      <button type="button" className="text-blue-600 hover:text-blue-700">
        Forgot password?
      </button>
    </div>

    <button
      type="submit"
      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105"
    >
      {buttonText}
    </button>
  </form>
);

// Enhanced Document Upload Component (keeping existing functionality)
const EnhancedDocumentUploadStep = ({ documentData, onDocumentUpload, onDocumentTypeChange, onNext, onBack }) => {
  const [selectedType, setSelectedType] = useState(documentData?.type || 'passport');
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);

  const documentTypes = [
    { id: 'passport', label: 'Passport', icon: '📘', needsBack: false },
    { id: 'national_id', label: 'National ID', icon: '🆔', needsBack: true }
  ];

  const handleFileUpload = (file, side = 'front') => {
    if (side === 'front') {
      setFrontImage(file);
      onDocumentUpload(file);
    } else {
      setBackImage(file);
    }
  };

  const handleNext = () => {
    const selectedDoc = documentTypes.find(doc => doc.id === selectedType);
    if (selectedDoc.needsBack && (!frontImage || !backImage)) {
      alert('Please upload both sides');
      return;
    }
    if (!frontImage) {
      alert('Please upload document');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Upload Document</h2>
        <p className="text-gray-600 text-sm">Upload your government ID</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Document Type</label>
        <div className="space-y-2">
          {documentTypes.map((doc) => (
            <div
              key={doc.id}
              onClick={() => {
                setSelectedType(doc.id);
                onDocumentTypeChange(doc.id);
                setFrontImage(null);
                setBackImage(null);
              }}
              className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                selectedType === doc.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{doc.icon}</span>
                <span className={`font-medium ${selectedType === doc.id ? 'text-blue-700' : 'text-gray-700'}`}>
                  {doc.label}
                </span>
                {selectedType === doc.id && (
                  <svg className="w-5 h-5 text-blue-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {selectedType === 'national_id' ? (
          <>
            <UploadArea title="Front Side" file={frontImage} onFileSelect={(file) => handleFileUpload(file, 'front')} />
            <UploadArea title="Back Side" file={backImage} onFileSelect={(file) => handleFileUpload(file, 'back')} />
          </>
        ) : (
          <UploadArea title="Document" file={frontImage} onFileSelect={(file) => handleFileUpload(file, 'front')} />
        )}
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

// Enhanced Upload Area
const UploadArea = ({ title, file, onFileSelect }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{title}</label>
    <div
      onClick={() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => onFileSelect(e.target.files[0]);
        input.click();
      }}
      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
        file 
          ? 'border-green-300 bg-green-50' 
          : 'border-gray-300 hover:border-gray-400 bg-gray-50'
      }`}
    >
      {file ? (
        <div>
          <div className="text-2xl mb-2">✓</div>
          <p className="text-green-700 font-medium text-sm">{file.name}</p>
        </div>
      ) : (
        <div>
          <div className="text-2xl text-gray-400 mb-2">📎</div>
          <p className="text-gray-600 text-sm">Click to upload</p>
          <p className="text-gray-400 text-xs mt-1">PNG, JPG up to 10MB</p>
        </div>
      )}
    </div>
  </div>
);

// Enhanced Review Step
const EnhancedReviewStep = ({ formData, countries, onSubmit, onBack }) => (
  <div className="space-y-6">
    <div className="text-center">
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Review & Submit</h2>
      <p className="text-gray-600 text-sm">Verify information</p>
    </div>

    <div className="space-y-4">
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Personal Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span className="font-medium">{formData.personal.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium">{formData.personal.email}</span>
          </div>
        </div>
      </div>

      <div className="bg-green-50 rounded-xl p-4">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Verification</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-700">Document uploaded</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-700">Selfie captured</span>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <div className="flex items-start space-x-2">
        <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p className="text-amber-800 text-sm">
          By submitting, you confirm all information is accurate and documents belong to you.
        </p>
      </div>
    </div>

    <div className="flex space-x-3">
      <button
        onClick={onBack}
        className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Back
      </button>
      <button
        onClick={onSubmit}
        className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 rounded-xl font-medium hover:from-emerald-700 hover:to-green-700 transition-all"
      >
        Submit
      </button>
    </div>
  </div>
);

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default App;