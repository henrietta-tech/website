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
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Layer: Medical Silhouette Pattern - Slightly larger for prominence */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${heroBackground})`,
          // Mobile: auto width, 150% height for more prominent heads, Desktop: contain with repeat
          backgroundSize: window.innerWidth < 768 ? 'auto 150%' : 'contain',
          backgroundPosition: 'top center',
          backgroundRepeat: window.innerWidth < 768 ? 'repeat-x' : 'repeat-y',
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
              background: 'linear-gradient(to right, #FF69B4 0%, rgba(255, 105, 180, 0) 100%)'
            }}
          />
          
          <div className="space-y-6 text-lg md:text-xl leading-relaxed text-[#2A3B47]">
            {heroContent.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="border-l-4 border-[#2A3B47] pl-6 my-10">
            <p className="text-lg md:text-xl font-medium text-[#2A3B47] leading-relaxed">
              {heroContent.highlight}
            </p>
          </div>

          {/* CTAs - Compact buttons that hug content */}
          <div className="pt-8">
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
                <span className="text-[#FF69B4]">→</span>
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