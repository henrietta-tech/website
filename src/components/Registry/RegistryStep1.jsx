import React from 'react';
import { registryContent } from '../../constants/doorContent';

/**
 * RegistryStep1 - First step of registry form (email and ZIP)
 * @param {Object} formData - Current form data
 * @param {Function} onUpdate - Callback to update form data
 * @param {Function} onSubmit - Callback when form is submitted
 */
const RegistryStep1 = ({ formData, onUpdate, onSubmit }) => {
  const { step1 } = registryContent;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <>
      <p className="text-gray-600 mb-6 leading-relaxed">
        {step1.description}
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {step1.fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <input
              type={field.type}
              required={field.required}
              pattern={field.pattern}
              value={formData[field.name]}
              onChange={(e) => onUpdate(field.name, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
              placeholder={field.placeholder}
            />
          </div>
        ))}

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
