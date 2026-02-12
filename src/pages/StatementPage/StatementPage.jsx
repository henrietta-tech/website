import React from 'react';
import { Navigation, Footer, RegistryModal } from '../../components';
import { useRegistry } from '../../hooks';

/**
 * StatementPage - Statement of Use
 * Explains data collection, governance structure, and trademark protection
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
            Henrietta is infrastructure for patient-controlled health data.
            This statement explains what information we collect, how it is used,
            and how governance and trademark protections support that work.
          </p>

          {/* Data Collection */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              What Data We Collect
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Registry participants may provide:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Email address (for verification and updates)</li>
              <li>ZIP code (to understand geographic demand)</li>
              <li>Optional: DPC practice status</li>
              <li>Optional: Interest in provider contact</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              We do not collect medical records, diagnoses, treatment history,
              or clinical data at this stage. The registry supports infrastructure
              development and governance rehearsal, not healthcare delivery.
            </p>
          </section>

          {/* Data Usage */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              How Information Is Used
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Registry information helps us:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Understand where interest in patient-controlled infrastructure exists</li>
              <li>Identify regions with potential Direct Primary Care engagement</li>
              <li>Share meaningful updates about infrastructure development</li>
              <li>Inform sequencing decisions for future pilots</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              We do not sell registry information and do not share it with
              third parties for advertising or marketing. Registry data is used
              solely to support the development of Henrietta’s infrastructure.
              Any future use beyond this scope would require explicit consent.
            </p>
          </section>

          {/* Trademark */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Trademark and Brand Protection
            </h2>

            <p className="text-gray-700 leading-relaxed mb-6">
              Henrietta™ is a registered trademark. The trademark protects
              continuity of the infrastructure and prevents misleading or
              unauthorized commercial use of the name.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              What the Trademark Protects
            </h3>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Integrity of the Henrietta name and governance model</li>
              <li>Continuity for participants who invest time and trust</li>
              <li>Protection against misleading or extractive reuse of the name</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              What It Does Not Restrict
            </h3>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Participation in the registry</li>
              <li>Use of services once they exist</li>
              <li>Critical discussion, commentary, or fair use</li>
              <li>Educational or journalistic reference</li>
            </ul>
          </section>

          {/* Governance */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Governance and Control
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Henrietta is currently founder-led and independent. There are no
              external board seats or institutional control rights over registry
              governance at this time.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              This structure allows the infrastructure to be developed deliberately,
              without short-term pressure to monetize registry-level data.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Governance structures may evolve as the infrastructure develops.
              Any material changes affecting participant data or consent will
              be communicated clearly. Participation is voluntary, and participants
              may exit at any time.
            </p>
          </section>

          {/* Updates */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Updates to This Statement
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              This statement may be updated as the infrastructure evolves.
              Material changes will be communicated to registry participants.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Current version: February 2026
            </p>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Questions
            </h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions about how registry information is used,
              how consent is structured, or how trademark protections function,
              you may contact us directly for clarification.
            </p>
          </section>
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

export default StatementPage;
