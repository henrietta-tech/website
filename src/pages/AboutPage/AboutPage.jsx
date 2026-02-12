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
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <Navigation onJoinRegistry={openRegistry} />
      
      <main 
        className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8 py-6 md:py-20 relative"
        style={{
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
        }}
      >
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 900px 1200px at center, rgba(248, 249, 252, 0.3) 0%, transparent 70%)'
          }}
        />
        
        <div className="bg-white rounded-md w-full max-w-72 sm:max-w-80 md:max-w-2xl px-4 md:px-12 py-5 md:py-12 relative z-10">
          <h1 className="text-xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-8">
            About the Name
          </h1>
          
          <div className="max-w-none">
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-3 md:mb-8">
              This project is named after a real person.
            </p>

            <section className="mb-4 md:mb-8">
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-2 md:mb-4">
                In 1951, Henrietta Lacks, a Black woman, sought medical treatment at a major research hospital. Her cells were taken without her knowledge or consent and later became foundational to modern medicine, contributing to breakthroughs in vaccines, cancer research, and other major advances.
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-2 md:mb-4">
                Her family did not know for decades. She had no say in how her cells were used.
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-2 md:mb-4">
                Her experience revealed what can happen when systems are organized around institutional authority rather than individual agency, when consent is assumed rather than deliberately designed. The issue was larger than a single hospital or moment. It reflected structural priorities that did not include her.
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-2 md:mb-4 font-medium">
                We chose this name deliberately.
              </p>
            </section>

            <section className="mb-4 md:mb-8">
              <h2 className="text-lg md:text-2xl font-semibold text-gray-900 mb-2 md:mb-4">
                Why This Name Matters
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-2 md:mb-4">
                The name keeps the work grounded. It reminds us that infrastructure shapes outcomes and that governance decisions affect real people.
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-2 md:mb-4">
                You do not have to attach meaning to the name to participate. You do not have to agree with every implication to engage.
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-2 md:mb-4">
                But if it resonates, it is because it points to something simple: care should be organized around people, not institutions.
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed font-medium mb-2 md:mb-4">
                That is the standard the name sets.
              </p>
            </section>

            <section className="mb-4 md:mb-8">
              <h2 className="text-lg md:text-2xl font-semibold text-gray-900 mb-2 md:mb-4">
                The Commitment
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-2 md:mb-4">
                This project draws on that history not to exploit it, but to acknowledge it. We are building infrastructure where consent, participation, and patient control are structural, not aspirational.
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                The name is a reminder that systems must be designed deliberately.
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
