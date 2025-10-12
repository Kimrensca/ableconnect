
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full bg-gray-100 dark:bg-gray-800 py-12 px-6 mt-12 text-gray-700 dark:text-gray-300" aria-label="Footer">
      <div className="max-w-7xl mx-auto rounded-2xl bg-white dark:bg-gray-900 shadow-lg p-8 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">AbleConnect</h2>
            <p className="mb-6 text-base text-gray-600 dark:text-gray-400">
              Connecting people with disabilities to inclusive employment opportunities.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">For Job Seekers</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/jobs"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                  aria-label="Browse Jobs"
                >
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link
                  to="/resources"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                  aria-label="Career Resources"
                >
                  Career Resources
                </Link>
              </li>
              <li>
                <Link
                  to="/accessibility"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                  aria-label="Accessibility Options"
                >
                  Accessibility Options
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">For Employers</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/employers"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                  aria-label="Why AbleConnect"
                >
                  Why AbleConnect
                </Link>
              </li>
              <li>
                <Link
                  to="/post-job"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                  aria-label="Post a Job"
                >
                  Post a Job
                </Link>
              </li>
              <li>
                <Link
                  to="/employer/resources"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                  aria-label="Inclusive Hiring Resources"
                >
                  Inclusive Hiring Resources
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                  aria-label="Privacy Policy"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                  aria-label="Terms of Service"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/accessibility-statement"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
                  aria-label="Accessibility Statement"
                >
                  Accessibility Statement
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} AbleConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
