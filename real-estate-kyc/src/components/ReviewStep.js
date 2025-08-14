import React from 'react';
import { Check, User, Mail, Phone, Globe, FileText, Camera, Shield } from 'lucide-react';



const documentTypeLabels = {
  passport: 'Passport',
  driver: "Driver's License",
  national: 'National ID Card',
};

export const ReviewStep = ({
  formData,
  countries,
  onSubmit,
  onBack,
}) => {
  const getCountryName = (code) => {
    const country = countries.find(c => c.code === code);
    return country?.name || code;
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Review & Submit</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Please review your information carefully before submitting for verification
        </p>
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-6 h-6 text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-700">Full Name:</span>
              </div>
              <span className="text-gray-900 font-semibold">{formData.personal.fullName}</span>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-700">Email:</span>
              </div>
              <span className="text-gray-900 font-semibold">{formData.personal.email}</span>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-700">Phone:</span>
              </div>
              <span className="text-gray-900 font-semibold">{formData.personal.phone}</span>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-700">Country:</span>
              </div>
              <span className="text-gray-900 font-semibold">{getCountryName(formData.personal.country)}</span>
            </div>
          </div>
        </div>

        {/* Document Information */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-900">Document Verification</h3>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Document Type:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-900 font-semibold">
                {formData.document ? documentTypeLabels[formData.document.type] : 'Not uploaded'}
              </span>
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Selfie Information */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Camera className="w-6 h-6 text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-900">Identity Verification</h3>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Selfie Photo:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-900 font-semibold">Captured</span>
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-yellow-600 text-2xl">⚠️</div>
          <div>
            <div className="font-bold text-yellow-800 mb-2">Important Notice</div>
            <div className="text-yellow-700 space-y-2">
              <p>By submitting this verification request, you confirm that:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>All information provided is accurate and truthful</li>
                <li>The documents uploaded belong to you</li>
                <li>You consent to identity verification processing</li>
                <li>You understand this process may take 24-48 hours</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-8">
        <button
          onClick={onBack}
          className="px-8 py-4 bg-gray-600 text-white font-semibold rounded-xl transition-all duration-300 hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-300"
        >
          Back to Selfie
        </button>
        <button
          onClick={onSubmit}
          className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-300"
        >
          Submit Verification
        </button>
      </div>
    </div>
  );
};
