import React from 'react';
import { Navigation, Footer, RegistryModal } from '../../components';
import { useRegistry } from '../../hooks';
import aboutNameBackground from '../../assets/about-name-background.svg';

const AboutPage = () => {
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

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: `url(${aboutNameBackground})`,
        backgroundSize: window.innerWidth < 768 ? '200%' : 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <Navigation onJoinRegistry={openRegistry} />
      
      <main className="flex-1 flex items-center justify-center px-6 py-12 md:py-20 relative">
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 900px 1200px at center, rgba(248, 249, 252, 0.3) 0%, transparent 70%)'
          }}
        />
        
        <div className="bg-white rounded-md max-w-2xl w-full px-6 md:px-12 py-8 md:py-12 relative z-10 mx-4">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-8">
            About the Name
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6 md:mb-8">
              Henrietta is a person's name. Not a concept. Not a system. Not an abstraction.
            </p>

            <section className="mb-6 md:mb-8">
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4">
                We chose it deliberately.
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4">
                Healthcare is often discussed as policy, infrastructure, or cost. But the consequences of fragmentation are always personal — they land on individual lives, quietly and repeatedly, over time.
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4">
                Henrietta stands in for that reality.
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4">
                Not as a symbol of suffering, and not as a story we're asking you to adopt — but as a reminder that care ultimately belongs to people, not institutions.
              </p>
            </section>

            <section className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
                Why This Name Matters
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4">
                The name keeps the work grounded. It orients us toward continuity, dignity, and participation — toward care that can be maintained, protected, and carried forward rather than reset each time circumstances change.
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4">
                You don't have to agree with the name to take part. You don't have to attach meaning to it to engage.
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4">
                But if it resonates, it's because it points back to something simple: care should feel human, stable, and carried forward — not fragmented or temporary.
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed font-medium">
                That's the standard the name sets.
              </p>
            </section>

            <section className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
                Historical Context
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4">
                The name Henrietta carries specific historical weight in medical ethics, particularly around consent, ownership of biological materials, and the relationship between patients and medical institutions.
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4">
                This project draws on that history not to exploit it, but to acknowledge what was taken without consent in the past — and to build infrastructure where consent, ownership, and participation are fundamental from the start.
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                The name is a commitment to do better.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />

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

export default AboutPage;