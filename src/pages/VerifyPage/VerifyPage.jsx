import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const VerifyPage = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const name = searchParams.get('name');

  const states = {
    success: () => <SuccessState name={name} />,
    'already-verified': () => <AlreadyVerifiedState />,
    expired: () => <ExpiredState />,
    invalid: () => <ErrorState />,
    error: () => <ErrorState />,
  };

  const StateComponent = states[status] || states.error;

  return <StateComponent />;
};

const SuccessState = ({ name }) => (
  <div 
    className="min-h-screen flex flex-col items-center justify-center px-6"
    style={{ backgroundColor: '#7B85B8' }}
  >
    <p 
      className="text-white font-bold mb-2"
      style={{ fontSize: 'clamp(2rem, 8vw, 4rem)' }}
    >
      {name ? `${name}, you're in.` : "You're in."}
    </p>
    <p className="text-white/60 text-lg mb-12 leading-relaxed">
      We'll be careful with this.
    </p>
    
    <h1 
      className="font-bold text-white/30 leading-none select-none text-center"
      style={{ 
        fontSize: 'clamp(4rem, 18vw, 10rem)',
        letterSpacing: '-0.02em'
      }}
    >
      Henrietta
    </h1>
    
    <p className="text-white/70 text-base mt-12 mb-6 max-w-md text-center leading-relaxed">
      You won't hear from us often—only when there's something meaningful to share.
    </p>
    
    <div className="flex justify-center gap-8 text-sm font-medium">
      <Link 
        to="/statement" 
        className="text-[#F97AD7] hover:text-[#ff8de0] transition-colors"
      >
        Statement of Use
      </Link>
      <Link 
        to="/" 
        className="text-[#F97AD7] hover:text-[#ff8de0] transition-colors"
      >
        ← Return to Henrietta
      </Link>
    </div>
  </div>
);

const AlreadyVerifiedState = () => (
  <div className="min-h-screen flex items-center justify-center bg-white px-6">
    <div className="text-center">
      <p className="text-gray-600 text-lg font-medium mb-2">You're already part of this.</p>
      <p className="text-sm text-gray-400 mb-6">No action needed.</p>
      <Link to="/" className="text-sm text-[#F97AD7] hover:text-[#ff8de0] transition-colors">
        ← Return to Henrietta
      </Link>
    </div>
  </div>
);

const ExpiredState = () => (
  <div className="min-h-screen flex items-center justify-center bg-white px-6">
    <div className="text-center">
      <p className="text-gray-600 text-lg font-medium mb-2">This link didn't work.</p>
      <p className="text-sm text-gray-400 mb-6">It may have expired or already been used.</p>
      <Link to="/" className="text-sm text-[#F97AD7] hover:text-[#ff8de0] transition-colors">
        Rejoin the registry →
      </Link>
    </div>
  </div>
);

const ErrorState = () => (
  <div className="min-h-screen flex items-center justify-center bg-white px-6">
    <div className="text-center">
      <p className="text-gray-600 text-lg font-medium mb-2">Something went wrong.</p>
      <p className="text-sm text-gray-400 mb-6">Please try again.</p>
      <Link to="/" className="text-sm text-[#F97AD7] hover:text-[#ff8de0] transition-colors">
        ← Return to Henrietta
      </Link>
    </div>
  </div>
);

export default VerifyPage;