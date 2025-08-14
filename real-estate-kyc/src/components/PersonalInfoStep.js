import React from 'react';
import { User, Mail, Phone, Globe } from 'lucide-react';



export const PersonalInfoStep = ({
  formData,
  errors,
  countries,
  onFieldChange,
  onNext,
}) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Personal Information</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Please provide your basic information to get started with the verification process
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="fullName" className="flex items-center text-sm font-semibold text-gray-700 mb-3">
            <User className="w-4 h-4 mr-2 text-indigo-600" />
            Full Name *
          </label>
          <input
            type="text"
            id="fullName"
            value={formData.fullName}
            onChange={(e) => onFieldChange('fullName', e.target.value)}
            placeholder="Enter your full legal name"
            className={`w-full px-4 py-4 border-2 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              errors.fullName 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-200 hover:border-gray-300 focus:border-indigo-500'
            }`}
            required
          />
          {errors.fullName && (
            <div className="flex items-center mt-2">
              <span className="text-red-500 text-xs">{errors.fullName}</span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="email" className="flex items-center text-sm font-semibold text-gray-700 mb-3">
            <Mail className="w-4 h-4 mr-2 text-indigo-600" />
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => onFieldChange('email', e.target.value)}
            placeholder="your.email@example.com"
            className={`w-full px-4 py-4 border-2 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              errors.email 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-200 hover:border-gray-300 focus:border-indigo-500'
            }`}
            required
          />
          {errors.email && (
            <div className="flex items-center mt-2">
              <span className="text-red-500 text-xs">{errors.email}</span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="flex items-center text-sm font-semibold text-gray-700 mb-3">
            <Phone className="w-4 h-4 mr-2 text-indigo-600" />
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => onFieldChange('phone', e.target.value)}
            placeholder="+1 234 567 8900"
            className={`w-full px-4 py-4 border-2 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              errors.phone 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-200 hover:border-gray-300 focus:border-indigo-500'
            }`}
            required
          />
          {errors.phone && (
            <div className="flex items-center mt-2">
              <span className="text-red-500 text-xs">{errors.phone}</span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="country" className="flex items-center text-sm font-semibold text-gray-700 mb-3">
            <Globe className="w-4 h-4 mr-2 text-indigo-600" />
            Country of Residence *
          </label>
          <select
            id="country"
            value={formData.country}
            onChange={(e) => onFieldChange('country', e.target.value)}
            className={`w-full px-4 py-4 border-2 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              errors.country 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-200 hover:border-gray-300 focus:border-indigo-500'
            }`}
            required
          >
            <option value="">Select your country</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
          {errors.country && (
            <div className="flex items-center mt-2">
              <span className="text-red-500 text-xs">{errors.country}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-8">
        <button
          onClick={onNext}
          className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-300"
        >
          Continue to Document Upload
        </button>
      </div>
    </div>
  );
};
