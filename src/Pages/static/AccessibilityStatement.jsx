
import React from 'react';
import { Link } from 'react-router-dom';

const AccessibilityStatement = () => {
  return (
    <main className="p-8 max-w-4xl mx-auto text-gray-900 dark:text-gray-100" role="main" aria-label="Accessibility Statement Page">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">Accessibility Statement</h1>
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
          AbleConnect is committed to ensuring digital accessibility for people with disabilities. We strive to meet Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.
        </p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Our Efforts</h2>
        <p className="text-gray-700 dark:text-gray-300">
          We implement ARIA landmarks, keyboard navigation, and high-contrast modes to enhance accessibility.
        </p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Feedback</h2>
        <p className="text-gray-700 dark:text-gray-300">
          If you encounter accessibility barriers, please contact us at accessibility@ableconnect.com.
        </p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Ongoing Improvements</h2>
        <p className="text-gray-700 dark:text-gray-300">
          We regularly audit our platform to ensure compliance with accessibility standards.
        </p>
      </section>
    </main>
  );
};

export default AccessibilityStatement;
