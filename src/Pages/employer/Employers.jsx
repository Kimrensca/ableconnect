
import React from 'react';
import { Link } from 'react-router-dom';

const Employers = () => {
  return (
    <main className="p-8 max-w-4xl mx-auto text-gray-900 dark:text-gray-100" role="main" aria-label="Employers Page">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">Why AbleConnect for Employers</h1>
      <div className="mb-6">
        <Link
          to="/dashboard/employer"
          className="text-blue-600 dark:text-blue-400 underline text-sm hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
          aria-label="Back to Employer Dashboard"
        >
          ← Back to Dashboard
        </Link>
      </div>
      <section className="space-y-6">
        <p className="text-gray-700 dark:text-gray-300">
          AbleConnect is dedicated to connecting employers with talented individuals, including those with disabilities, to foster inclusive workplaces. Here’s why you should choose AbleConnect:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>Access a diverse talent pool committed to excellence.</li>
          <li>Post disability-friendly jobs to attract inclusive candidates.</li>
          <li>Leverage our resources to implement inclusive hiring practices.</li>
          <li>Showcase your commitment to accessibility and diversity.</li>
        </ul>
        <p className="text-gray-700 dark:text-gray-300">
          Join AbleConnect today to build a stronger, more inclusive workforce.
        </p>
        <div className="text-center">
          <Link
            to="/post-job"
            className="inline-block bg-blue-600 dark:bg-blue-700 text-white px-6 py-3 rounded hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            aria-label="Post a Job Now"
          >
            Post a Job Now
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Employers;
