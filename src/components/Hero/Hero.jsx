import React from 'react';
import { heroContent } from '../../constants/doorContent';
import heroBackground from '../../assets/hero-background.svg';

/**
 * Hero component - Landing section with medical pattern background
 * Primary conversion point with two intentional paths
 * Mobile-optimized pattern visibility while preserving desktop design
 */
const Hero = ({ onJoinRegistry, onUnderstandWhy }) => {
  return (
    <div 
      className="relative min-h-screen overflow-hidden"
      style={{
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
      }}
    >
      {/* Background Layer: Medical Silhouette Pattern - Proper tiling */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${heroBackground})`,
          // Mobile: auto width, 60% height with full repeat, Desktop: contain with repeat
          backgroundSize: window.innerWidth < 768 ? 'auto 60%' : 'contain',
          backgroundPosition: 'top center',
          backgroundRepeat: 'repeat',
          minHeight: '100%'
        }}
      />
      
      {/* Content Layer */}
      <div className="relative max-w-3xl mx-auto px-6 py-16 md:py-24">
        <div className="space-y-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#2A3B47] mb-4">
            {heroContent.title}<sup className="text-sm opacity-70 font-normal ml-1">™</sup>
          </h1>
          
          {/* Pink Gradient Fade Line */}
          <div 
            className="w-full h-1 mb-6"
            style={{
              background: 'linear-gradient(to right, #C9A8FF 0%, rgba(255, 105, 180, 0) 100%)'
            }}
          />
          
          {/* Content with spacing-based hierarchy */}
          <div className="text-lg md:text-xl leading-relaxed text-[#2A3B47]">
            {/* Paragraph 1 - Problem statement */}
            <p className="mb-10">
              {heroContent.paragraphs[0]}
            </p>
            
            {/* Paragraph 2 - Value proposition (extra spacing creates emphasis) */}
            <p className="my-12">
              {heroContent.paragraphs[1]}
            </p>
            
            {/* Paragraph 3 - Approach */}
            <p>
              {heroContent.paragraphs[2]}
            </p>
          </div>

          {/* CTAs - Compact buttons that hug content */}
          <div className="pt-12">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              
              {/* Primary CTA */}
              <button
                onClick={onJoinRegistry}
                className="
                  inline-flex items-center justify-center gap-2
                  bg-[#7B85B8] text-white
                  px-5 py-2.5
                  text-sm font-medium
                  rounded-lg
                  hover:bg-[#6A7399]
                  transition-colors
                  whitespace-nowrap
                "
              >
                Join the Registry
                <span className="text-[#C9A8FF]">→</span>
              </button>

              {/* Secondary CTA */}
              <button
                onClick={onUnderstandWhy}
                className="
                  inline-flex items-center justify-center gap-2
                  border border-[#7B85B8]
                  text-[#4A5F7A]
                  px-5 py-2.5
                  text-sm font-medium
                  rounded-lg
                  hover:bg-white/50
                  transition-colors
                  whitespace-nowrap
                "
              >
                Understand Why →
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;