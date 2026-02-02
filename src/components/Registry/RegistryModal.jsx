import React from 'react';
import { X } from 'lucide-react';
import RegistryStep1 from './RegistryStep1';
import RegistryStep2 from './RegistryStep2';
import RegistryStep3 from './RegistryStep3';

/**
 * RegistryModal - Modal containing the multi-step registry form
 * 
 * Props:
 * - show: whether to show the modal
 * - step: current step (1, 2, or 3)
 * - formData: form data object
 * - isSubmitting: loading state during submission
 * - error: error message from submission
 * - onClose: callback to close modal
 * - onUpdate: callback to update form data
 * - onStep2: callback to advance to step 2
 * - onComplete: callback when registry is completed
 */
const RegistryModal = ({ 
  show, 
  step, 
  formData, 
  isSubmitting,
  error,
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

  // Prevent closing while submitting
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
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
            onClick={handleClose}
            disabled={isSubmitting}
            className={`text-gray-400 hover:text-gray-600 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
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
              isSubmitting={isSubmitting}
              error={error}
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
