import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const UnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');

  const states = {
    success: SuccessState,
    invalid: ErrorState,
    error: ErrorState,
  };

  const StateComponent = states[status] || ErrorState;

  return <StateComponent />;
};

const SuccessState = () => (
  <div 
    className="min-h-screen flex flex-col items-center justify-center px-6"
    style={{ backgroundColor: '#7B85B8' }}
  >
    <p className="text-white/80 text-2xl font-medium mb-1">
      You've stepped out.
    </p>
    <p className="text-white/60 text-sm mb-10 leading-relaxed">
      We're grateful you spent time with us.
    </p>
    
    <h1 
      className="font-bold text-white leading-none select-none text-center"
      style={{ 
        fontSize: 'clamp(4.5rem, 22vw, 12rem)',
        letterSpacing: '-0.02em'
      }}
    >
      Henrietta
    </h1>
    
    <p className="text-white/70 text-base mt-12 mb-6 max-w-md text-center leading-relaxed">
      If you ever want back in, you know where to find us.
    </p>
    
    <Link 
      to="/" 
      className="text-[#F97AD7] hover:text-[#ff8de0] transition-colors text-sm font-medium"
    >
      ← Return to Henrietta
    </Link>
  </div>
);

const ErrorState = () => (
  <div className="min-h-screen flex items-center justify-center bg-white px-6">
    <div className="text-center">
      <p className="text-gray-600 text-lg font-medium mb-2">Something went wrong.</p>
      <p className="text-sm text-gray-400 mb-6">Please try again or contact us directly.</p>
      <Link to="/" className="text-sm text-[#F97AD7] hover:text-[#ff8de0] transition-colors">
        ← Return to Henrietta
      </Link>
    </div>
  </div>
);

export default UnsubscribePage;