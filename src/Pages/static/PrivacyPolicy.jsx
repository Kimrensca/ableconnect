
import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <main className="p-8 max-w-4xl mx-auto text-gray-900 dark:text-gray-100" role="main" aria-label="Privacy Policy Page">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">Privacy Policy</h1>
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
          At AbleConnect, we are committed to protecting your privacy. This Privacy Policy outlines how we collect, use, and safeguard your personal information.
        </p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Information We Collect</h2>
        <p className="text-gray-700 dark:text-gray-300">
          We collect information you provide, such as name, email, and job preferences, to enhance your experience on our platform.
        </p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">How We Use Your Information</h2>
        <p className="text-gray-700 dark:text-gray-300">
          Your information is used to match you with job opportunities, improve our services, and communicate updates.
        </p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Data Security</h2>
        <p className="text-gray-700 dark:text-gray-300">
          We implement industry-standard security measures to protect your data from unauthorized access.
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          For questions, contact us at privacy@ableconnect.com.
        </p>
      </section>
    </main>
  );
};

export default PrivacyPolicy;
