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
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${exploreBackground})`,
            backgroundSize: window.innerWidth < 768 ? 'auto 150%' : 'contain',
            backgroundPosition: 'top center',
            backgroundRepeat: 'repeat',
            minHeight: '100%'
          }}
        />
        
        <div 
          className="absolute inset-x-0 top-0 pointer-events-none z-10"
          style={{
            height: '120px',
            background: 'linear-gradient(to bottom, #231F20 0%, #231F20 25%, transparent 100%)'
          }}
        />
        
        <div className="relative z-20">
          <div className="max-w-4xl mx-auto px-8 md:px-12">
            <div className="relative">
              <div className="bg-[#231F20] pt-8 md:pt-12 pb-12 md:pb-16 px-6">
                <h1 className="text-3xl md:text-4xl font-bold text-[#7B85B8] mb-4">
                  Henrietta
                </h1>
                <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
                  Explore how and why we're creating infrastructure for patient-owned health data. Choose what interests you.
                </p>
              </div>
              
              <div 
                className="absolute inset-x-0 pointer-events-none"
                style={{
                  bottom: '-120px',
                  height: '120px',
                  background: 'linear-gradient(to bottom, #231F20 0%, #231F20 10%, transparent 100%)'
                }}
              />
            </div>
          </div>
        </div>
        
        <div className="relative z-10">
          <div className="max-w-3xl mx-auto px-6 pt-20 md:pt-24 pb-12">
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