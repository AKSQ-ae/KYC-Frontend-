import { useState } from 'react';


const initialPersonalInfo = {
  fullName: '',
  email: '',
  phone: '',
  country: '',
};

const initialFormData = {
  personal: initialPersonalInfo,
  document: null,
  selfie: null,
};

export const useKYCForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePersonalInfo = () => {
    const newErrors = {};
    const { fullName, email, phone, country } = formData.personal;

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!country) {
      newErrors.country = 'Please select a country';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updatePersonalInfo = (field, value) => {
    setFormData(prev => ({
      ...prev,
      personal: { ...prev.personal, [field]: value }
    }));
    
    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const updateDocument = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result ;
      setFormData(prev => ({
        ...prev,
        document: {
          type: prev.document?.type || 'passport',
          data,
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const updateDocumentType = (type) => {
    setFormData(prev => ({
      ...prev,
      document: prev.document ? { ...prev.document, type } : { type, data: '' }
    }));
  };

  const updateSelfie = (imageData) => {
    setFormData(prev => ({ ...prev, selfie: imageData }));
  };

  const nextStep = () => {
    let canProceed = true;

    switch (currentStep) {
      case 1:
        canProceed = validatePersonalInfo();
        break;
      case 2:
        if (!formData.document?.data) {
          alert('Please upload a document');
          canProceed = false;
        }
        break;
      case 3:
        if (!formData.selfie) {
          alert('Please capture a selfie');
          canProceed = false;
        }
        break;
    }

    if (canProceed && currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) );
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) );
    }
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Submitting KYC data:', {
        personal: formData.personal,
        documentType: formData.document?.type,
        hasDocument: !!formData.document?.data,
        hasSelfie: !!formData.selfie,
      });
      
      setCurrentStep(5);
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData(initialFormData);
    setErrors({});
    setIsSubmitting(false);
  };

  return {
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
    resetForm,
  };
};
