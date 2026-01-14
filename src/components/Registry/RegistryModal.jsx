import React from 'react';
import { X } from 'lucide-react';
import RegistryStep1 from './RegistryStep1';
import RegistryStep2 from './RegistryStep2';
import RegistryStep3 from './RegistryStep3';

/**
 * RegistryModal - Modal containing the multi-step registry form
 * @param {boolean} show - Whether to show the modal
 * @param {number} step - Current step (1, 2, or 3)
 * @param {Object} formData - Form data object
 * @param {Function} onClose - Callback to close modal
 * @param {Function} onUpdate - Callback to update form data
 * @param {Function} onStep2 - Callback to advance to step 2
 * @param {Function} onComplete - Callback when registry is completed
 */
const RegistryModal = ({ 
  show, 
  step, 
  formData, 
  onClose, 
  onUpdate, 
  onStep2, 
  onComplete 
}) => {
  if (!show) return null;

  const getTitle = () => {
    switch (step) {
      case 1: return 'Join the Registry';
      case 2: return 'Help us understand better';
      case 3: return 'You\'re in';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {getTitle()}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <RegistryStep1
              formData={formData}
              onUpdate={onUpdate}
              onSubmit={onStep2}
            />
          )}

          {step === 2 && (
            <RegistryStep2
              formData={formData}
              onUpdate={onUpdate}
              onComplete={onComplete}
            />
          )}

          {step === 3 && (
            <RegistryStep3 onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistryModal;
