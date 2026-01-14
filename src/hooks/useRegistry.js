import { useState } from 'react';

/**
 * Custom hook to manage registry form state and progression
 * @returns {Object} Registry state and control functions
 */
export const useRegistry = () => {
  const [showRegistry, setShowRegistry] = useState(false);
  const [registryStep, setRegistryStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    zipCode: '',
    inDPC: '',
    contactPreference: '',
    referralSource: ''
  });

  const openRegistry = () => {
    setShowRegistry(true);
  };

  const closeRegistry = () => {
    setShowRegistry(false);
    setRegistryStep(1);
    setFormData({
      email: '',
      zipCode: '',
      inDPC: '',
      contactPreference: '',
      referralSource: ''
    });
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const goToStep2 = () => {
    setRegistryStep(2);
  };

  const completeRegistry = () => {
    setRegistryStep(3);
    // Here you would normally send formData to your API/service
    console.log('Registry submitted:', formData);
  };

  return {
    showRegistry,
    registryStep,
    formData,
    openRegistry,
    closeRegistry,
    updateFormData,
    goToStep2,
    completeRegistry
  };
};
