
import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * @typedef {Object} AccessibilityContextType
 * @property {number} fontSize
 * @property {boolean} highContrast
 * @property {boolean} panelOpen
 * @property {function} increaseFontSize
 * @property {function} decreaseFontSize
 * @property {function} resetFontSize
 * @property {function} toggleHighContrast
 * @property {function} toggleAccessibilityPanel
 */

const AccessibilityContext = createContext(undefined);

export const AccessibilityProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState(0); // 0 is default, range: -2 to 4
  const [highContrast, setHighContrast] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 1, 4));
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 1, -2));
  };

  const resetFontSize = () => {
    setFontSize(0);
  };

  const toggleHighContrast = () => {
    setHighContrast((prev) => !prev);
  };

  const toggleAccessibilityPanel = () => {
    setPanelOpen((prev) => !prev);
  };

  // Apply font size to document root
  useEffect(() => {
    document.documentElement.style.setProperty('--font-size-adjustment', `${fontSize * 0.125}rem`);
  }, [fontSize]);

  // Apply high contrast class to body
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  // Close panel on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && panelOpen) {
        setPanelOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [panelOpen]);

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        highContrast,
        panelOpen,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
        toggleHighContrast,
        toggleAccessibilityPanel,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
