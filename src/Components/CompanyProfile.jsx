import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import apiFetch from "../utils/api";

const CompanyProfile = () => {
  const { companyName } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        console.log(`Fetching company profile for ${companyName}`);
        const res = await apiFetch(`/applications/companies/${companyName}`);
        console.log('Response data:', res);
        setCompany(res);
      } catch (err) {
        console.error('Fetch error:', err);
        setError("Failed to load company profile.");
        toast.error(err.message || "Error loading company profile. Check console for details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyProfile();
  }, [companyName]);

  if (loading)
    return (
      <div className="text-center p-6 text-gray-600 dark:text-gray-400">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="text-center text-red-600 dark:text-red-400 p-6" role="alert">
        {error}
      </div>
    );
  if (!company)
    return (
      <div className="text-center text-red-600 dark:text-red-400 p-6" role="alert">
        Company not found
      </div>
    );

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <div className="mb-6">
        <Link
          to="/jobs"
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
          aria-label="Back to Jobs"
        >
          ← Back to Job Listings
        </Link>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {company.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Company Profile</p>
      </div>

      <div className="space-y-6">
        {company.website && (
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-gray-900 dark:text-gray-100">
              <strong>Website:</strong>{' '}
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
                aria-label={`Visit ${company.name} website`}
              >
                {company.website}
              </a>
            </p>
          </div>
        )}

        {company.industry && (
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-gray-900 dark:text-gray-100">
              <strong>Industry:</strong> {company.industry}
            </p>
          </div>
        )}

        {company.size && (
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-gray-900 dark:text-gray-100">
              <strong>Company Size:</strong> {company.size}
            </p>
          </div>
        )}

        {company.inclusionStatement && (
          <div className="p-4 border border-blue-300 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900">
            <p className="text-gray-900 dark:text-gray-100">
              <strong>Inclusion Statement:</strong>
            </p>
            <p className="text-gray-800 dark:text-gray-200 mt-2 italic">
              {company.inclusionStatement}
            </p>
          </div>
        )}

        {company.accommodations && company.accommodations.length > 0 && (
          <div className="p-4 border border-green-300 dark:border-green-700 rounded-lg bg-green-50 dark:bg-green-900">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Workplace Accommodations
            </h2>
            <ul className="space-y-2">
              {company.accommodations.map((acc, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2 text-gray-800 dark:text-gray-200"
                >
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      acc.available
                        ? 'bg-green-600 dark:bg-green-400'
                        : 'bg-gray-400 dark:bg-gray-500'
                    }`}
                    aria-hidden="true"
                  ></span>
                  <span>
                    {acc.name || acc}{' '}
                    {acc.available ? (
                      <span className="text-xs bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                        Available
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
                        Not Available
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
          <p className="text-gray-900 dark:text-gray-100">
            <strong>Accessibility Support:</strong>{' '}
            <span
              className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                company.accommodationsAvailable
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              {company.accommodationsAvailable ? '✓ Available' : '✗ Not Specified'}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
          aria-label="Go back"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default CompanyProfile;