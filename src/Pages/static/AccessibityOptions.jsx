
import React from 'react';
import { Link } from 'react-router-dom';

const AccessibilityOptions = () => {
  return (
    <main className="p-8 max-w-4xl mx-auto text-gray-900 dark:text-gray-100" role="main" aria-label="Accessibility Options Page">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">Accessibility Options</h1>
      <div className="mb-6">
        <Link
          to="/"
          className="text-blue-600 dark:text-blue-400 underline text-sm hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
          aria-label="Back to Home"
        >
          ← Back to Home
        </Link>
      </div>
      <section className="space-y-6">
        <p className="text-gray-700 dark:text-gray-300">
          AbleConnect is committed to making our platform accessible to all users. Explore our accessibility features below.
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>Adjustable Font Sizes: Use the Accessibility Panel to increase or decrease text size.</li>
          <li>High-Contrast Mode: Enable high-contrast mode for better visibility.</li>
          <li>Screen Reader Support: Our platform is optimized for screen readers with proper ARIA labels.</li>
          <li>Keyboard Navigation: Navigate the site using keyboard controls.</li>
        </ul>
        <p className="text-gray-700 dark:text-gray-300">
          For support with accessibility features, contact us at accessibility@ableconnect.com.
        </p>
      </section>
    </main>
  );
};

export default AccessibilityOptions;
