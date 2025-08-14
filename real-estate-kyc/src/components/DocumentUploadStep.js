import React, { useRef } from 'react';
import { Upload, FileText, Check, Camera, AlertCircle } from 'lucide-react';



const documentTypes = [
  { value: 'passport', label: 'Passport', icon: '🛂' },
  { value: 'driver', label: "Driver's License", icon: '🚗' },
  { value: 'national', label: 'National ID Card', icon: '🆔' },
];

export const DocumentUploadStep = ({
  documentData,
  onDocumentUpload,
  onDocumentTypeChange,
  onNext,
  onBack,
}) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (event: React.ChangeEvent) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      onDocumentUpload(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      onDocumentUpload(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Document</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Upload a clear photo of your government-issued identification document
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-4">
          Select Document Type *
        </label>
        <div className="grid grid-cols-1 gap-3">
          {documentTypes.map((type) => (
            <label
              key={type.value}
              className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                (documentData?.type || 'passport') === type.value
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="documentType"
                value={type.value}
                checked={(documentData?.type || 'passport') === type.value}
                onChange={(e) => onDocumentTypeChange(e.target.value )}
                className="sr-only"
              />
              <span className="text-2xl mr-3">{type.icon}</span>
              <span className="font-medium text-gray-900">{type.label}</span>
              {(documentData?.type || 'passport') === type.value && (
                <Check className="w-5 h-5 text-indigo-600 ml-auto" />
              )}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
            documentData
              ? 'border-green-400 bg-green-50 hover:bg-green-100'
              : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          
          {documentData ? (
            <>
              <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <div className="text-xl font-semibold text-gray-900 mb-2">Document uploaded successfully!</div>
              <div className="text-green-600 font-medium">Click to replace with a different image</div>
            </>
          ) : (
            <>
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <div className="text-xl font-semibold text-gray-900 mb-2">Click to upload or drag and drop</div>
              <div className="text-gray-500">PNG, JPG, JPEG up to 10MB</div>
            </>
          )}
        </div>

        {documentData && (
          <div className="bg-gray-50 p-6 rounded-2xl">
            <h3 className="font-semibold text-gray-900 mb-3">Document Preview</h3>
            <img
              src={documentData.data}
              alt="Document preview"
              className="max-w-full h-auto rounded-xl shadow-md"
            />
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Camera className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-blue-800 mb-1">Photo Tips</div>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Ensure the document is well-lit and clearly visible</li>
                <li>• All text should be readable</li>
                <li>• Avoid glare and shadows</li>
                <li>• Make sure the entire document fits in the frame</li>
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
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!documentData?.data}
          className={`px-10 py-4 font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 ${
            documentData?.data
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:transform hover:-translate-y-1 hover:shadow-xl focus:ring-indigo-300'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Selfie
        </button>
      </div>
    </div>
  );
};
