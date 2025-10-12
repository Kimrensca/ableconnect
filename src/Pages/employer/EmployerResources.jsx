
import React from 'react';
import { Link } from 'react-router-dom';

const EmployerResources = () => {
  return (
    <main className="p-8 max-w-4xl mx-auto text-gray-900 dark:text-gray-100" role="main" aria-label="Employer Resources Page">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">Inclusive Hiring Resources</h1>
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
          AbleConnect provides resources to help employers create inclusive hiring practices and accessible workplaces.
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>Guide to Disability-Friendly Job Descriptions: Learn how to craft inclusive job postings.</li>
          <li>Accessible Interview Practices: Tips for accommodating candidates with disabilities.</li>
          <li>Workplace Accessibility Checklist: Ensure your workplace is welcoming for all.</li>
          <li>Training Programs: Access resources for diversity and inclusion training.</li>
        </ul>
        <p className="text-gray-700 dark:text-gray-300">
          These resources are designed to help you attract and retain top talent while fostering an inclusive environment.
        </p>
      </section>
    </main>
  );
};

export default EmployerResources;
