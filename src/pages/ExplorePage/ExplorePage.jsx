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
        {/* Background Pattern - Fixed height to prevent shifting */}
        <div 
          className="absolute top-0 left-0 right-0"
          style={{
            backgroundImage: `url(${exploreBackground})`,
            backgroundSize: window.innerWidth < 768 ? 'auto 45%' : 'contain',
            backgroundPosition: 'top center',
            backgroundRepeat: 'repeat',
            height: '250vh',
            maxHeight: '100%',
            pointerEvents: 'none'
          }}
        />
        
        {/* Solid background overlay - covers navbar + "Henrietta" title */}
        <div 
          className="absolute inset-x-0 top-0 z-10 bg-[#231F20]"
          style={{
            height: '240px'
          }}
        />
        
        {/* Gradient starts after "Henrietta" title, before subtitle */}
        <div 
          className="absolute inset-x-0 z-10 pointer-events-none"
          style={{
            top: '240px',
            height: '120px',
            background: 'linear-gradient(to bottom, #231F20 0%, transparent 100%)'
          }}
        />
        
        {/* Header - More breathing room before accordions */}
        <div className="relative z-20 pt-12 pb-24 md:pt-16 md:pb-32">
          <div className="max-w-3xl mx-auto px-6">
            <h1 className="text-3xl md:text-4xl font-bold text-[#7B85B8] mb-4">
              Henrietta
            </h1>
            <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
              Explore how and why we're creating infrastructure for patient-owned health data. Choose what interests you.
            </p>
          </div>
        </div>
        
        {/* Doors Content */}
        <div className="relative z-10">
          <div className="max-w-3xl mx-auto px-6 pb-12">
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