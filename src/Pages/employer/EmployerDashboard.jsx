
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username') || 'Employer';

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('postedJobs');
  const [applicantsMap, setApplicantsMap] = useState({});
  const [totalApplications, setTotalApplications] = useState(0);
  const [selectedJobApplicants, setSelectedJobApplicants] = useState([]);
  const [applicantsModalOpen, setApplicantsModalOpen] = useState(false);
  const [companyProfile, setCompanyProfile] = useState({
    username: '',
    companyName: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    industry: '',
    size: '',
    inclusionStatement: '',
    accommodations: [],
    accommodationsAvailable: false,
  });
  const [modalOpen, setModalOpen] = useState(null);
  const [newAccommodation, setNewAccommodation] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const fetchJobs = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/jobs/employer', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP ${res.status}: Failed to fetch jobs`);
      }
      const jobsData = await res.json();
      if (!Array.isArray(jobsData)) {
        console.error('Unexpected jobs data:', jobsData);
        throw new Error('Invalid jobs data format');
      }
      setJobs(jobsData);

      let totalApps = 0;
      const newApplicantsMap = {};
      for (const job of jobsData) {
        const appRes = await fetch(`http://localhost:5000/api/applications/employer/${job._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!appRes.ok) {
          const errorData = await appRes.json();
          throw new Error(errorData.message || `HTTP ${appRes.status}: Failed to fetch applications for job ${job._id}`);
        }
        const apps = await appRes.json();
        totalApps += apps.length;
        newApplicantsMap[job._id] = apps;
      }
      setApplicantsMap(newApplicantsMap);
      setTotalApplications(totalApps);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      toast.error(err.message || 'Failed to fetch jobs');
    }
  }, [token]);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoadingProfile(true);
      const res = await fetch('http://localhost:5000/api/applications/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP ${res.status}: Failed to fetch profile`);
      }
      const data = await res.json();
      setCompanyProfile({
        username: data.username || '',
        companyName: data.companyName || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
        website: data.website || '',
        industry: data.industry || '',
        size: data.size || '',
        inclusionStatement: data.inclusionStatement || '',
        accommodations: Array.isArray(data.accommodations) ? data.accommodations : [],
        accommodationsAvailable: data.accommodationsAvailable || false,
      });
      if (data.username) localStorage.setItem('username', data.username);
    } catch (error) {
      console.error('Error fetching company profile:', error);
      toast.error(error.message || 'Failed to fetch company profile');
    } finally {
      setIsLoadingProfile(false);
    }
  }, [token]);

  const handleSaveProfile = async () => {
    if (!token) {
      toast.error('No authentication token found.');
      return;
    }
    if (!companyProfile.username.trim()) {
      toast.error('Username is required.');
      return;
    }
    if (!companyProfile.companyName.trim()) {
      toast.error('Company Name is required.');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('username', companyProfile.username.trim());
    formDataToSend.append('companyName', companyProfile.companyName.trim());
    formDataToSend.append('email', companyProfile.email.trim());
    formDataToSend.append('phone', companyProfile.phone.trim());
    formDataToSend.append('location', companyProfile.location.trim());
    formDataToSend.append('website', companyProfile.website.trim());
    formDataToSend.append('industry', companyProfile.industry.trim());
    formDataToSend.append('size', companyProfile.size.trim());
    formDataToSend.append('inclusionStatement', companyProfile.inclusionStatement.trim());
    formDataToSend.append('accommodations', JSON.stringify(companyProfile.accommodations));
    formDataToSend.append('accommodationsAvailable', companyProfile.accommodationsAvailable.toString());

    try {
      setIsLoadingProfile(true);
      const res = await fetch('http://localhost:5000/api/applications/profile', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP ${res.status}: Failed to save profile`);
      }
      const data = await res.json();
      setCompanyProfile({
        username: data.username || '',
        companyName: data.companyName || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
        website: data.website || '',
        industry: data.industry || '',
        size: data.size || '',
        inclusionStatement: data.inclusionStatement || '',
        accommodations: data.accommodations || [],
        accommodationsAvailable: data.accommodationsAvailable || false,
      });
      setModalOpen(null);
      setNewAccommodation('');
      localStorage.setItem('username', data.username || '');
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(error.message || 'Failed to save profile');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      navigate('/login');
    }
  };

  const handleCloseJob = async (jobId, newStatus = 'Closed') => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP ${res.status}: Failed to update job status`);
      }
      toast.success(`Job ${newStatus.toLowerCase()} successfully!`);
      fetchJobs();
    } catch (err) {
      console.error('Error updating job status:', err);
      toast.error(err.message || 'Failed to update job status');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP ${res.status}: Failed to delete job`);
      }
      toast.success('Job deleted successfully!');
      fetchJobs();
    } catch (err) {
      console.error('Error deleting job:', err);
      toast.error(err.message || 'Failed to delete job');
    }
  };

  const handleEditJob = (jobId) => {
    navigate(`/edit-job/${jobId}`);
  };

  const handleViewApplicants = async (jobId) => {
    if (!jobId) {
      console.error('No jobId provided for viewing applicants');
      toast.error('Unable to view applicants: Invalid job ID');
      return;
    }
    try {
      const res = await axios.get(`http://localhost:5000/api/applications/employer/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedJobApplicants(res.data);
      setApplicantsModalOpen(true);
    } catch (err) {
      console.error('Error fetching applications:', err);
      toast.error(err.response?.data?.message || 'Failed to load applicants');
    }
  };

  const updateStatus = async (applicationId, status, jobId, notes = '') => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, notes }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP ${res.status}: Failed to update status`);
      }
      toast.success('Status updated successfully!');
      await handleViewApplicants(jobId); // Refresh applicants in modal
      fetchJobs(); // Update applicantsMap for Applications tab
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleViewFile = async (type, filename) => {
    if (!token || !filename) {
      toast.error('Authentication token or file missing');
      return;
    }
    try {
      const url = `http://localhost:5000/api/applications/${type}/${filename}?view=true`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const fileExt = filename.split('.').pop().toLowerCase();
      const mimeTypes = {
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };
      const mimeType = mimeTypes[fileExt] || 'application/octet-stream';
      const fileURL = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }));
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(fileURL);
    } catch (err) {
      console.error(`Error viewing ${type}:`, err);
      toast.error(err.response?.data?.message || `Failed to view ${type}`);
    }
  };

  const handleDownloadFile = async (type, filename) => {
    if (!token || !filename) {
      toast.error('Authentication token or file missing');
      return;
    }
    try {
      const url = `http://localhost:5000/api/applications/${type}/${filename}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(fileURL);
    } catch (err) {
      console.error(`Error downloading ${type}:`, err);
      toast.error(err.response?.data?.message || `Failed to download ${type}`);
    }
  };

  // Count new applications (less than 7 days old)
  const newApplicationsCount = Object.values(applicantsMap)
    .flat()
    .filter((app) => Date.now() - new Date(app.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000)
    .length;

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchJobs();
    fetchProfile();
    const interval = setInterval(fetchJobs, 30000);
    return () => clearInterval(interval);
  }, [fetchJobs, fetchProfile, token, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <nav className="flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4 items-center">
          <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-lg" aria-label="Home">
            Home
          </Link>
          <Link to="/resources" className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-lg" aria-label="Resources">
            Resources
          </Link>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 dark:bg-red-600 text-white px-4 py-2 rounded hover:bg-red-600 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
          aria-label="Logout"
        >
          Logout
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Welcome, {username} 👋</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Manage your job listings and company profile here.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="p-6 bg-gradient-to-br from-blue-100 to-white dark:from-blue-900 dark:to-gray-800 rounded-lg shadow-lg text-center">
            <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Active Jobs</h2>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{jobs.filter((j) => j.status === 'Active').length}</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-green-100 to-white dark:from-green-900 dark:to-gray-800 rounded-lg shadow-lg text-center">
            <h2 className="text-lg font-semibold text-green-800 dark:text-green-200">Total Applications</h2>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalApplications}</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-yellow-100 to-white dark:from-yellow-900 dark:to-gray-800 rounded-lg shadow-lg text-center">
            <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">New Applications</h2>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{newApplicationsCount}</p>
          </div>
        </div>

        <Link
          to="/post-job"
          className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-3 rounded hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 mb-12 inline-block"
          aria-label="Post a New Job"
        >
          Post a New Job
        </Link>

        <div className="mb-8">
          <div className="flex space-x-4 border-b pb-2 mb-4 border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setActiveTab('postedJobs');
                fetchJobs();
              }}
              className={`px-4 py-2 rounded-t ${
                activeTab === 'postedJobs'
                  ? 'bg-blue-600 text-white'
                  : 'text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
              aria-label="View Posted Jobs"
            >
              Posted Jobs
            </button>
            <button
              onClick={() => {
                setActiveTab('applications');
                fetchJobs();
              }}
              className={`px-4 py-2 rounded-t relative ${
                activeTab === 'applications'
                  ? 'bg-blue-600 text-white'
                  : 'text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
              aria-label={`View Applications (${newApplicationsCount} new)`}
            >
              Applications
              {newApplicationsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 dark:bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {newApplicationsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('companyProfile');
                fetchProfile();
                setModalOpen(null);
              }}
              className={`px-4 py-2 rounded-t ${
                activeTab === 'companyProfile'
                  ? 'bg-blue-600 text-white'
                  : 'text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
              aria-label="View Company Profile"
            >
              Company Profile
            </button>
          </div>
        </div>

        <div>
          {activeTab === 'postedJobs' && (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-10 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Your Job Listings</h2>
              {jobs.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-lg">You haven't posted any jobs yet.</p>
              ) : (
                <ul className="space-y-4">
                  {jobs.map((job) => (
                    <li
                      key={job._id}
                      className="p-5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                      role="article"
                      aria-label={`Job listing ${job.title}`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{job.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {job.location} • {job.type} •{' '}
                            <span
                              className={`ml-2 px-2 py-1 rounded text-xs ${
                                job.status === 'Active'
                                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                  : 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100'
                              }`}
                            >
                              {job.status}
                            </span>
                            {job.disabilityFriendly && (
                              <span className="ml-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded">
                                Disability-Friendly
                              </span>
                            )}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            Posted on: {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                          <span className="inline-block mt-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs font-semibold px-2 py-1 rounded-full">
                            {applicantsMap[job._id]?.length || 0} Applicants
                          </span>
                        </div>
                        <div className="flex flex-col space-y-2 mt-3 sm:mt-0">
                          {job.status === 'Active' && (
                            <button
                              onClick={() => handleCloseJob(job._id)}
                              className="text-yellow-700 dark:text-yellow-300 border border-yellow-700 dark:border-yellow-600 px-3 py-1 rounded hover:bg-yellow-50 dark:hover:bg-yellow-900 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400"
                              aria-label={`Close job ${job.title}`}
                            >
                              Close Job
                            </button>
                          )}
                          {job.status === 'Closed' && (
                            <button
                              onClick={() => handleCloseJob(job._id, 'Active')}
                              className="text-green-700 dark:text-green-300 border border-green-700 dark:border-green-600 px-3 py-1 rounded hover:bg-green-50 dark:hover:bg-green-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                              aria-label={`Reopen job ${job.title}`}
                            >
                              Reopen Job
                            </button>
                          )}
                          <button
                            onClick={() => handleEditJob(job._id)}
                            className="text-blue-700 dark:text-blue-400 border border-blue-700 dark:border-blue-400 px-3 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                            aria-label={`Edit job ${job.title}`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job._id)}
                            className="text-red-700 dark:text-red-400 border border-red-700 dark:border-red-400 px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                            aria-label={`Delete job ${job.title}`}
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => handleViewApplicants(job._id)}
                            className="text-purple-700 dark:text-purple-400 border border-purple-700 dark:border-purple-400 px-3 py-1 rounded hover:bg-purple-50 dark:hover:bg-purple-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                            aria-label={`View applicants for ${job.title}`}
                          >
                            View Applicants
                          </button>
                        </div>
                      </div>
                      {applicantsModalOpen && selectedJobApplicants && (
                        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 dark:bg-opacity-70 flex justify-center items-center">
                          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Applicants for {job.title}</h3>
                            {selectedJobApplicants.length > 0 ? (
                              <ul className="space-y-2">
                                {selectedJobApplicants.map((app) => (
                                  <li
                                    key={app._id}
                                    className="p-3 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                                    role="article"
                                    aria-label={`Application from ${app.applicantId?.email || 'Unknown Applicant'}`}
                                  >
                                    <p className="text-gray-800 dark:text-gray-100">
                                      <strong>Applicant:</strong> {app.applicantId?.email || 'Unknown email'}
                                    </p>
                                    <p className="text-gray-800 dark:text-gray-100">
                                      <strong>Applied on:</strong> {new Date(app.createdAt).toLocaleDateString()}
                                    </p>
                                    <p className="text-gray-800 dark:text-gray-100">
                                      <strong>Status:</strong>{' '}
                                      <span
                                        className={`px-2 py-1 rounded text-xs ${
                                          app.status === 'Pending'
                                            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                            : app.status === 'Accepted'
                                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                            : app.status === 'Rejected'
                                            ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                            : app.status === 'Interview Scheduled'
                                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                            : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-100'
                                        }`}
                                      >
                                        {app.status || 'Pending'}
                                      </span>
                                    </p>
                                    <button
                                      onClick={() => {
                                        setSelectedApplication(app);
                                        setNewStatus(app.status || 'Pending');
                                        setReviewNotes(app.feedback || '');
                                        setReviewModalOpen(true);
                                        setApplicantsModalOpen(false);
                                      }}
                                      className="mt-2 text-purple-700 dark:text-purple-400 border border-purple-700 dark:border-purple-400 px-3 py-1 rounded hover:bg-purple-50 dark:hover:bg-purple-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                                      aria-label={`Review application from ${app.applicantId?.email || 'Unknown Applicant'}`}
                                    >
                                      Review
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-500 dark:text-gray-400">No applicants for this job.</p>
                            )}
                            <div className="mt-4 flex justify-end space-x-2">
                              <button
                                onClick={() => setApplicantsModalOpen(false)}
                                className="text-gray-600 dark:text-gray-400 border border-gray-600 dark:border-gray-500 px-3 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                                aria-label="Close applicants modal"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-10 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Applications Received</h2>
              {Object.keys(applicantsMap).length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No applications fetched yet. Click "View Applicants" on a job to load them.
                </p>
              ) : (
                Object.entries(applicantsMap).map(([jobId, apps]) => {
                  const job = jobs.find((j) => j._id === jobId);
                  if (!job) return null;
                  return (
                    <div key={jobId} className="mb-6 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow bg-gray-50 dark:bg-gray-700">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{job.title}</h3>
                      {apps && apps.length > 0 ? (
                        <ul className="space-y-2">
                          {apps.map((app) => {
                            const isNew =
                              Date.now() - new Date(app.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
                            return (
                              <li
                                key={app._id}
                                className="p-3 border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-200"
                                role="article"
                                aria-label={`Application for ${job.title}`}
                              >
                                <p className="text-gray-800 dark:text-gray-100">
                                  <strong>Applicant:</strong> {app.applicantId?.email || 'Unknown email'}
                                </p>
                                <p className="text-gray-800 dark:text-gray-100">
                                  <strong>Applied on:</strong> {new Date(app.createdAt).toLocaleDateString()}
                                </p>
                                <div className="flex space-x-2 mt-2">
                                  {isNew && (
                                    <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs">
                                      New
                                    </span>
                                  )}
                                  <span
                                    className={`px-2 py-1 rounded text-xs ${
                                      app.status === 'Pending'
                                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                        : app.status === 'Accepted'
                                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                        : app.status === 'Rejected'
                                        ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                        : app.status === 'Interview Scheduled'
                                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                        : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-100'
                                    }`}
                                  >
                                    {app.status || 'Pending'}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setSelectedApplication(app);
                                      setNewStatus(app.status || 'Pending');
                                      setReviewNotes(app.feedback || '');
                                      setReviewModalOpen(true);
                                    }}
                                    className="text-purple-700 dark:text-purple-400 border border-purple-700 dark:border-purple-400 px-3 py-1 rounded hover:bg-purple-50 dark:hover:bg-purple-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                                    aria-label={`Review application for ${job.title}`}
                                  >
                                    Review
                                  </button>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">No applications for this job.</p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'companyProfile' && (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-10 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Company Profile</h2>
              {isLoadingProfile ? (
                <p className="text-gray-500 dark:text-gray-400 text-lg">Loading profile...</p>
              ) : (
                <>
                  <section className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Company Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100">Username</p>
                        <p className="text-gray-600 dark:text-gray-400">{companyProfile.username || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100">Company Name</p>
                        <p className="text-gray-600 dark:text-gray-400">{companyProfile.companyName || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100">Email</p>
                        <p className="text-gray-600 dark:text-gray-400">{companyProfile.email || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100">Phone</p>
                        <p className="text-gray-600 dark:text-gray-400">{companyProfile.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100">Location</p>
                        <p className="text-gray-600 dark:text-gray-400">{companyProfile.location || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100">Website</p>
                        <p className="text-gray-600 dark:text-gray-400">{companyProfile.website || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100">Industry</p>
                        <p className="text-gray-600 dark:text-gray-400">{companyProfile.industry || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100">Company Size</p>
                        <p className="text-gray-600 dark:text-gray-400">{companyProfile.size || 'Not provided'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setModalOpen('companyInfo')}
                      className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                      aria-label="Edit Company Information"
                    >
                      Edit Company Info
                    </button>
                  </section>

                  <section className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Disability Inclusion Statement</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded border border-gray-200 dark:border-gray-600">
                      <p className="text-gray-600 dark:text-gray-400">{companyProfile.inclusionStatement || 'No statement provided yet.'}</p>
                    </div>
                    <button
                      onClick={() => setModalOpen('inclusionStatement')}
                      className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                      aria-label="Edit Inclusion Statement"
                    >
                      Edit Inclusion Statement
                    </button>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Workplace Accommodations</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded border border-gray-200 dark:border-gray-600">
                      <ul className="list-disc pl-5">
                        {companyProfile.accommodations.length === 0 ? (
                          <p className="text-gray-600 dark:text-gray-400">No accommodations listed yet.</p>
                        ) : (
                          companyProfile.accommodations.map((accom, index) => (
                            <li key={index} className="mb-2 text-gray-800 dark:text-gray-100">
                              {accom.name}
                              <button
                                onClick={() => {
                                  const newAccommodations = [...companyProfile.accommodations];
                                  newAccommodations[index] = {
                                    ...accom,
                                    available: !accom.available,
                                  };
                                  setCompanyProfile({
                                    ...companyProfile,
                                    accommodations: newAccommodations,
                                  });
                                }}
                                className={`ml-2 px-2 py-1 rounded text-xs ${
                                  accom.available
                                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                }`}
                                aria-label={`Toggle availability of ${accom.name}`}
                              >
                                {accom.available ? 'Available' : 'Not Available'}
                              </button>
                              <button
                                onClick={() => {
                                  const newAccommodations = companyProfile.accommodations.filter(
                                    (_, i) => i !== index
                                  );
                                  setCompanyProfile({
                                    ...companyProfile,
                                    accommodations: newAccommodations,
                                  });
                                }}
                                className="ml-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
                                aria-label={`Remove ${accom.name}`}
                              >
                                Remove
                              </button>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                    <button
                      onClick={() => setModalOpen('accommodations')}
                      className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                      aria-label="Edit Accommodations"
                    >
                      Edit Accommodations
                    </button>
                  </section>
                </>
              )}
            </div>
          )}

          {modalOpen === 'companyInfo' && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 dark:bg-opacity-70 flex justify-center items-center">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Edit Company Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 dark:text-gray-300">Username <span className="text-red-500 dark:text-red-400">*</span></label>
                    <input
                      type="text"
                      value={companyProfile.username}
                      onChange={(e) => setCompanyProfile({ ...companyProfile, username: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mt-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      required
                      aria-label="Username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 dark:text-gray-300">Company Name <span className="text-red-500 dark:text-red-400">*</span></label>
                    <input
                      type="text"
                      value={companyProfile.companyName}
                      onChange={(e) => setCompanyProfile({ ...companyProfile, companyName: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mt-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      required
                      aria-label="Company Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 dark:text-gray-300">Email</label>
                    <input
                      type="email"
                      value={companyProfile.email}
                      onChange={(e) => setCompanyProfile({ ...companyProfile, email: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mt-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      aria-label="Email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 dark:text-gray-300">Phone</label>
                    <input
                      type="text"
                      value={companyProfile.phone}
                      onChange={(e) => setCompanyProfile({ ...companyProfile, phone: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mt-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      aria-label="Phone"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 dark:text-gray-300">Location</label>
                    <input
                      type="text"
                      value={companyProfile.location}
                      onChange={(e) => setCompanyProfile({ ...companyProfile, location: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mt-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      aria-label="Location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 dark:text-gray-300">Website</label>
                    <input
                      type="url"
                      value={companyProfile.website}
                      onChange={(e) => setCompanyProfile({ ...companyProfile, website: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mt-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      aria-label="Website"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 dark:text-gray-300">Industry</label>
                    <input
                      type="text"
                      value={companyProfile.industry}
                      onChange={(e) => setCompanyProfile({ ...companyProfile, industry: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mt-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      aria-label="Industry"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 dark:text-gray-300">Company Size</label>
                    <input
                      type="text"
                      value={companyProfile.size}
                      onChange={(e) => setCompanyProfile({ ...companyProfile, size: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mt-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      aria-label="Company Size"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    onClick={handleSaveProfile}
                    className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                    aria-label="Save Company Information"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setModalOpen(null)}
                    className="bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-500 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 text-sm"
                    aria-label="Cancel Editing Company Information"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {modalOpen === 'inclusionStatement' && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 dark:bg-opacity-70 flex justify-center items-center">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Edit Inclusion Statement</h2>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">Disability Inclusion Statement</label>
                  <textarea
                    value={companyProfile.inclusionStatement}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, inclusionStatement: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mt-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    rows={4}
                    aria-label="Inclusion Statement"
                  />
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    onClick={handleSaveProfile}
                    className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                    aria-label="Save Inclusion Statement"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setModalOpen(null)}
                    className="bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-500 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 text-sm"
                    aria-label="Cancel Editing Inclusion Statement"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {modalOpen === 'accommodations' && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 dark:bg-opacity-70 flex justify-center items-center">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Edit Workplace Accommodations</h2>
                <div className="mt-4">
                  <ul className="list-disc pl-5 mb-4">
                    {companyProfile.accommodations.length === 0 ? (
                      <p className="text-gray-600 dark:text-gray-400">No accommodations listed yet.</p>
                    ) : (
                      companyProfile.accommodations.map((accom, index) => (
                        <li key={index} className="mb-2 text-gray-800 dark:text-gray-100">
                          {accom.name}
                          <button
                            onClick={() => {
                              const newAccommodations = [...companyProfile.accommodations];
                              newAccommodations[index] = {
                                ...accom,
                                available: !accom.available,
                              };
                              setCompanyProfile({
                                ...companyProfile,
                                accommodations: newAccommodations,
                              });
                            }}
                            className={`ml-2 px-2 py-1 rounded text-xs ${
                              accom.available
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            }`}
                            aria-label={`Toggle availability of ${accom.name}`}
                          >
                            {accom.available ? 'Available' : 'Not Available'}
                          </button>
                          <button
                            onClick={() => {
                              const newAccommodations = companyProfile.accommodations.filter((_, i) => i !== index);
                              setCompanyProfile({
                                ...companyProfile,
                                accommodations: newAccommodations,
                              });
                            }}
                            className="ml-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
                            aria-label={`Remove ${accom.name}`}
                          >
                            Remove
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                  <div className="flex space-x-2 mb-4">
                    <input
                      type="text"
                      value={newAccommodation}
                      onChange={(e) => setNewAccommodation(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mt-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      placeholder="Add new accommodation"
                      aria-label="Add new accommodation"
                    />
                    <button
                      onClick={() => {
                        if (newAccommodation.trim()) {
                          setCompanyProfile({
                            ...companyProfile,
                            accommodations: [
                              ...companyProfile.accommodations,
                              { name: newAccommodation.trim(), available: true },
                            ],
                          });
                          setNewAccommodation('');
                        }
                      }}
                      className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                      aria-label="Add Accommodation"
                    >
                      Add
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 dark:text-gray-300">
                      Accommodations Available
                    </label>
                    <input
                      type="checkbox"
                      checked={companyProfile.accommodationsAvailable}
                      onChange={(e) =>
                        setCompanyProfile({
                          ...companyProfile,
                          accommodationsAvailable: e.target.checked,
                        })
                      }
                      className="mr-2 accent-blue-600 dark:accent-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      aria-label="Accommodations Available"
                    />
                    <span className="text-gray-800 dark:text-gray-100">Yes, we provide accommodations</span>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    onClick={handleSaveProfile}
                    className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                    aria-label="Save Accommodations"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setModalOpen(null)}
                    className="bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-500 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 text-sm"
                    aria-label="Cancel Editing Accommodations"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {reviewModalOpen && selectedApplication && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 dark:bg-opacity-70 flex justify-center items-center">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Review Application</h3>
                <p className="text-gray-800 dark:text-gray-100"><strong>Applicant:</strong> {selectedApplication.applicantId?.email || 'Unknown email'}</p>
                <p className="text-gray-800 dark:text-gray-100"><strong>Job Title:</strong> {selectedApplication.jobId?.title || 'Unknown'}</p>
                <p className="text-gray-800 dark:text-gray-100"><strong>Name:</strong> {selectedApplication.name || 'N/A'}</p>
                <p className="text-gray-800 dark:text-gray-100"><strong>Email:</strong> {selectedApplication.email || 'N/A'}</p>
                <p className="text-gray-800 dark:text-gray-100"><strong>Phone:</strong> {selectedApplication.phone || 'N/A'}</p>
                <p className="text-gray-800 dark:text-gray-100"><strong>Bio:</strong> {selectedApplication.bio || 'N/A'}</p>
                <p className="text-gray-800 dark:text-gray-100"><strong>Background:</strong></p>
                {Array.isArray(selectedApplication.background) && selectedApplication.background.length > 0 ? (
                  <ul className="list-disc pl-5 mb-4 text-gray-800 dark:text-gray-100">
                    {selectedApplication.background.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mb-4 text-gray-800 dark:text-gray-100">{selectedApplication.background || 'N/A'}</p>
                )}
                <p className="text-gray-800 dark:text-gray-100"><strong>Experience:</strong></p>
                {Array.isArray(selectedApplication.experience) && selectedApplication.experience.length > 0 ? (
                  <ul className="list-disc pl-5 mb-4 text-gray-800 dark:text-gray-100">
                    {selectedApplication.experience.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mb-4 text-gray-800 dark:text-gray-100">{selectedApplication.experience || 'N/A'}</p>
                )}
                <p className="text-gray-800 dark:text-gray-100"><strong>Cover Letter:</strong> {selectedApplication.coverLetter || 'N/A'}</p>
                <p className="text-gray-800 dark:text-gray-100"><strong>Accommodation Needs:</strong> {selectedApplication.accommodation || 'N/A'}</p>
                <div className="mt-4">
                  <p className="text-gray-800 dark:text-gray-100"><strong>Resume:</strong></p>
                  {selectedApplication.resume ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewFile('resume', selectedApplication.resume)}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                        aria-label="View resume"
                      >
                        View Resume
                      </button>
                      <button
                        onClick={() => handleDownloadFile('resume', selectedApplication.resume)}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                        aria-label="Download resume"
                      >
                        Download Resume
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">No resume uploaded</p>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-gray-800 dark:text-gray-100"><strong>Certificate:</strong></p>
                  {selectedApplication.certificate ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewFile('certificate', selectedApplication.certificate)}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                        aria-label="View certificate"
                      >
                        View Certificate
                      </button>
                      <button
                        onClick={() => handleDownloadFile('certificate', selectedApplication.certificate)}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                        aria-label="Download certificate"
                      >
                        Download Certificate
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">No certificate uploaded</p>
                  )}
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-300">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mt-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    aria-label="Application status"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                  </select>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-300">Review Notes</label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mt-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    rows={4}
                    aria-label="Review notes"
                  />
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    onClick={() => updateStatus(selectedApplication._id, newStatus, selectedApplication.jobId._id, reviewNotes)}
                    className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                    aria-label="Save application status"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setReviewModalOpen(false)}
                    className="bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-500 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 text-sm"
                    aria-label="Cancel reviewing application"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
