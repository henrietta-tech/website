import React from 'react';
import { Navigation, Footer, RegistryModal } from '../../components';
import { useRegistry } from '../../hooks';

/**
 * StatementPage - Statement of Use with trademark explanation
 * Full context on governance, protection, and boundaries
 */
const StatementPage = () => {
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
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation onJoinRegistry={openRegistry} />
      
      <main className="flex-1 max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
          Statement of Use
        </h1>
        
        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <p className="text-xl text-gray-700 leading-relaxed mb-8">
            Henrietta is infrastructure for patient-owned health data. This statement describes how it works, what it protects, and who it serves.
          </p>

          {/* Data Usage */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              What Data We Collect
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Registry participants provide:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Email address (for updates)</li>
              <li>ZIP code (to map demand)</li>
              <li>Optional: DPC practice status</li>
              <li>Optional: Interest in provider contact</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              We do not collect medical information, diagnoses, or health records. This is infrastructure mapping, not healthcare delivery.
            </p>
          </section>

          {/* How Data Is Used */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              How Information Is Used
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Registry data helps us:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Understand where interest in patient-owned infrastructure exists</li>
              <li>Connect engaged patients with Direct Primary Care practices</li>
              <li>Identify gaps in coverage and momentum</li>
              <li>Share meaningful updates (no frequent emails, no marketing)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Your information is never sold, shared with third parties for marketing, or used for purposes beyond building this infrastructure.
            </p>
          </section>

          {/* Trademark Protection */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Legal Protection of Patient-Owned Infrastructure
            </h2>
            
            <p className="text-gray-700 leading-relaxed mb-6">
              Henrietta™ is a registered trademark. This is defensive infrastructure, not corporate ownership.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              What the Trademark Protects
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The trademark ensures:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>The name serves patient-owned infrastructure</li>
              <li>Continuity for people who invest time and trust</li>
              <li>Legal recourse against extractive use</li>
              <li>Protection of non-extractive principles</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              What It Prevents
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Without trademark protection, corporate entities could:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Launch competing "Henrietta Health" products</li>
              <li>Dilute the name across extractive services</li>
              <li>Co-opt work the community built</li>
              <li>Lock out original participants through legal claims</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              What It Does Not Restrict
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The trademark does not prevent:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Participation in building the infrastructure</li>
              <li>Use of services once they exist</li>
              <li>Critical discussion or analysis</li>
              <li>Fair use in educational or journalistic contexts</li>
            </ul>

            <p className="text-gray-700 leading-relaxed border-l-4 border-gray-300 pl-6 py-2">
              Who benefits: Patients and participants.<br />
              Who's protected against: Extractive use.
            </p>
          </section>

          {/* Governance */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Governance and Control
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Henrietta has not accepted corporate or institutional backing. There are no venture capital investors, no board seats held by external entities, and no obligations to maximize financial returns.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              What comes next depends on who stays close and why. This is not a promise that everything will be collectively governed, but it is a commitment that no outside entity controls the direction.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Governance structures will be shared transparently as they develop. Participation is always voluntary.
            </p>
          </section>

          {/* Updates and Changes */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Updates to This Statement
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              This statement may be updated as Henrietta develops. Major changes will be communicated to registry participants.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Current version: January 2025
            </p>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Questions or Concerns
            </h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions about how your information is used, how the trademark protects the infrastructure, or anything else in this statement, we're here to answer them clearly.
            </p>
          </section>
        </div>
      </main>
      
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

export default StatementPage;