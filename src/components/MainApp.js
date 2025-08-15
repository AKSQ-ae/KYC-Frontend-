import React, { useState, useEffect, useRef } from 'react';
import { User, FileText, Camera, List, ChevronRight, ArrowLeft, CheckCircle, Upload, Globe, AlertCircle, Phone, Calendar, Home, Eye, EyeOff } from 'lucide-react';
import { signUp, signIn, confirmSignUp, signInWithRedirect } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';

// Add this at the top of App.js, before the component
Amplify.configure({
  Auth: {
    Cognito: {
      region: 'ap-southeast-1',
      userPoolId: 'ap-southeast-1_vnzc7I7Sb',
      userPoolClientId: '6t61naa9tt2t69ve71a7niog2t',
      loginWith: {
        oauth: {
          domain: "https://ap-southeast-1vnzc7i7sb.auth.ap-southeast-1.amazoncognito.com",
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: [window.location.origin],
          redirectSignOut: [window.location.origin],
          responseType: 'code',
        },
        username: true,
        email: true,
      }
    }
  }
});
// App states for authentication and KYC flow
const APP_STATES = {
    UNAUTHENTICATED: 'unauthenticated',
    AUTHENTICATED: 'authenticated', 
    KYC_NEEDED: 'kyc_needed',
    KYC_COMPLETE: 'kyc_complete'
};

const AUTH_MODES = {
    SIGN_IN: 'signin',
    SIGN_UP: 'signup',
    FORGOT_PASSWORD: 'forgot_password',
    VERIFY_EMAIL: 'verify_email'
};

const STEPS = [
    { id: 1, name: 'Personal Info', title: 'Personal Information', icon: User },
    { id: 2, name: 'Upload ID', title: 'Upload Your ID Document', icon: FileText },
    { id: 3, name: 'Proof of Address', title: 'Proof of Address', icon: Home },
    { id: 4, name: 'Take a Selfie', title: 'Take a Live Selfie', icon: Camera },
    { id: 5, name: 'Review & Submit', title: 'Review and Submit', icon: List }
];

const countries = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'AU', label: 'Australia' },
    { value: 'DE', label: 'Germany' },
    { value: 'JP', label: 'Japan' },
    { value: 'IN', label: 'India' },
];

const App = () => {
    // Main app state management
    const [appState, setAppState] = useState(APP_STATES.UNAUTHENTICATED);
    const [authMode, setAuthMode] = useState(AUTH_MODES.SIGN_IN);
    const [user, setUser] = useState(null);
    
    // KYC states
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        personal: { fullName: '', email: '', country: 'US', dateOfBirth: '', phoneNumber: '' },
        idDocument: { type: 'passport', front: null, back: null },
        proofOfAddress: null,
        selfie: null
    });
    
    // Auth form states
    const [authData, setAuthData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        rememberMe: false,
        verificationCode: ''
    });
    
    // UI states
    const [modal, setModal] = useState({ visible: false, title: '', message: '', type: 'error' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const webcamVideoRef = useRef(null);
    const selfieCanvasRef = useRef(null);

    // AWS Cognito integration
    const signInWithCognito = async (email, password) => {
        setIsSubmitting(true);
        try {
            const result = await signIn({ username: email, password });
            const mockUser = { email, id: result.userId, kycStatus: 'pending' };
            setUser(mockUser);
            setAppState(APP_STATES.KYC_NEEDED);
        } catch (error) {
            showModal('Sign In Failed', error.message);
        }
        setIsSubmitting(false);
    };

    const signUpWithCognito = async (email, password, fullName) => {
        setIsSubmitting(true);
        try {
            await signUp({
                username: email,
                password,
                options: { userAttributes: { email, name: fullName } }
            });
            setAuthMode(AUTH_MODES.VERIFY_EMAIL);
        } catch (error) {
            showModal('Sign Up Failed', error.message);
        }
        setIsSubmitting(false);
    };

    const verifyEmailWithCognito = async (code) => {
        setIsSubmitting(true);
        try {
            await confirmSignUp({ username: authData.email, confirmationCode: code });
            const mockUser = { email: authData.email, id: '12345', kycStatus: 'pending' };
            setUser(mockUser);
            setAppState(APP_STATES.KYC_NEEDED);
        } catch (error) {
            showModal('Verification Failed', error.message);
        }
        setIsSubmitting(false);
    };

    const signInWithGoogle = async () => {
        try {
            await signInWithRedirect({ provider: 'Google' });
            // Redirect will handle the rest
        } catch (error) {
            showModal('Google Sign In Failed', error.message);
        }
    };

    const showModal = (title, message, type = 'error') => {
        setModal({ visible: true, title, message, type });
    };

    const closeModal = () => {
        setModal({ ...modal, visible: false });
    };

    const handleAuthInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAuthData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        if (!authData.email || !authData.password) {
            showModal('Missing Information', 'Please enter both email and password.');
            return;
        }
        await signInWithCognito(authData.email, authData.password);
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        if (!authData.email || !authData.password || !authData.fullName) {
            showModal('Missing Information', 'Please fill in all required fields.');
            return;
        }
        if (authData.password !== authData.confirmPassword) {
            showModal('Password Mismatch', 'Passwords do not match.');
            return;
        }
        if (authData.password.length < 8) {
            showModal('Weak Password', 'Password must be at least 8 characters long.');
            return;
        }
        await signUpWithCognito(authData.email, authData.password, authData.fullName);
    };

    const handleEmailVerification = async (e) => {
        e.preventDefault();
        if (!authData.verificationCode || authData.verificationCode.length !== 6) {
            showModal('Invalid Code', 'Please enter a valid 6-digit verification code.');
            return;
        }
        await verifyEmailWithCognito(authData.verificationCode);
    };

    // KYC handlers (same as before)
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            personal: { ...prev.personal, [name]: value }
        }));
    };

    const handleDocumentTypeChange = (type) => {
        setFormData(prev => ({
            ...prev,
            idDocument: { type, front: prev.idDocument.front, back: type === 'passport' ? null : prev.idDocument.back }
        }));
    };

    const handleFileUpload = (key, file) => {
        if (key.includes('idDocument')) {
            const side = key.split('.')[1];
            setFormData(prev => ({
                ...prev,
                idDocument: { ...prev.idDocument, [side]: file }
            }));
        } else if (key === 'proofOfAddress') {
            setFormData(prev => ({ ...prev, proofOfAddress: file }));
        }
    };

    const handleNextStep = () => {
        let hasError = false;
        
        switch (currentStep) {
            case 1:
                const { fullName, email, dateOfBirth, phoneNumber } = formData.personal;
                if (!fullName || !email || !dateOfBirth || !phoneNumber) {
                    showModal('Missing Information', 'Please fill in all personal information fields.');
                    hasError = true;
                }
                break;
            case 2:
                const { type, front, back } = formData.idDocument;
                if (type !== 'passport' && (!front || !back)) {
                    showModal('Missing Document', `Please upload both the front and back sides of your ${type === 'national_id' ? 'National ID' : 'Driver\'s License'}.`);
                    hasError = true;
                }
                if (type === 'passport' && !front) {
                    showModal('Missing Document', 'Please upload your passport photo page.');
                    hasError = true;
                }
                break;
            case 3:
                if (!formData.proofOfAddress) {
                    showModal('Missing Document', 'Please upload a valid proof of address document.');
                    hasError = true;
                }
                break;
            case 4:
                if (!formData.selfie) {
                    showModal('Missing Selfie', 'Please capture a selfie before continuing.');
                    hasError = true;
                }
                break;
            default:
                break;
        }

        if (!hasError) {
            setCurrentStep(currentStep + 1);
        }
    };

    // Removed back functionality

    const handleCaptureSelfie = () => {
        const video = webcamVideoRef.current;
        const canvas = selfieCanvasRef.current;
        if (video && canvas) {
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            setFormData(prev => ({
                ...prev,
                selfie: canvas.toDataURL('image/png')
            }));
            if (video.srcObject) {
                video.srcObject.getTracks().forEach(track => track.stop());
            }
        }
    };

    const handleKYCSubmit = async () => {
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsSubmitting(false);
        
        // TODO: Submit KYC data to AWS
        console.log('Final KYC Data:', formData);
        
        // Update user KYC status
        setUser(prev => ({ ...prev, kycStatus: 'complete' }));
        setAppState(APP_STATES.KYC_COMPLETE);
        showModal('KYC Complete!', 'Your identity verification has been submitted successfully. You can now access all platform features.', 'success');
    };

    const handleSignOut = () => {
        setUser(null);
        setAppState(APP_STATES.UNAUTHENTICATED);
        setAuthMode(AUTH_MODES.SIGN_IN);
        setCurrentStep(1);
        setFormData({
            personal: { fullName: '', email: '', country: 'US', dateOfBirth: '', phoneNumber: '' },
            idDocument: { type: 'passport', front: null, back: null },
            proofOfAddress: null,
            selfie: null
        });
        setAuthData({
            email: '',
            password: '',
            confirmPassword: '',
            fullName: '',
            rememberMe: false,
            verificationCode: ''
        });
    };

    useEffect(() => {
        if (currentStep === 4 && webcamVideoRef.current && !formData.selfie) {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: true })
                    .then(stream => {
                        if (webcamVideoRef.current) {
                            webcamVideoRef.current.srcObject = stream;
                            webcamVideoRef.current.play();
                        }
                    })
                    .catch(err => {
                        console.error("Error accessing webcam: ", err);
                        showModal('Camera Error', 'Could not access the camera. Please check permissions.', 'error');
                    });
            }
        }
        return () => {
            if (webcamVideoRef.current && webcamVideoRef.current.srcObject) {
                webcamVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, [currentStep]);

    // Auto-populate email in KYC form if user is authenticated
    useEffect(() => {
        if (user?.email && appState === APP_STATES.KYC_NEEDED) {
            setFormData(prev => ({
                ...prev,
                personal: { ...prev.personal, email: user.email }
            }));
        }
    }, [user, appState]);

    const UploadArea = ({ title, side, keyName }) => {
        const file = keyName.includes('idDocument') 
            ? formData.idDocument[side] 
            : formData[keyName];
        const isUploaded = !!file;

        const handleClick = () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const uploadedFile = e.target.files[0];
                if (uploadedFile) {
                    handleFileUpload(keyName, uploadedFile);
                }
            };
            input.click();
        };

        return (
            <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#374151', 
                    marginBottom: '8px' 
                }}>{title}</label>
                <div
                    onClick={handleClick}
                    style={{
                        border: isUploaded ? '2px dashed #3b82f6' : '2px dashed #d1d5db',
                        borderRadius: '12px',
                        padding: '32px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: isUploaded ? '#eff6ff' : '#f9fafb',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {isUploaded ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                backgroundColor: '#dbeafe',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '12px'
                            }}>
                                <CheckCircle style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
                            </div>
                            <p style={{ color: '#1d4ed8', fontWeight: '600', fontSize: '14px', margin: 0 }}>{file.name}</p>
                            <p style={{ color: '#3b82f6', fontSize: '12px', margin: '4px 0 0 0' }}>Successfully uploaded</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                backgroundColor: '#f3f4f6',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '12px'
                            }}>
                                <Upload style={{ width: '24px', height: '24px', color: '#6b7280' }} />
                            </div>
                            <p style={{ color: '#374151', fontWeight: '600', fontSize: '14px', margin: '0 0 4px 0' }}>Click to upload</p>
                            <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>PNG, JPG up to 10MB</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderAuthContent = () => {
        const inputStyle = {
            width: '100%',
            padding: '12px 16px',
            backgroundColor: '#ffffff',
            color: '#111827',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            outline: 'none'
        };

        const labelStyle = {
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px'
        };

        const buttonStyle = {
            width: '100%',
            background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
        };

        const googleButtonStyle = {
            width: '100%',
            backgroundColor: 'white',
            color: '#374151',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontWeight: '500',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '24px'
        };

        switch (authMode) {
            case AUTH_MODES.SIGN_IN:
                return (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
                                Welcome
                            </h2>
                            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                                Sign in to your account
                            </p>
                        </div>

                        <button onClick={signInWithGoogle} style={googleButtonStyle}>
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continue with Google
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '24px', color: '#6b7280', fontSize: '14px' }}>
                            or
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={authData.email}
                                    onChange={handleAuthInputChange}
                                    style={inputStyle}
                                    required
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="Enter your password"
                                        value={authData.password}
                                        onChange={handleAuthInputChange}
                                        style={{ ...inputStyle, paddingRight: '40px', boxSizing: 'border-box' }}
                                        required
                                        onKeyPress={(e) => e.key === 'Enter' && handleSignIn(e)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#6b7280'
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        name="rememberMe"
                                        checked={authData.rememberMe}
                                        onChange={handleAuthInputChange}
                                        style={{ marginRight: '4px' }}
                                    />
                                    Remember me
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setAuthMode(AUTH_MODES.FORGOT_PASSWORD)}
                                    style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '14px' }}
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <button onClick={handleSignIn} disabled={isSubmitting} style={buttonStyle}>
                                {isSubmitting ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
                            <span style={{ color: '#6b7280' }}>Don't have an account? </span>
                            <button
                                onClick={() => setAuthMode(AUTH_MODES.SIGN_UP)}
                                style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontWeight: '500' }}
                            >
                                Sign up
                            </button>
                        </div>
                    </>
                );

            case AUTH_MODES.SIGN_UP:
                return (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
                                Create account
                            </h2>
                            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                                Start your verification journey
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Enter your full name"
                                    value={authData.fullName}
                                    onChange={handleAuthInputChange}
                                    style={inputStyle}
                                    required
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={authData.email}
                                    onChange={handleAuthInputChange}
                                    style={inputStyle}
                                    required
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="Create a password"
                                        value={authData.password}
                                        onChange={handleAuthInputChange}
                                        style={{ ...inputStyle, paddingRight: '40px' }}
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#6b7280'
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        placeholder="Confirm your password"
                                        value={authData.confirmPassword}
                                        onChange={handleAuthInputChange}
                                        style={{ ...inputStyle, paddingRight: '40px' }}
                                        required
                                        onKeyPress={(e) => e.key === 'Enter' && handleSignUp(e)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#6b7280'
                                        }}
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button onClick={handleSignUp} disabled={isSubmitting} style={buttonStyle}>
                                {isSubmitting ? 'Creating account...' : 'Create account'}
                            </button>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
                            <span style={{ color: '#6b7280' }}>Already have an account? </span>
                            <button
                                onClick={() => setAuthMode(AUTH_MODES.SIGN_IN)}
                                style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontWeight: '500' }}
                            >
                                Sign in
                            </button>
                        </div>
                    </>
                );

            case AUTH_MODES.VERIFY_EMAIL:
                return (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                backgroundColor: '#eff6ff',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px auto'
                            }}>
                                <CheckCircle style={{ width: '32px', height: '32px', color: '#3b82f6' }} />
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
                                Check your email
                            </h2>
                            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                                We sent a verification code to<br />
                                <strong>{authData.email}</strong>
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Verification Code</label>
                                <input
                                    type="text"
                                    name="verificationCode"
                                    placeholder="Enter 6-digit code"
                                    value={authData.verificationCode}
                                    onChange={handleAuthInputChange}
                                    style={{ ...inputStyle, textAlign: 'center', fontSize: '18px', letterSpacing: '4px' }}
                                    maxLength={6}
                                    required
                                    onKeyPress={(e) => e.key === 'Enter' && handleEmailVerification(e)}
                                />
                            </div>

                            <button onClick={handleEmailVerification} disabled={isSubmitting} style={buttonStyle}>
                                {isSubmitting ? 'Verifying...' : 'Verify Email'}
                            </button>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
                            <span style={{ color: '#6b7280' }}>Didn't receive the code? </span>
                            <button
                                onClick={() => console.log('Resend code')}
                                style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: '500' }}
                            >
                                Resend
                            </button>
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    const renderKYCContent = () => {
        const inputStyle = {
            width: '100%',
            padding: '12px 16px',
            backgroundColor: '#ffffff',
            color: '#111827',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            outline: 'none'
        };

        const labelStyle = {
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
        };

        const buttonPrimaryStyle = {
            background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
        };

        const buttonSecondaryStyle = {
            backgroundColor: '#f3f4f6',
            color: '#374151',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
        };

        switch (currentStep) {
            case 1:
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <label style={labelStyle}>Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                placeholder="e.g. Jane Doe"
                                value={formData.personal.fullName}
                                onChange={handleInputChange}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="e.g. jane.doe@example.com"
                                value={formData.personal.email}
                                onChange={handleInputChange}
                                style={{ ...inputStyle, backgroundColor: '#f9fafb', color: '#6b7280' }}
                                readOnly
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Date of Birth</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.personal.dateOfBirth}
                                    onChange={handleInputChange}
                                    style={{ ...inputStyle, paddingRight: '40px' }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    pointerEvents: 'none'
                                }}>
                                    <Calendar style={{ width: '20px', height: '20px', color: '#9ca3af' }} />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Phone Number</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    placeholder="e.g. +1 555-123-4567"
                                    value={formData.personal.phoneNumber}
                                    onChange={handleInputChange}
                                    style={{ ...inputStyle, paddingRight: '40px' }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    pointerEvents: 'none'
                                }}>
                                    <Phone style={{ width: '20px', height: '20px', color: '#9ca3af' }} />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Country of Residence</label>
                            <select
                                name="country"
                                value={formData.personal.country}
                                onChange={handleInputChange}
                                style={inputStyle}
                            >
                                {countries.map(country => (
                                    <option key={country.value} value={country.value}>{country.label}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <button onClick={handleNextStep} style={buttonPrimaryStyle}>
                                <span>Continue</span>
                                <ChevronRight style={{ width: '20px', height: '20px' }} />
                            </button>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <label style={{ ...labelStyle, marginBottom: '16px' }}>Document Type</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
                                {[
                                    { id: 'passport', label: 'Passport', icon: Globe },
                                    { id: 'national_id', label: 'National ID', icon: FileText }
                                ].map(({ id, label, icon: Icon }) => (
                                    <div
                                        key={id}
                                        onClick={() => handleDocumentTypeChange(id)}
                                        style={{
                                            padding: '24px',
                                            borderRadius: '12px',
                                            border: formData.idDocument.type === id ? '2px solid #4f46e5' : '2px solid #e5e7eb',
                                            backgroundColor: formData.idDocument.type === id ? '#eef2ff' : '#ffffff',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            backgroundColor: formData.idDocument.type === id ? '#ddd6fe' : '#f3f4f6',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 12px auto'
                                        }}>
                                            <Icon style={{
                                                width: '24px',
                                                height: '24px',
                                                color: formData.idDocument.type === id ? '#4f46e5' : '#6b7280'
                                            }} />
                                        </div>
                                        <span style={{
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            color: formData.idDocument.type === id ? '#3730a3' : '#374151'
                                        }}>{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            {formData.idDocument.type === 'passport' ? (
                                <UploadArea title="Passport Photo Page" side="front" keyName="idDocument.front" />
                            ) : (
                                <>
                                    <UploadArea title="Front Side" side="front" keyName="idDocument.front" />
                                    <UploadArea title="Back Side" side="back" keyName="idDocument.back" />
                                </>
                            )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <button onClick={handleNextStep} style={{ ...buttonPrimaryStyle }}>
                                <span>Continue</span>
                                <ChevronRight style={{ width: '20px', height: '20px' }} />
                            </button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{
                            backgroundColor: '#eef2ff',
                            border: '1px solid #c7d2fe',
                            borderRadius: '12px',
                            padding: '16px'
                        }}>
                            <p style={{
                                color: '#3730a3',
                                fontSize: '14px',
                                fontWeight: '500',
                                margin: 0
                            }}>
                                Please upload a document to verify your address. This can be a utility bill, bank statement, or official government correspondence. The document must be less than 3 months old.
                            </p>
                        </div>
                        <UploadArea title="Proof of Address Document" keyName="proofOfAddress" />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <button onClick={handleNextStep} style={{ ...buttonPrimaryStyle }}>
                                <span>Continue</span>
                                <ChevronRight style={{ width: '20px', height: '20px' }} />
                            </button>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{
                            position: 'relative',
                            width: '100%',
                            aspectRatio: '16/9',
                            backgroundColor: '#1f2937',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '2px solid #d1d5db'
                        }}>
                            {!formData.selfie && (
                                <video ref={webcamVideoRef} style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transform: 'scaleX(-1)'
                                }} autoPlay playsInline />
                            )}
                            <canvas ref={selfieCanvasRef} style={{ display: 'none' }} />
                            {formData.selfie && (
                                <img src={formData.selfie} alt="Captured Selfie" style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain'
                                }} />
                            )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            {formData.selfie ? (
                                <button onClick={handleNextStep} style={{ ...buttonPrimaryStyle }}>
                                    <span>Continue</span>
                                    <ChevronRight style={{ width: '20px', height: '20px' }} />
                                </button>
                            ) : (
                                <button onClick={handleCaptureSelfie} style={{
                                    ...buttonPrimaryStyle,
                                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                                }}>
                                    <Camera style={{ width: '20px', height: '20px' }} />
                                    <span>Take Photo</span>
                                </button>
                            )}
                        </div>
                    </div>
                );
            case 5:
                const countryName = countries.find(c => c.value === formData.personal.country)?.label || 'Not provided';
                const idType = formData.idDocument.type === 'passport' ? 'Passport' : formData.idDocument.type === 'national_id' ? 'National ID' : 'Driver\'s License';

                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{
                                backgroundColor: '#ffffff',
                                borderRadius: '12px',
                                padding: '24px',
                                border: '1px solid #e5e7eb'
                            }}>
                                <h3 style={{
                                    fontWeight: '700',
                                    color: '#111827',
                                    marginBottom: '16px',
                                    fontSize: '16px',
                                    margin: '0 0 16px 0'
                                }}>Personal Information</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                                    {[
                                        ['Full Name', formData.personal.fullName || 'Not provided'],
                                        ['Email', formData.personal.email || 'Not provided'],
                                        ['Date of Birth', formData.personal.dateOfBirth || 'Not provided'],
                                        ['Phone Number', formData.personal.phoneNumber || 'Not provided'],
                                        ['Country', countryName]
                                    ].map(([label, value]) => (
                                        <div key={label} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '8px 0',
                                            borderBottom: '1px solid #f3f4f6'
                                        }}>
                                            <span style={{ color: '#6b7280', fontWeight: '500' }}>{label}:</span>
                                            <span style={{ fontWeight: '600', color: '#111827' }}>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{
                                backgroundColor: '#eef2ff',
                                borderRadius: '12px',
                                padding: '24px',
                                border: '1px solid #c7d2fe'
                            }}>
                                <h3 style={{
                                    fontWeight: '700',
                                    color: '#3730a3',
                                    marginBottom: '16px',
                                    fontSize: '16px',
                                    margin: '0 0 16px 0'
                                }}>Verification Status</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                                    {[
                                        `${idType} Uploaded`,
                                        'Proof of Address Uploaded',
                                        'Selfie Captured'
                                    ].map((item) => (
                                        <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                backgroundColor: '#ddd6fe',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <CheckCircle style={{ width: '16px', height: '16px', color: '#4f46e5' }} />
                                            </div>
                                            <span style={{ color: '#3730a3', fontWeight: '500' }}>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div style={{
                            backgroundColor: '#fffbeb',
                            border: '1px solid #fed7aa',
                            borderRadius: '12px',
                            padding: '16px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    backgroundColor: '#fef3c7',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginTop: '2px'
                                }}>
                                    <AlertCircle style={{ width: '16px', height: '16px', color: '#d97706' }} />
                                </div>
                                <p style={{
                                    color: '#92400e',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    margin: 0
                                }}>
                                    By submitting, you confirm all information is accurate and documents belong to you.
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <button
                                onClick={handleKYCSubmit}
                                disabled={isSubmitting}
                                style={{
                                    ...buttonPrimaryStyle,
                                    background: isSubmitting 
                                        ? 'linear-gradient(135deg, #86efac 0%, #4ade80 100%)' 
                                        : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                    opacity: isSubmitting ? 0.7 : 1,
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            border: '2px solid #ffffff',
                                            borderTop: '2px solid transparent',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }} />
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Submit KYC</span>
                                        <CheckCircle style={{ width: '20px', height: '20px' }} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const renderDashboard = () => (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '24px'
        }}>
            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                maxWidth: '800px',
                margin: '0 auto',
                padding: '48px'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        backgroundColor: '#dcfce7',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px auto'
                    }}>
                        <CheckCircle style={{ width: '40px', height: '40px', color: '#16a34a' }} />
                    </div>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: '700',
                        color: '#111827',
                        margin: '0 0 12px 0'
                    }}>Welcome to NEXUS!</h1>
                    <p style={{
                        color: '#6b7280',
                        fontSize: '16px',
                        margin: 0
                    }}>Your identity verification is complete. You now have full access to all platform features.</p>
                </div>

                <div style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '32px'
                }}>
                    <h3 style={{
                        fontWeight: '700',
                        color: '#15803d',
                        marginBottom: '16px',
                        fontSize: '18px',
                        margin: '0 0 16px 0'
                    }}>Verification Complete ✓</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <CheckCircle style={{ width: '20px', height: '20px', color: '#16a34a' }} />
                            <span style={{ color: '#15803d', fontWeight: '500' }}>Identity Verified</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <CheckCircle style={{ width: '20px', height: '20px', color: '#16a34a' }} />
                            <span style={{ color: '#15803d', fontWeight: '500' }}>Address Confirmed</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <CheckCircle style={{ width: '20px', height: '20px', color: '#16a34a' }} />
                            <span style={{ color: '#15803d', fontWeight: '500' }}>Account Active</span>
                        </div>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '32px'
                }}>
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        padding: '20px',
                        border: '1px solid #e5e7eb',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: '#eff6ff',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 12px auto'
                        }}>
                            <User style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
                        </div>
                        <h4 style={{ fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>Profile</h4>
                        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Manage your account</p>
                    </div>
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        padding: '20px',
                        border: '1px solid #e5e7eb',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: '#f0fdf4',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 12px auto'
                        }}>
                            <CheckCircle style={{ width: '24px', height: '24px', color: '#16a34a' }} />
                        </div>
                        <h4 style={{ fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>Verified</h4>
                        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Full platform access</p>
                    </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <button
                        onClick={handleSignOut}
                        style={{
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            fontWeight: '500',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );

    const mainBackground = 'linear-gradient(135deg, #bfdbfe 0%, #ddd6fe 50%, #fecaca 100%)';

    return (
        <div style={{ minHeight: '100vh', background: mainBackground }}>
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                `}
            </style>

            {/* Render based on app state */}
            {appState === APP_STATES.UNAUTHENTICATED && (
                <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                    {/* NEXUS Logo at top */}
                    <div style={{ marginBottom: '48px' }}>
                        <h1 style={{
                            fontSize: '48px',
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            margin: 0,
                            textAlign: 'center'
                        }}>NEXUS</h1>
                    </div>
                    
                    {/* Auth Card */}
                    <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        maxWidth: '400px',
                        width: '100%',
                        padding: '40px'
                    }}>
                        {renderAuthContent()}
                    </div>
                </div>
            )}

            {appState === APP_STATES.KYC_NEEDED && (
                <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                    <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        maxWidth: '900px',
                        width: '100%',
                        overflow: 'hidden'
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', minHeight: '600px' }}>
                            {/* Progress Sidebar */}
                            <div style={{
                                background: 'linear-gradient(180deg, #1e293b 0%, #334155 50%, #1e293b 100%)',
                                padding: '32px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                                    <div>
                                        <h1 style={{
                                            fontSize: '24px',
                                            fontWeight: '700',
                                            color: 'white',
                                            margin: '0 0 4px 0'
                                        }}>KYC Verification</h1>
                                        <p style={{ color: '#cbd5e1', fontSize: '14px', margin: 0 }}>Complete your identity verification</p>
                                    </div>
                                    <button
                                        onClick={handleSignOut}
                                        style={{
                                            background: 'none',
                                            border: '1px solid #475569',
                                            color: '#cbd5e1',
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Sign Out
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {STEPS.map((step) => {
                                        const isComplete = step.id < currentStep;
                                        const isActive = step.id === currentStep;
                                        const Icon = step.icon;

                                        return (
                                            <div key={step.id} style={{
                                                position: 'relative',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '16px'
                                            }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: isComplete 
                                                        ? '#059669' 
                                                        : isActive 
                                                        ? '#4f46e5' 
                                                        : '#475569',
                                                    color: 'white',
                                                    boxShadow: isActive 
                                                        ? '0 0 20px rgba(79, 70, 229, 0.3)' 
                                                        : isComplete 
                                                        ? '0 0 20px rgba(5, 150, 105, 0.3)' 
                                                        : 'none',
                                                    transition: 'all 0.3s ease'
                                                }}>
                                                    {isComplete ? (
                                                        <CheckCircle style={{ width: '20px', height: '20px' }} />
                                                    ) : (
                                                        <Icon style={{ width: '20px', height: '20px' }} />
                                                    )}
                                                </div>
                                                <span style={{
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    color: isActive 
                                                        ? '#a5b4fc' 
                                                        : isComplete 
                                                        ? '#86efac' 
                                                        : '#94a3b8',
                                                    transition: 'color 0.3s ease'
                                                }}>
                                                    {step.name}
                                                </span>
                                                {step.id < STEPS.length && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        left: '20px',
                                                        top: '40px',
                                                        width: '1px',
                                                        height: '24px',
                                                        backgroundColor: isComplete 
                                                            ? '#059669' 
                                                            : isActive 
                                                            ? '#4f46e5' 
                                                            : '#475569',
                                                        transition: 'background-color 0.3s ease'
                                                    }}></div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Main Content */}
                            <div style={{ padding: '32px 48px' }}>
                                <div style={{ marginBottom: '32px' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: '8px'
                                    }}>
                                        <span style={{
                                            fontSize: '14px',
                                            color: '#6b7280'
                                        }}>Step {currentStep} of {STEPS.length}</span>
                                        <span style={{
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            color: '#6b7280'
                                        }}>{Math.round((currentStep / STEPS.length) * 100)}%</span>
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: '8px',
                                        backgroundColor: '#e5e7eb',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                        marginBottom: '16px'
                                    }}>
                                        <div style={{
                                            width: `${(currentStep / STEPS.length) * 100}%`,
                                            height: '100%',
                                            background: 'linear-gradient(90deg, #4f46e5 0%, #3b82f6 100%)',
                                            borderRadius: '4px',
                                            transition: 'width 0.5s ease'
                                        }}></div>
                                    </div>
                                    <h2 style={{
                                        fontSize: '28px',
                                        fontWeight: '700',
                                        color: '#111827',
                                        margin: 0
                                    }}>{STEPS[currentStep - 1].title}</h2>
                                </div>
                                {renderKYCContent()}
                            </div>
                        </div>
                    </div>

                    {/* Loading Overlay */}
                    {isSubmitting && (
                        <div style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                            backdropFilter: 'blur(4px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 50
                        }}>
                            <div style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(20px)',
                                padding: '32px',
                                borderRadius: '16px',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                border: '1px solid rgba(255, 255, 255, 0.3)'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        border: '2px solid #e5e7eb',
                                        borderTop: '2px solid #4f46e5',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite',
                                        marginBottom: '16px'
                                    }}></div>
                                    <p style={{
                                        color: '#374151',
                                        fontWeight: '500',
                                        margin: 0
                                    }}>Processing verification...</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {appState === APP_STATES.KYC_COMPLETE && renderDashboard()}

            {/* Modal */}
            {modal.visible && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 99,
                    padding: '16px'
                }}>
                    <div style={{
                        backgroundColor: modal.type === 'error' ? '#fef2f2' : modal.type === 'success' ? '#f0fdf4' : '#eff6ff',
                        borderRadius: '16px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        border: modal.type === 'error' ? '1px solid #fecaca' : modal.type === 'success' ? '1px solid #bbf7d0' : '1px solid #bfdbfe',
                        maxWidth: '400px',
                        width: '100%'
                    }}>
                        <div style={{ padding: '24px' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '16px'
                            }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: modal.type === 'error' ? '#fee2e2' : modal.type === 'success' ? '#dcfce7' : '#dbeafe',
                                    flexShrink: 0
                                }}>
                                    {modal.type === 'error' ? (
                                        <AlertCircle style={{ width: '24px', height: '24px', color: '#dc2626' }} />
                                    ) : (
                                        <CheckCircle style={{ width: '24px', height: '24px', color: modal.type === 'success' ? '#16a34a' : '#2563eb' }} />
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{
                                        fontSize: '18px',
                                        fontWeight: '700',
                                        color: '#111827',
                                        margin: '0 0 4px 0'
                                    }}>{modal.title}</h3>
                                    <p style={{
                                        fontSize: '14px',
                                        color: '#6b7280',
                                        margin: 0,
                                        lineHeight: '1.5'
                                    }}>{modal.message}</p>
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '0 24px 24px 24px' }}>
                            <button
                                onClick={closeModal}
                                style={{
                                    width: '100%',
                                    background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                                    color: '#374151',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;