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
      
      <div className="relative flex-1 bg-[#210606]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${exploreBackground})`,
            backgroundSize: window.innerWidth < 768 ? 'auto 40%' : 'contain',
            backgroundPosition: 'top center',
            backgroundRepeat: 'repeat',
            pointerEvents: 'none'
          }}
        />
        
        {/* Solid background - covers nav + headline */}
<div 
  className="absolute inset-x-0 top-0 z-10 bg-[#231F20]"
  style={{
    height: '180px'
  }}
/>

{/* Gradient starts right after headline */}
<div 
  className="absolute inset-x-0 z-10 pointer-events-none"
  style={{
    top: '180px',
    height: '80px',
    background: 'linear-gradient(to bottom, #231F20 0%, transparent 100%)'
  }}
/>
        
        <div className="relative z-20 pt-12 pb-4 md:pt-16 md:pb-6">
          <div className="max-w-3xl mx-auto px-6">
            <p className="text-3xl md:text-4xl text-gray-100 leading-tight font-medium">
              Care didn't end up this way by accident.
            </p>
            <p className="text-3xl md:text-4xl text-gray-100 leading-tight font-medium mt-6">
              Start wherever makes sense.
            </p>
          </div>
        </div>
        
        <div className="relative z-10">
          <div className="max-w-3xl mx-auto px-6 pt-16 pb-12">
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