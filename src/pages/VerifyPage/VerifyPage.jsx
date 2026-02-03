import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Navigation, Footer } from '../../components';

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

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-lg w-full text-center">
          {state === 'loading' && <LoadingState />}
          {state === 'success' && <SuccessState firstName={firstName} />}
          {state === 'already_verified' && <AlreadyVerifiedState />}
          {(state === 'expired' || state === 'not_found') && <ExpiredState />}
          {(state === 'invalid' || state === 'error') && <ErrorState />}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

const LoadingState = () => (
  <p className="text-gray-500">Verifying...</p>
);

const SuccessState = ({ firstName }) => (
  <div className="space-y-8">
    <div className="space-y-2">
      <p className="text-lg text-[#2A3B47]">
        {firstName ? `${firstName}, you're in.` : "You're in."}
      </p>
      <p className="text-gray-600">We'll be careful with this.</p>
    </div>
    
    <div className="py-12">
      <h1 className="text-6xl md:text-7xl font-bold text-[#2A3B47] tracking-tight">
        Henrietta
      </h1>
      <div 
        className="w-48 h-1 mx-auto mt-4"
        style={{ background: 'linear-gradient(to right, #E8D4FF 0%, transparent 100%)' }}
      />
    </div>
    
    <div className="space-y-4 text-sm text-gray-500">
      <p>You won't hear from us often—only when there's something meaningful to share.</p>
      <div className="flex justify-center gap-6 pt-4">
        <Link to="/statement" className="hover:text-[#2A3B47] transition-colors">Statement of Use</Link>
        <Link to="/explore" className="hover:text-[#2A3B47] transition-colors">Explore</Link>
      </div>
    </div>
  </div>
);

const AlreadyVerifiedState = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-[#2A3B47]">You're already part of this.</h1>
    <p className="text-gray-600">No action needed. We'll be in touch when there's something worth sharing.</p>
    <Link to="/" className="inline-block text-sm text-gray-500 hover:text-[#2A3B47] transition-colors">← Back to Henrietta</Link>
  </div>
);

const ExpiredState = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-[#2A3B47]">This link didn't work.</h1>
    <p className="text-gray-600">It may have expired or already been used.</p>
    <Link to="/" className="inline-block text-[#7B85B8] hover:text-[#6A7399] transition-colors">Rejoin the registry →</Link>
  </div>
);

const ErrorState = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-[#2A3B47]">Something went wrong.</h1>
    <p className="text-gray-600">Please try clicking the link again, or rejoin the registry.</p>
    <Link to="/" className="inline-block text-[#7B85B8] hover:text-[#6A7399] transition-colors">Back to Henrietta →</Link>
  </div>
);

export default VerifyPage;
