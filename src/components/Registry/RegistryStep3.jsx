import React from 'react';
import { registryContent } from '../../constants/doorContent';

/**
 * RegistryStep3 - Confirmation step after registry completion
 * @param {Function} onClose - Callback to close registry modal
 */
const RegistryStep3 = ({ onClose }) => {
  const { step3 } = registryContent;

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="text-6xl mb-4">✓</div>
        <p className="text-xl font-medium text-gray-900 mb-4">{step3.title}</p>
      </div>

      <div className="space-y-4 text-gray-700 leading-relaxed">
        {step3.content.paragraphs.map((para, index) => (
          <p key={index}>{para}</p>
        ))}
        
        <div className="flex flex-col sm:flex-row gap-3 py-4">
          {step3.content.links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="flex-1 border-2 border-gray-300 text-gray-700 px-4 py-3 text-center font-medium hover:bg-gray-50 transition-colors"
            >
              {link.text}
            </a>
          ))}
        </div>
        
        <p className="text-center text-gray-600">{step3.content.closing}</p>
      </div>

      <button
        onClick={onClose}
        className="w-full bg-black text-white px-6 py-3 font-medium hover:bg-gray-800 transition-colors mt-6"
      >
        Close
      </button>
    </div>
  );
};

export default RegistryStep3;
