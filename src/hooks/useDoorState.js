import { useState } from 'react';

/**
 * Custom hook to manage door expand/collapse state
 * @returns {Object} Door state and control functions
 */
export const useDoorState = () => {
  const [expandedDoors, setExpandedDoors] = useState({});
  const [doorsHighlighted, setDoorsHighlighted] = useState(false);

  const toggleDoor = (doorId) => {
    setExpandedDoors(prev => ({
      ...prev,
      [doorId]: !prev[doorId]
    }));
  };

  const highlightAllDoors = () => {
    setDoorsHighlighted(true);
    setTimeout(() => setDoorsHighlighted(false), 2000);
  };

  const getExpandedCount = () => {
    return Object.values(expandedDoors).filter(Boolean).length;
  };

  return {
    expandedDoors,
    doorsHighlighted,
    toggleDoor,
    highlightAllDoors,
    getExpandedCount
  };
};
