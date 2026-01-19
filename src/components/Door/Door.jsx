import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Door component
 * ----------------
 * Collapsible content section used throughout the page.
 * Each "door" represents a conceptual section with optional CTA.
 *
 * UX principle:
 * When a CTA exists, it should visually and conceptually belong
 * to the trust statement immediately above it — not float as
 * a generic marketing action below the content.
 */
const Door = ({
  door,
  isExpanded,
  isHighlighted,
  onToggle,
  onOpenRegistry,
  doorRef,
  showBorder = true,
  doorIndex = 0
}) => {

  /**
   * Gradient colors used for bottom borders.
   * These are evenly spaced between brand anchors
   * to subtly suggest progression down the page.
   */
  const GRADIENT_COLORS = [
    '#7B85B8', // Hero / primary purple-blue
    '#9AA7CD', // Transition toward light blue
    '#BFCEEA', // Light blue accent
    '#D2B2E3', // Transition toward pink
    '#E597DE', // Near-pink
    '#F97AD7'  // Full CTA pink
  ];

  /**
   * Renders the expanded content of a door.
   * Kept intentionally explicit and flat
   * for clarity, auditability, and future edits.
   */
  const renderContent = () => {
    const { content } = door;

    return (
      <div className="space-y-4 text-gray-300 leading-relaxed">

        {/* Main paragraphs */}
        {content.paragraphs?.map((para, index) => {
          if (typeof para === 'string') {
            return <p key={index}>{para}</p>;
          }

          const className =
            para.weight === 'medium'
              ? 'font-medium text-white'
              : '';

          if (para.strong) {
            const strongText = para.strong;
            const restText = para.text.substring(
              strongText.length + 2 // accounts for ". "
            );

            return (
              <p key={index} className={className}>
                <strong>{strongText}.</strong> {restText}
              </p>
            );
          }

          return (
            <p key={index} className={className}>
              {para.text}
            </p>
          );
        })}

        {/* Optional list */}
        {content.list && (
          <ul className="list-disc list-inside space-y-2 ml-4">
            {content.list.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )}

        {/* Closing paragraphs */}
        {content.closingParagraphs?.map((para, index) => (
          <p key={index}>{para.text}</p>
        ))}

        {/*
          Trust / Info box
          ----------------
          This section establishes clear boundaries around data usage.
          The CTA is intentionally placed INSIDE this container so that
          the action feels like a response to the promise, not a demand.
        */}
        {content.infoBox && (
          <div className="border-l-4 border-[#BFCEEA] pl-4 my-6 py-2">
            <p className="font-medium text-white">
              {content.infoBox.title}
            </p>

            {content.infoBox.paragraphs.map((para, index) => (
              <p key={index} className="mt-2">
                {para}
              </p>
            ))}

            {content.infoBox.list && (
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                {content.infoBox.list.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )}

            <p className="mt-2">{content.infoBox.closing}</p>

            {/*
              CTA BUTTON (CENTERED FIX)
              ------------------------
              Design intent:
              - Inline-sized (not full width)
              - Centered to feel invitational, not procedural
              - Visually subordinate to the trust statement
              - Framed as consent, not conversion
            */}
            {content.cta && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={onOpenRegistry}
                  className="
                    inline-flex
                    items-center
                    gap-2
                    bg-[#BFCEEA]
                    text-[#231F20]
                    px-6
                    py-3
                    text-base
                    font-medium
                    rounded-lg
                    hover:bg-[#A8BDD9]
                    transition-colors
                  "
                >
                  Ready to participate →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Optional link */}
        {content.link && (
          <p className="text-sm mt-6">
            <Link
              to={content.link.href}
              className="text-[#BFCEEA] hover:text-white underline"
            >
              {content.link.text}
            </Link>
          </p>
        )}
      </div>
    );
  };

  return (
    <div
      ref={doorRef}
      className={`bg-[#231F20] transition-all ${
        showBorder ? 'border-b-2' : ''
      } ${
        isHighlighted
          ? 'ring-2 ring-[#BFCEEA] ring-offset-2 ring-offset-transparent'
          : ''
      }`}
      style={
        showBorder
          ? { borderBottomColor: GRADIENT_COLORS[doorIndex] }
          : {}
      }
    >
      {/* Door header / toggle */}
      <button
        onClick={onToggle}
        className="w-full py-6 md:py-8 flex items-start justify-between hover:bg-white/5 transition-colors px-4 md:px-6 text-left"
      >
        <div className="flex-1 pr-4">
          <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
            {door.title}
          </h3>

          {!isExpanded && (
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              {door.summary}
            </p>
          )}
        </div>

        <div className="flex-shrink-0 pt-1">
          {isExpanded ? (
            <ChevronUp className="w-6 h-6 text-[#BFCEEA]/70" />
          ) : (
            <ChevronDown className="w-6 h-6 text-[#BFCEEA]/70" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="pb-8 px-4 md:px-6 animate-expand">
          {renderContent()}
        </div>
      )}
    </div>
  );
};

export default Door;
