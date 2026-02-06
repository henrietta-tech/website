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
        
        <div 
          className="absolute inset-x-0 top-0 z-10 bg-[#231F20]"
          style={{
            height: '160px'
          }}
        />
        
        <div 
          className="absolute inset-x-0 z-10 pointer-events-none"
          style={{
            top: '160px',
            height: '120px',
            background: 'linear-gradient(to bottom, #231F20 0%, transparent 100%)'
          }}
        />
        
        <div className="relative z-20 pt-12 pb-8 md:pt-16 md:pb-12">
          <div className="max-w-3xl mx-auto px-6">
            <h1 className="text-3xl md:text-4xl font-bold text-[#7B85B8] mb-4">
              Henrietta
            </h1>
            <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
              Care didn't end up this way by accident. Start wherever makes sense.
            </p>
          </div>
        </div>
        
        <div className="relative z-10">
          <div className="max-w-3xl mx-auto px-6 pt-32 md:pt-24 pb-12">
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