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
  <p className="text-gray-400">Verifying...</p>
);

const SuccessState = ({ firstName }) => (
  <div 
    className="min-h-screen flex flex-col items-center justify-center px-6"
    style={{ backgroundColor: '#7B85B8' }}
  >
    {/* Acknowledgment */}
    <p className="text-white/70 text-sm mb-1">
      {firstName ? `${firstName}, you're in.` : "You're in."}
    </p>
    <p className="text-white/50 text-xs mb-10">
      We'll be careful with this.
    </p>
    
    {/* Henrietta - contained, centered, breathing */}
    <h1 
      className="font-bold text-white tracking-tight leading-none select-none text-center"
      style={{ fontSize: 'clamp(4rem, 18vw, 10rem)' }}
    >
      Henrietta
    </h1>
    
    {/* Reassurance */}
    <p className="text-white/60 text-sm mt-12 mb-6 max-w-sm text-center">
      You won't hear from us often—only when there's something meaningful to share.
    </p>
    
    {/* Escape hatches */}
    <div className="flex justify-center gap-6 text-xs text-white/30">
      <Link to="/statement" className="hover:text-white/50 transition-colors">
        Statement of Use
      </Link>
      <Link to="/" className="hover:text-white/50 transition-colors">
        ← Return to Henrietta
      </Link>
    </div>
  </div>
);

const AlreadyVerifiedState = () => (
  <div className="text-center">
    <p className="text-gray-600 mb-2">You're already part of this.</p>
    <p className="text-sm text-gray-400 mb-6">No action needed.</p>
    <Link to="/" className="text-sm text-[#7B85B8] hover:text-[#6A7399] transition-colors">
      ← Return to Henrietta
    </Link>
  </div>
);

const ExpiredState = () => (
  <div className="text-center">
    <p className="text-gray-600 mb-2">This link didn't work.</p>
    <p className="text-sm text-gray-400 mb-6">It may have expired or already been used.</p>
    <Link to="/" className="text-sm text-[#7B85B8] hover:text-[#6A7399] transition-colors">
      Rejoin the registry →
    </Link>
  </div>
);

const ErrorState = () => (
  <div className="text-center">
    <p className="text-gray-600 mb-2">Something went wrong.</p>
    <p className="text-sm text-gray-400 mb-6">Please try again.</p>
    <Link to="/" className="text-sm text-[#7B85B8] hover:text-[#6A7399] transition-colors">
      ← Return to Henrietta
    </Link>
  </div>
);

export default VerifyPage;
