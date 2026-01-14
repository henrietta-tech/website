import React from 'react';

/**
 * MobileCTA component - Sticky CTA button that appears on mobile after engagement
 * @param {boolean} show - Whether to show the CTA
 * @param {Function} onClick - Callback when CTA is clicked
 */
const MobileCTA = ({ show, onClick }) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 shadow-lg p-4 animate-slideUp z-40">
      <button
        onClick={onClick}
        className="w-full bg-black text-white px-6 py-3 font-medium hover:bg-gray-800 transition-colors"
      >
        Help build this →
      </button>
    </div>
  );
};

export default MobileCTA;
