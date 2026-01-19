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
      
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8 py-6 md:py-20 relative">
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 900px 1200px at center, rgba(248, 249, 252, 0.3) 0%, transparent 70%)'
          }}
        />
        
        {/* Much narrower card on mobile */}
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
                In 1951, Henrietta Lacks, a Black woman, sought medical treatment at a major research hospital. Her cells were taken without her knowledge or consent and became foundational to modern medicine, contributing to breakthroughs in vaccines, cancer research, and countless medical advances.
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-2 md:mb-4">
                Her family did not know for decades. She never consented, and she never had a say in how her body was used.
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-2 md:mb-4">
                Her experience revealed what happens when care is organized around institutional authority rather than individual interest, when consent disappears and decisions are made without the person at the center. The problem was not one hospital or one moment. It was a system designed without her in mind.
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
                The name keeps the work grounded. It orients us toward dignity, consent, and participation, toward care that can be maintained, protected, and carried forward rather than shaped solely by institutional priorities.
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-2 md:mb-4">
                You don't have to agree with the name to take part. You don't have to attach meaning to it to engage.
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-2 md:mb-4">
                But if it resonates, it's because it points back to something simple: care should be organized around people, not institutions.
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
                This project draws on that history not to exploit it, but to acknowledge what was taken without consent in the past and to build infrastructure where consent, ownership, and participation are fundamental from the start.
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
