import React from 'react';
import { registryContent } from '../../constants/doorContent';

/**
 * RegistryStep2 - Optional questions (DPC status, contact preference)
 */
const RegistryStep2 = ({ formData, onUpdate, onComplete, isSubmitting, error }) => {
  const { step2 } = registryContent;
  
  return (
    <div className="space-y-6">
      <p className="text-gray-600 text-sm">
        {step2.description}
      </p>
      
      {step2.questions.map((question) => (
        <div key={question.name}>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {question.label}
          </label>
          
          {question.type === 'radio' ? (
            <div className="space-y-2">
              {question.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-3 cursor-pointer py-2"
                >
                  <input
                    type="radio"
                    name={question.name}
                    value={option}
                    checked={formData[question.name] === option}
                    onChange={(e) => onUpdate(question.name, e.target.value)}
                    className="w-4 h-4"
                    disabled={isSubmitting}
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
              {question.hint && (
                <p className="text-gray-400 text-sm mt-2 italic pl-7">
                  {question.hint}
                </p>
              )}
            </div>
          ) : (
            <input
              type={question.type}
              value={formData[question.name]}
              onChange={(e) => onUpdate(question.name, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
              placeholder={question.placeholder}
              disabled={isSubmitting}
            />
          )}
        </div>
      ))}
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      
      <div className="flex flex-col gap-3 pt-4">
        <button
          onClick={onComplete}
          disabled={isSubmitting}
          className={`w-full px-6 py-3 font-medium transition-colors ${
            isSubmitting
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Complete'}
        </button>
        
        <button
          onClick={onComplete}
          disabled={isSubmitting}
          className="w-full text-gray-500 text-sm hover:text-gray-700 transition-colors py-2 disabled:opacity-50"
        >
          Skip and complete registration
        </button>
      </div>
    </div>
  );
};

export default RegistryStep2;