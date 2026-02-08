import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Navigation component - Persistent utility navigation
 * Provides access to Statement of Use and Join registry from any page
 */
const Navigation = ({ onJoinRegistry }) => {
  const location = useLocation();
  const isDarkPage = location.pathname === '/statement' || location.pathname === '/explore';
  
  return (
    <nav className={isDarkPage ? "bg-[#231F20] border-b border-[#8B9FE8]/40" : "bg-[#8B9FE8]"}>
      <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link 
          to="/" 
          className={`text-xl font-semibold transition-colors ${
            isDarkPage 
              ? "text-[#7B85B8] hover:text-[#8B9FE8]" 
              : "text-white hover:text-white/90"
          }`}
        >
          Henrietta<sup className="text-xs opacity-80 font-normal ml-0.5">™</sup>
        </Link>
        
        <div className="flex items-center gap-6 text-sm">
          <Link 
            to="/statement" 
            className="text-white/80 hover:text-white transition-colors"
          >
            Statement of Use
          </Link>
          <button 
            onClick={onJoinRegistry}
            className="text-white/80 hover:text-white transition-colors font-medium"
          >
            Join
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;