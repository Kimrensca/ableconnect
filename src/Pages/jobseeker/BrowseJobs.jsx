
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const BrowseJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  // Controlled filter states
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [jobType, setJobType] = useState(searchParams.get("jobType") || "");
  const [disabilityFriendly, setDisabilityFriendly] = useState(searchParams.get("disabilityFriendly") === "true");
  const [location, setLocation] = useState(searchParams.get("location") || "");

  // Fetch jobs whenever filters change
  useEffect(() => {
    const fetchJobs = async () => {
      const params = new URLSearchParams();

      if (search) {
        params.set("search", search);
      }
      if (jobType && jobType !== "All") {
        params.set("type", jobType);
      }
      if (disabilityFriendly) {
        params.set("disabilityFriendly", "true");
      }
      if (location) {
        params.set("location", location);
      }

      // Save filters into URL for persistence
      setSearchParams(params);

      const url = `http://localhost:5000/api/jobs?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();
      setJobs(data);
    };

    fetchJobs();
  }, [search, jobType, disabilityFriendly, location, setSearchParams]);

  return (
    <div className="max-w-4xl mx-auto p-4 text-gray-900 dark:text-gray-100">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Browse Jobs</h2>

      {/* Back to Home */}
      <div className="mt-4 mb-6">
        <Link
          to="/"
          className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
          aria-label="Back to Home"
        >
          ← Back to Home
        </Link>

        <Link
          to="/dashboard/jobseeker"
          className="text-blue-600 dark:text-blue-400 hover:underline mb-6 ml-5 inline-block"
          aria-label="Back to Job Seeker Dashboard"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 border rounded shadow space-y-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        {/* Search Field */}
        <div>
          <label className="block mb-1 font-medium text-gray-800 dark:text-gray-300" htmlFor="search">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title or company"
            className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            aria-label="Search by job title or company"
          />
        </div>

        <div className="flex flex-wrap items-end gap-4">
          {/* Job Type Dropdown */}
          <div className="flex flex-col">
            <label className="block mb-1 font-medium text-gray-800 dark:text-gray-300" htmlFor="jobType">
              Job Type
            </label>
            <select
              id="jobType"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 p-2 rounded w-80 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              aria-label="Select job type"
            >
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          {/* Location Field */}
          <div className="flex flex-col">
            <label className="block mb-1 font-medium text-gray-800 dark:text-gray-300" htmlFor="location">
              Location
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location (e.g. Nairobi)"
              className="border border-gray-300 dark:border-gray-600 p-2 rounded w-80 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              aria-label="Enter job location"
            />
          </div>

          {/* Disability Friendly Checkbox */}
          <div className="flex items-center mt-6 space-x-2">
            <input
              type="checkbox"
              id="disabilityFriendly"
              checked={disabilityFriendly}
              onChange={(e) => setDisabilityFriendly(e.target.checked)}
              className="h-4 w-4 accent-blue-600 dark:accent-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              aria-label="Filter by disability-friendly jobs"
            />
            <label htmlFor="disabilityFriendly" className="font-medium text-gray-800 dark:text-gray-300">
              Disability Friendly
            </label>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      {jobs.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No jobs available.</p>
      ) : (
        <ul className="space-y-4">
          {jobs.map((job) => (
            <li
              key={job._id}
              className="border p-4 rounded shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">{job.title}</h3>

              <div className="flex flex-wrap gap-2 mb-2">
                {/* Job Type Badge */}
                {job.type && (
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs px-3 py-1 rounded-full">
                    {job.type}
                  </span>
                )}

                {/* Disability Friendly Badge */}
                {job.disabilityFriendly && (
                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs px-3 py-1 rounded-full">
                    Disability-Friendly
                  </span>
                )}

                {/* Salary Badge */}
                {job.salary && (
                  <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 text-xs px-3 py-1 rounded-full">
                    KES {Number(job.salary).toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">{job.location}</p>
              <p className="text-gray-600 dark:text-gray-300">{job.companyName}</p>

              <Link to={`/job/${job._id}`}>
                <button
                  className="mt-2 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  aria-label={`View details for ${job.title}`}
                >
                  View Details
                </button>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BrowseJobs;
