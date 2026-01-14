import React from 'react';
import { Link } from 'react-router-dom';  // ADDED THIS
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Door component - Collapsible content section with gradient border colors
 */
const Door = ({ door, isExpanded, isHighlighted, onToggle, onOpenRegistry, doorRef, showBorder = true, doorIndex = 0 }) => {
  
  // 6 mathematically calculated colors spanning the gradient evenly
  // Gradient path: #7B85B8 (purple-blue) → #BFCEEA (light blue) → #F97AD7 (pink)
  const GRADIENT_COLORS = [
    '#7B85B8',  // Door 0: Hero button purple-blue (rgb: 123, 133, 184)
    '#9AA7CD',  // Door 1: 40% towards light blue (rgb: 154, 167, 205)
    '#BFCEEA',  // Door 2: Light blue accent (rgb: 191, 206, 234)
    '#D2B2E3',  // Door 3: 33% towards pink (rgb: 210, 178, 227)
    '#E597DE',  // Door 4: 66% towards pink (rgb: 229, 151, 222)
    '#F97AD7'   // Door 5: Full pink CTA (rgb: 249, 122, 215)
  ];

  const renderContent = () => {
    const { content } = door;
    
    return (
      <div className="space-y-4 text-gray-300 leading-relaxed">
        {/* Main paragraphs */}
        {content.paragraphs?.map((para, index) => {
          if (typeof para === 'string') {
            return <p key={index}>{para}</p>;
          }
          
          const className = para.weight === 'medium' ? 'font-medium text-white' : '';
          
          if (para.strong) {
            const [strongText, ...rest] = para.text.split(' — ');
            return (
              <p key={index} className={className}>
                <strong>{strongText}</strong> — {rest.join(' — ')}
              </p>
            );
          }
          
          return (
            <p key={index} className={className}>
              {para.text}
            </p>
          );
        })}

        {/* List */}
        {content.list && (
          <ul className="list-disc list-inside space-y-2 ml-4 text-gray-300">
            {content.list.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )}

        {/* Closing paragraphs */}
        {content.closingParagraphs?.map((para, index) => (
          <p key={index}>{para.text}</p>
        ))}

        {/* Info box */}
        {content.infoBox && (
          <div className="border-l-4 border-[#BFCEEA] pl-4 my-6 py-2">
            <p className="font-medium text-white">{content.infoBox.title}</p>
            {content.infoBox.paragraphs.map((para, index) => (
              <p key={index} className="mt-2">{para}</p>
            ))}
            {content.infoBox.list && (
              <>
                <p className="mt-3 text-white">This is about:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  {content.infoBox.list.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </>
            )}
            <p className="mt-2">{content.infoBox.closing}</p>
          </div>
        )}

        {/* CTA button */}
        {content.cta && (
          <button
            onClick={onOpenRegistry}
            className="w-full mt-6 bg-[#BFCEEA] text-[#231F20] px-8 py-4 text-lg font-medium hover:bg-[#A8BDD9] transition-colors rounded-lg"
          >
            Ready to participate →
          </button>
        )}

        {/* Link - CHANGED FROM <a> TO <Link> */}
        {content.link && (
          <p className="text-sm mt-6">
            <Link to={content.link.href} className="text-[#BFCEEA] hover:text-white underline">
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
        isHighlighted ? 'ring-2 ring-[#BFCEEA] ring-offset-2 ring-offset-transparent' : ''
      }`}
      style={showBorder ? { borderBottomColor: GRADIENT_COLORS[doorIndex] } : {}}
    >
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
      
      {isExpanded && (
        <div className="pb-8 px-4 md:px-6 animate-expand">
          {renderContent()}
        </div>
      )}
    </div>
  );
};

export default Door;