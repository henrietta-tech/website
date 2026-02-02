import React from 'react';
import { registryContent } from '../../constants/doorContent';

/**
 * RegistryStep3 - Confirmation screen
 * 
 * Shows after successful registration.
 * Mentions email verification.
 */
const RegistryStep3 = ({ onClose }) => {
  const { step3 } = registryContent;

  return (
    <div className="text-center py-4">
      <div className="mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <div className="space-y-4 text-gray-600">
        <p className="font-medium text-gray-900">
          Check your email
        </p>
        <p>
          We've sent you a verification link. Click it to confirm your registration.
        </p>
        <p className="text-sm">
          {step3.content.paragraphs[0]}
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default RegistryStep3;
