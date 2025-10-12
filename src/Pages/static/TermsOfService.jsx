
import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <main className="p-8 max-w-4xl mx-auto text-gray-900 dark:text-gray-100" role="main" aria-label="Terms of Service Page">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">Terms of Service</h1>
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
          By using AbleConnect, you agree to these Terms of Service. Please read them carefully.
        </p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Use of Our Platform</h2>
        <p className="text-gray-700 dark:text-gray-300">
          You agree to use AbleConnect for lawful purposes and in a way that respects all users.
        </p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Account Responsibilities</h2>
        <p className="text-gray-700 dark:text-gray-300">
          You are responsible for maintaining the confidentiality of your account credentials.
        </p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Termination</h2>
        <p className="text-gray-700 dark:text-gray-300">
          We reserve the right to terminate accounts that violate these terms.
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          For questions, contact us at support@ableconnect.com.
        </p>
      </section>
    </main>
  );
};

export default TermsOfService;
