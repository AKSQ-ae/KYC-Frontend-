import React from 'react';
import { CheckCircle, Clock, Mail, RefreshCw } from 'lucide-react';


export const SuccessStep = ({ onReset }) => {
  return (
    <div className="text-center space-y-8 py-12">
      <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-8 animate-bounce">
        <CheckCircle className="w-16 h-16 text-white" />
      </div>
      
      <div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Verification Submitted!</h2>
        <p className="text-gray-600 max-w-lg mx-auto text-lg leading-relaxed">
          Your KYC verification has been successfully submitted. Our team will review your information and notify you of the results.
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 max-w-md mx-auto">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-indigo-600" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Processing Time</div>
              <div className="text-gray-600 text-sm">24-48 hours</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-indigo-600" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Notification</div>
              <div className="text-gray-600 text-sm">Via email</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="text-green-800 font-semibold mb-1">What happens next?</div>
          <div className="text-green-700 text-sm">
            Our verification team will review your documents and selfie. You'll receive an email confirmation once the process is complete.
          </div>
        </div>

        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-300 mx-auto"
        >
          <RefreshCw className="w-5 h-5" />
          Start New Verification
        </button>
      </div>
    </div>
  );
};
