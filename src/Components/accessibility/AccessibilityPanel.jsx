
import React, { useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { useAccessibility } from '../../hooks/use-accessibility';

const AccessibilityPanel = () => {
  const {
    fontSize,
    highContrast,
    panelOpen,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    toggleHighContrast,
    toggleAccessibilityPanel,
  } = useAccessibility();

  useEffect(() => {
    if (panelOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [panelOpen]);

  if (!panelOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      aria-label="Accessibility Options"
    >
      <Card className="max-w-md w-full p-6 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Accessibility Options</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAccessibilityPanel}
            className="text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900"
            aria-label="Close accessibility panel"
          >
            ✕
          </Button>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className={`text-lg font-medium mb-3 ${highContrast ? 'text-black dark:text-yellow-300' : 'text-gray-900 dark:text-gray-100'}`}>
              Text Size
            </h3>
            <div className="flex items-center gap-4">
              <Button
                onClick={decreaseFontSize}
                disabled={fontSize <= -2}
                variant="secondary"
                className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-blue-100 dark:hover:bg-blue-900"
                aria-label="Decrease font size"
              >
                A-
              </Button>
              <Button
                onClick={resetFontSize}
                variant="destructive"
                className="bg-red-500 text-white hover:bg-red-600 dark:hover:bg-red-700"
                aria-label="Reset font size"
              >
                Reset
              </Button>
              <Button
                onClick={increaseFontSize}
                disabled={fontSize >= 4}
                variant="secondary"
                className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-blue-100 dark:hover:bg-blue-900"
                aria-label="Increase font size"
              >
                A+
              </Button>
            </div>
          </div>
          <div>
            <h3 className={`text-lg font-medium mb-3 ${highContrast ? 'text-black dark:text-yellow-300' : 'text-gray-900 dark:text-gray-100'}`}>
              Display
            </h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="high-contrast"
                checked={highContrast}
                onCheckedChange={toggleHighContrast}
                className={`h-8 w-16 rounded-full border-2 ${
                  highContrast ? 'bg-yellow-400 border-black dark:border-yellow-300' : 'bg-gray-300 dark:bg-gray-600 border-gray-500 dark:border-gray-400'
                } shadow-md transition-all duration-300`}
                aria-label="Toggle high contrast mode"
              />
              <Label
                htmlFor="high-contrast"
                className={`text-lg font-medium ${highContrast ? 'text-black dark:text-yellow-300' : 'text-gray-900 dark:text-gray-100'}`}
              >
                High Contrast Mode
              </Label>
            </div>
          </div>
          <div>
            <h3 className={`text-lg font-medium mb-3 ${highContrast ? 'text-black dark:text-yellow-300' : 'text-gray-900 dark:text-gray-100'}`}>
              Keyboard Navigation
            </h3>
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              <p className="mb-2">
                Use <kbd className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Tab</kbd> to navigate between elements.
              </p>
              <p className="mb-2">
                Press <kbd className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Enter</kbd> or{' '}
                <kbd className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Space</kbd> to activate buttons.
              </p>
              <p>
                Press <kbd className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd> to close this panel.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AccessibilityPanel;
