import { useState, useEffect } from 'react';

/**
 * Custom hook to track scroll position and determine mobile CTA visibility
 * @param {Object} expandedDoors - Current state of expanded doors
 * @param {Object} door6Ref - Reference to the 6th door element
 * @returns {boolean} Whether mobile CTA should be shown
 */
export const useScrollTracking = (expandedDoors, door6Ref) => {
  const [showMobileCTA, setShowMobileCTA] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Count how many doors are currently opened
      const doorsOpened = Object.values(expandedDoors).filter(Boolean).length;
      
      // Show CTA after 2+ doors opened and user has scrolled past hero
      const shouldShow = doorsOpened >= 2 && window.scrollY > 400;
      
      // Hide when Door 6 is in view (user has reached the action section)
      if (door6Ref.current) {
        const rect = door6Ref.current.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isInView) {
          setShowMobileCTA(false);
          return;
        }
      }
      
      setShowMobileCTA(shouldShow);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [expandedDoors, door6Ref]);

  return showMobileCTA;
};
