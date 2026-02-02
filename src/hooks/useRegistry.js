import { useState, useCallback } from 'react';
import { submitRegistry } from '../services/registryService';

/**
 * useRegistry - Manages form state and submission
 */
export const useRegistry = () => {
  const [showRegistry, setShowRegistry] = useState(false);
  const [registryStep, setRegistryStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    zipCode: '',
    inDPC: '',
    contactPreference: '',
    referralSource: '',
    website: ''  // honeypot
  });

  const openRegistry = useCallback(() => {
    setShowRegistry(true);
    setError(null);
  }, []);

  const closeRegistry = useCallback(() => {
    setShowRegistry(false);
    setRegistryStep(1);
    setError(null);
    setFormData({
      email: '',
      zipCode: '',
      inDPC: '',
      contactPreference: '',
      referralSource: '',
      website: ''
    });
  }, []);

  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  }, []);

  const goToStep2 = useCallback(() => {
    setRegistryStep(2);
  }, []);

  const completeRegistry = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitRegistry(formData);

      if (result.success) {
        setRegistryStep(3);
      } else {
        setError(result.error);
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  return {
    showRegistry,
    registryStep,
    formData,
    isSubmitting,
    error,
    openRegistry,
    closeRegistry,
    updateFormData,
    goToStep2,
    completeRegistry
  };
};
