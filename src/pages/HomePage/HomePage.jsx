import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Hero, Footer, RegistryModal } from '../../components';
import { useRegistry } from '../../hooks';

/**
 * HomePage - Landing page with institutional environment
 * Navigation establishes color containment, hero has pattern background
 */
const HomePage = () => {
  const navigate = useNavigate();
  
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

  const handleExplore = () => {
    navigate('/explore');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation - Creates color environment */}
      <Navigation onJoinRegistry={openRegistry} />
      
      {/* Hero Section with Pattern Background */}
      <div className="flex-1">
        <Hero
          onJoinRegistry={openRegistry}
          onUnderstandWhy={handleExplore}
        />
      </div>

      {/* Footer - Neutral, no pattern */}
      <Footer />

      {/* Registry Modal */}
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

export default HomePage;