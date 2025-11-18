
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiFetch from '../../utils/api';

const EditJob = () => {
  const { id } = useParams(); // Get job ID from URL
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [job, setJob] = useState({
    title: '',
    description: '',
    location: '',
    type: 'Full-time', // Default value
    salary: '',
    disabilityFriendly: false,
    status: 'Active', // Default value
  });

  // Fetch job details on mount
  useEffect(() => {
    const fetchJob = async () => {
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const data = await apiFetch(`/jobs/${id}`); // replaced fetch with apiFetch
        setJob(data);
      } catch (error) {
        console.error('Error fetching job:', error);
        toast.error('Failed to load job details');
      }
    };
    fetchJob();
  }, [id, token, navigate]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setJob((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle save action
  const handleSave = async (e) => {
    e.preventDefault();
    if (!token) return;
    try {
      await apiFetch(`/jobs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(job), // apiFetch will set headers / parse JSON
      });
      toast.success('Job updated successfully!');
      navigate('/dashboard/employer'); // Return to dashboard
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Edit Job</h1>
      <div className="mb-6">
        <Link
          to="/dashboard/employer"
          className="text-blue-600 dark:text-blue-400 underline text-sm hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
          aria-label="Back to Employer Dashboard"
        >
          ← Back to Dashboard
        </Link>
      </div>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Job Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={job.title}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mt-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            required
            aria-label="Job title"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={job.description}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mt-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            rows={4}
            required
            aria-label="Job description"
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={job.location}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mt-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            required
            aria-label="Job location"
          />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Job Type
          </label>
          <select
            id="type"
            name="type"
            value={job.type}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mt-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            aria-label="Select job type"
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
        </div>
        <div>
          <label htmlFor="salary" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Salary (optional)
          </label>
          <input
            type="text"
            id="salary"
            name="salary"
            value={job.salary || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mt-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            aria-label="Job salary (optional)"
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="disabilityFriendly"
            name="disabilityFriendly"
            checked={job.disabilityFriendly}
            onChange={handleChange}
            className="mr-2 h-4 w-4 accent-blue-600 dark:accent-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            aria-label="Disability-friendly job"
          />
          <label htmlFor="disabilityFriendly" className="text-sm text-gray-700 dark:text-gray-300">
            Disability-Friendly
          </label>
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={job.status}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mt-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            aria-label="Select job status"
          >
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="submit"
            className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            aria-label="Save job changes"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/employer')}
            className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
            aria-label="Cancel editing"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJob;
