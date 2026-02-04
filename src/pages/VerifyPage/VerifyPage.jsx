import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const VerifyPage = () => {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState('loading');
  const [firstName, setFirstName] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setState('invalid');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/verify?token=${token}`);
        const data = await res.json();
        
        setState(data.status);
        if (data.firstName) {
          setFirstName(data.firstName);
        }
      } catch (e) {
        console.error('Verification error:', e);
        setState('error');
      }
    };

    verify();
  }, [searchParams]);

  if (state === 'success') {
    return <SuccessState firstName={firstName} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      {state === 'loading' && <LoadingState />}
      {state === 'already_verified' && <AlreadyVerifiedState />}
      {(state === 'expired' || state === 'not_found') && <ExpiredState />}
      {(state === 'invalid' || state === 'error') && <ErrorState />}
    </div>
  );
};

const LoadingState = () => (
  <p className="text-gray-400 text-lg">Verifying...</p>
);

const SuccessState = ({ firstName }) => (
  <div 
    className="min-h-screen flex flex-col items-center justify-center px-6"
    style={{ backgroundColor: '#7B85B8' }}
  >
    {/* Acknowledgment */}
    <p className="text-white/80 text-lg font-medium mb-1">
      {firstName ? `${firstName}, you're in.` : "You're in."}
    </p>
    <p className="text-white/60 text-sm mb-10 leading-relaxed">
      We'll be careful with this.
    </p>
    
    {/* Henrietta */}
    <h1 
      className="font-bold text-white leading-none select-none text-center"
      style={{ 
        fontSize: 'clamp(4.5rem, 22vw, 12rem)',
        letterSpacing: '-0.02em'
      }}
    >
      Henrietta
    </h1>
    
    {/* Reassurance */}
    <p className="text-white/70 text-base mt-12 mb-6 max-w-md text-center leading-relaxed">
      You won't hear from us often—only when there's something meaningful to share.
    </p>
    
    {/* Escape hatches */}
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
  <div className="text-center">
    <p className="text-gray-600 text-lg font-medium mb-2">You're already part of this.</p>
    <p className="text-sm text-gray-400 mb-6">No action needed.</p>
    <Link to="/" className="text-sm text-[#F97AD7] hover:text-[#ff8de0] transition-colors">
      ← Return to Henrietta
    </Link>
  </div>
);

const ExpiredState = () => (
  <div className="text-center">
    <p className="text-gray-600 text-lg font-medium mb-2">This link didn't work.</p>
    <p className="text-sm text-gray-400 mb-6">It may have expired or already been used.</p>
    <Link to="/" className="text-sm text-[#F97AD7] hover:text-[#ff8de0] transition-colors">
      Rejoin the registry →
    </Link>
  </div>
);

const ErrorState = () => (
  <div className="text-center">
    <p className="text-gray-600 text-lg font-medium mb-2">Something went wrong.</p>
    <p className="text-sm text-gray-400 mb-6">Please try again.</p>
    <Link to="/" className="text-sm text-[#F97AD7] hover:text-[#ff8de0] transition-colors">
      ← Return to Henrietta
    </Link>
  </div>
);

export default VerifyPage;
