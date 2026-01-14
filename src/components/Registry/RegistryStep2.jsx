import React from 'react';
import { registryContent } from '../../constants/doorContent';

/**
 * RegistryStep2 - Second step of registry form (optional questions)
 * @param {Object} formData - Current form data
 * @param {Function} onUpdate - Callback to update form data
 * @param {Function} onComplete - Callback when complete is clicked
 */
const RegistryStep2 = ({ formData, onUpdate, onComplete }) => {
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
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          ) : (
            <input
              type={question.type}
              value={formData[question.name]}
              onChange={(e) => onUpdate(question.name, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
              placeholder={question.placeholder}
            />
          )}
        </div>
      ))}

      <div className="flex flex-col gap-3 pt-4">
        <button
          onClick={onComplete}
          className="w-full bg-black text-white px-6 py-3 font-medium hover:bg-gray-800 transition-colors"
        >
          Complete
        </button>
        
        <button
          onClick={onComplete}
          className="w-full text-gray-500 text-sm hover:text-gray-700 transition-colors py-2"
        >
          Skip and complete registration
        </button>
      </div>
    </div>
  );
};

export default RegistryStep2;
