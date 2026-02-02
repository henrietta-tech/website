import React, { useState } from 'react';
import { registryContent } from '../../constants/doorContent';
import { validate } from '../../services/registryService';

/**
 * RegistryStep1 - Email + ZIP collection
 * 
 * Includes honeypot field for basic bot detection.
 * Validates on client for UX (server validates for security).
 */
const RegistryStep1 = ({ formData, onUpdate, onSubmit }) => {
  const { step1 } = registryContent;
  const [errors, setErrors] = useState({});
  const [honeypot, setHoneypot] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    const validationErrors = validate({
      email: formData.email,
      zipCode: formData.zipCode
    });
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Pass honeypot to parent
    onUpdate('website', honeypot);
    onSubmit();
  };

  const handleChange = (field, value) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    onUpdate(field, value);
  };

  return (
    <>
      <p className="text-gray-600 mb-6 leading-relaxed">
        {step1.description}
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {step1.fields.map((field) => (
          <div key={field.name}>
            <label 
              htmlFor={field.name}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.label}
            </label>
            <input
              id={field.name}
              type={field.type}
              required={field.required}
              value={formData[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={`w-full px-4 py-3 border outline-none transition-colors ${
                errors[field.name] 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:border-black focus:ring-1 focus:ring-black'
              }`}
              placeholder={field.placeholder}
            />
            {errors[field.name] && (
              <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
            )}
          </div>
        ))}

        {/* Honeypot - hidden from humans */}
        <div 
          aria-hidden="true"
          style={{ 
            position: 'absolute', 
            left: '-9999px', 
            opacity: 0,
            pointerEvents: 'none'
          }}
        >
          <label htmlFor="website">Website</label>
          <input
            type="text"
            id="website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white px-8 py-4 text-lg font-medium hover:bg-gray-800 transition-colors mt-6"
        >
          Submit →
        </button>
      </form>
    </>
  );
};

export default RegistryStep1;
