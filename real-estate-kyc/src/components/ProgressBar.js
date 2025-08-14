import React from 'react';



const steps = [
  { number: 1, label: 'Personal Info' },
  { number: 2, label: 'Document' },
  { number: 3, label: 'Selfie' },
  { number: 4, label: 'Review' },
];

export const ProgressBar = ({ currentStep }) => {
  return (
    <div className="flex justify-between px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100">
      {steps.map((step, index) => (
        <div key={step.number} className="flex-1 text-center relative">
          {index < steps.length - 1 && (
            <div 
              className={`absolute top-4 left-1/2 w-full h-0.5 z-0 transition-all duration-500 ${
                currentStep > step.number 
                  ? 'bg-gradient-to-r from-green-500 to-green-600' 
                  : currentStep === step.number
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                  : 'bg-gray-300'
              }`}
            />
          )}
          <div className="relative z-10">
            <div
              className={`w-8 h-8 rounded-full inline-flex items-center justify-center text-sm font-bold mb-2 transition-all duration-500 transform ${
                currentStep > step.number
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white scale-110 shadow-lg'
                  : currentStep === step.number
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white scale-110 shadow-lg animate-pulse'
                  : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
              }`}
            >
              {currentStep > step.number ? '✓' : step.number}
            </div>
            <div className={`text-xs font-medium transition-colors duration-300 ${
              currentStep >= step.number ? 'text-gray-800' : 'text-gray-500'
            }`}>
              {step.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
