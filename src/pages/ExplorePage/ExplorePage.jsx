import React, { useRef } from 'react';
import { Navigation, Door, Footer, MobileCTA, RegistryModal } from '../../components';
import { useDoorState, useRegistry, useScrollTracking } from '../../hooks';
import { doorContent } from '../../constants/doorContent';
import exploreBackground from '../../assets/explore-background.svg';

const ExplorePage = () => {
  const door6Ref = useRef(null);

  const {
    expandedDoors,
    doorsHighlighted,
    toggleDoor
  } = useDoorState();

  const {
    showRegistry,
    registryStep,
    formData,
    openRegistry,
    closeRegistry,
    updateFormData,
    goToStep2,
    completeRegistry
  } = useRegistry();

  const showMobileCTA = useScrollTracking(expandedDoors, door6Ref);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation onJoinRegistry={openRegistry} />
      
      {/* Header Section - Intentional arrival moment with vertical silence */}
      <div className="bg-[#231F20] px-6 pt-20 pb-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-[#7B85B8] mb-4">
            Henrietta
          </h1>
          <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
            Explore how and why we're creating infrastructure for patient-owned health data. Choose what interests you.
          </p>
        </div>
      </div>

      {/* Doors Section with Fade-In Pattern */}
      <div className="relative flex-1 bg-[#210606]">
        {/* Background Pattern - Full Opacity */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${exploreBackground})`,
            backgroundSize: 'contain',
            backgroundPosition: 'top center',
            backgroundRepeat: 'repeat-y',
            minHeight: '100%'
          }}
        />
        
        {/* Gradient Overlay - Fades navbar color to transparent, revealing pattern */}
        <div 
          className="absolute inset-x-0 top-0 pointer-events-none"
          style={{
            height: '160px',
            background: 'linear-gradient(to bottom, #231F20 0%, transparent 100%)'
          }}
        />
        
        {/* Doors Content - Extra breathing room between pattern fade and first door */}
        <div className="relative">
          <div className="max-w-3xl mx-auto px-6 pt-28 pb-12">
            <div className="space-y-2">
              {doorContent.map((door, index) => (
                <Door
                  key={door.id}
                  door={door}
                  doorIndex={index}
                  isExpanded={expandedDoors[door.id]}
                  isHighlighted={doorsHighlighted}
                  onToggle={() => toggleDoor(door.id)}
                  onOpenRegistry={openRegistry}
                  doorRef={door.id === 'help' ? door6Ref : null}
                  showBorder={true}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8">
            <Footer isDark={true} />
          </div>
        </div>
      </div>

      <MobileCTA show={showMobileCTA} onClick={openRegistry} />

      <RegistryModal
        show={showRegistry}
        step={registryStep}
        formData={formData}
        onClose={closeRegistry}
        onUpdate={updateFormData}
        onStep2={goToStep2}
        onComplete={completeRegistry}
      />
    </div>
  );
};

export default ExplorePage;