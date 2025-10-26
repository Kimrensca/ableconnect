import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username') || 'Employer';

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

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  // Filter for Applications Tab
  const [appFilter, setAppFilter] = useState('pending');

  const fetchJobs = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/jobs/employer', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch jobs: ${await res.text()}`);
      const jobsData = await res.json();
      setJobs(Array.isArray(jobsData) ? jobsData : []);

      let totalApps = 0;
      const newApplicantsMap = {};
      for (const job of jobsData) {
        const appRes = await fetch(`http://localhost:5000/api/applications/employer/${job._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!appRes.ok) continue;
        const apps = await appRes.json();
        totalApps += apps.length;
        newApplicantsMap[job._id] = Array.isArray(apps) ? apps : [];
      }
      setApplicantsMap(newApplicantsMap);
      setTotalApplications(totalApps);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch jobs');
    }
  }, [token]);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    setIsLoadingProfile(true);
    try {
      const res = await fetch('http://localhost:5000/api/applications/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
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
    } catch (err) {
      toast.error(err.message || 'Failed to fetch profile');
    } finally {
      setIsLoadingProfile(false);
    }
  }, [token]);

  const handleSaveProfile = async () => {
    if (!companyProfile.username.trim() || !companyProfile.companyName.trim()) {
      toast.error('Username and Company Name are required.');
      return;
    }
    const formData = new FormData();
    Object.keys(companyProfile).forEach(key => {
      if (key === 'accommodations') {
        formData.append(key, JSON.stringify(companyProfile[key]));
      } else {
        formData.append(key, companyProfile[key]);
      }
    });

    try {
      setIsLoadingProfile(true);
      const res = await fetch('http://localhost:5000/api/applications/profile', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success('Profile updated!');
      setModalOpen(null);
      localStorage.setItem('username', companyProfile.username);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleCloseJob = async (jobId, newStatus = 'Closed') => {
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(`Job ${newStatus.toLowerCase()}!`);
      fetchJobs();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Delete this job?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success('Job deleted');
      fetchJobs();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEditJob = (jobId) => navigate(`/edit-job/${jobId}`);

  const handleViewApplicants = async (jobId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/applications/employer/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedJobApplicants(res.data);
      setApplicantsModalOpen(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load applicants');
    }
  };

  const updateStatus = async (applicationId, status, jobId, notes = '') => {
    try {
      const res = await fetch(`http://localhost:5000/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, notes }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success('Status updated');
      fetchJobs(); // Refresh all
      setReviewModalOpen(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleViewFile = async (type, filename) => {
    try {
      const url = `http://localhost:5000/api/applications/${type}/${filename}?view=true`;
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' });
      const blob = new Blob([res.data], { type: res.data.type });
      window.open(URL.createObjectURL(blob), '_blank');
    } catch {
      toast.error(`Failed to view ${type}`);
    }
  };

  const handleDownloadFile = async (type, filename) => {
    try {
      const url = `http://localhost:5000/api/applications/${type}/${filename}`;
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' });
      const urlBlob = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(urlBlob);
    } catch {
      toast.error(`Failed to download ${type}`);
    }
  };

  const newApplicationsCount = Object.values(applicantsMap)
    .flat()
    .filter(app => Date.now() - new Date(app.createdAt) < 7 * 24 * 60 * 60 * 1000)
    .length;

  // All Applications (flattened)
  const allApplications = Object.values(applicantsMap).flat();

  const pendingApps = allApplications.filter(a => !a.status || a.status === 'Pending');
  const reviewedApps = allApplications.filter(a => a.status && a.status !== 'Pending');

  useEffect(() => {
    if (!token) navigate('/login');
    else {
      fetchJobs();
      fetchProfile();
      const interval = setInterval(fetchJobs, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchJobs, fetchProfile, token, navigate]);

  // === Reusable Application Card ===
  const ApplicationReviewCard = ({ app, jobTitle }) => {
    const isNew = Date.now() - new Date(app.createdAt) < 7 * 24 * 60 * 60 * 1000;

    return (
      <li className="border p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">{app.applicantId?.email || 'Unknown'}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Job: {jobTitle}</p>
            <p className="text-xs text-gray-500">Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="flex gap-1">
            {isNew && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">New</span>}
            <span className={`text-xs px-2 py-1 rounded ${
              app.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
              app.status === 'Accepted' ? 'bg-green-100 text-green-800' :
              app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
              app.status === 'Interview Scheduled' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {app.status || 'Pending'}
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            setSelectedApplication(app);
            setNewStatus(app.status || 'Pending');
            setReviewNotes(app.feedback || '');
            setReviewModalOpen(true);
          }}
          className="mt-3 text-sm text-purple-600 dark:text-purple-400 hover:underline"
        >
          Review Application →
        </button>
      </li>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <nav className="flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Home</Link>
          <Link to="/resources" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Resources</Link>
        </div>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          Logout
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, {username}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Manage your jobs and company profile.</p>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="p-6 bg-gradient-to-br from-blue-100 to-white dark:from-blue-900 dark:to-gray-800 rounded-lg shadow text-center">
            <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Active Jobs</h2>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{jobs.filter(j => j.status === 'Active').length}</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-green-100 to-white dark:from-green-900 dark:to-gray-800 rounded-lg shadow text-center">
            <h2 className="text-lg font-semibold text-green-800 dark:text-green-200">Total Applications</h2>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalApplications}</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-yellow-100 to-white dark:from-yellow-900 dark:to-gray-800 rounded-lg shadow text-center">
            <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">New Applications</h2>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{newApplicationsCount}</p>
          </div>
        </div>

        <Link to="/post-job" className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 mb-8">
          Post a New Job
        </Link>

        {/* Tabs */}
        <div className="flex space-x-4 border-b pb-2 mb-6 border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('postedJobs')}
            className={`px-4 py-2 rounded-t ${activeTab === 'postedJobs' ? 'bg-blue-600 text-white' : 'text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400'}`}
          >
            Posted Jobs
          </button>
          <button
            onClick={() => { setActiveTab('applications'); setAppFilter('pending'); }}
            className={`px-4 py-2 rounded-t relative ${activeTab === 'applications' ? 'bg-blue-600 text-white' : 'text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400'}`}
          >
            Applications
            {newApplicationsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {newApplicationsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => { setActiveTab('companyProfile'); fetchProfile(); }}
            className={`px-4 py-2 rounded-t ${activeTab === 'companyProfile' ? 'bg-blue-600 text-white' : 'text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400'}`}
          >
            Company Profile
          </button>
        </div>

        {/* === POSTED JOBS TAB === */}
        {activeTab === 'postedJobs' && (
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No jobs posted yet.</p>
            ) : (
              jobs.map(job => (
                <div key={job._id} className="p-5 border rounded-lg bg-white dark:bg-gray-800 shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold">{job.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {job.location} • {job.type} •
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${job.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-300 text-gray-700'}`}>
                          {job.status}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">Posted: {new Date(job.createdAt).toLocaleDateString()}</p>
                      <span className="inline-block mt-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                        {applicantsMap[job._id]?.length || 0} Applicants
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {job.status === 'Active' && (
                        <button onClick={() => handleCloseJob(job._id)} className="text-xs border border-yellow-600 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-50">
                          Close
                        </button>
                      )}
                      {job.status === 'Closed' && (
                        <button onClick={() => handleCloseJob(job._id, 'Active')} className="text-xs border border-green-600 text-green-700 px-2 py-1 rounded hover:bg-green-50">
                          Reopen
                        </button>
                      )}
                      <button onClick={() => handleEditJob(job._id)} className="text-xs border border-blue-600 text-blue-700 px-2 py-1 rounded hover:bg-blue-50">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteJob(job._id)} className="text-xs border border-red-600 text-red-700 px-2 py-1 rounded hover:bg-red-50">
                        Delete
                      </button>
                      <button onClick={() => handleViewApplicants(job._id)} className="text-xs border border-purple-600 text-purple-700 px-2 py-1 rounded hover:bg-purple-50">
                        View Applicants
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* === APPLICATIONS TAB === */}
        {activeTab === 'applications' && (
          <div>
            <div className="flex space-x-3 mb-5">
              <button
                onClick={() => setAppFilter('pending')}
                className={`px-4 py-1.5 rounded font-medium text-sm ${appFilter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300'}`}
              >
                Pending ({pendingApps.length})
              </button>
              <button
                onClick={() => setAppFilter('reviewed')}
                className={`px-4 py-1.5 rounded font-medium text-sm ${appFilter === 'reviewed' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300'}`}
              >
                Reviewed ({reviewedApps.length})
              </button>
            </div>

            {appFilter === 'pending' && (
              <ul className="space-y-3">
                {pendingApps.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 italic">No pending applications.</p>
                ) : (
                  pendingApps.map(app => {
                    const job = jobs.find(j => j._id === app.jobId?._id);
                    return <ApplicationReviewCard key={app._id} app={app} jobTitle={job?.title || 'Unknown Job'} />;
                  })
                )}
              </ul>
            )}

            {appFilter === 'reviewed' && (
              <div className="space-y-5">
                {['Accepted', 'Rejected', 'Interview Scheduled'].map(status => {
                  const list = reviewedApps.filter(a => a.status === status);
                  if (list.length === 0) return null;
                  return (
                    <details key={status} open className="border rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                      <summary className="font-semibold cursor-pointer text-lg mb-2">
                        {status} ({list.length})
                      </summary>
                      <ul className="space-y-3 ml-4">
                        {list.map(app => {
                          const job = jobs.find(j => j._id === app.jobId?._id);
                          return <ApplicationReviewCard key={app._id} app={app} jobTitle={job?.title || 'Unknown Job'} />;
                        })}
                      </ul>
                    </details>
                  );
                })}
                {reviewedApps.length === 0 && <p className="text-gray-600 italic">No reviewed applications yet.</p>}
              </div>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Review Application</h3>
              <p><strong>Applicant:</strong> {selectedApplication.applicantId?.email}</p>
              <p><strong>Job:</strong> {selectedApplication.jobId?.title}</p>
              <p><strong>Bio:</strong> {selectedApplication.bio || 'N/A'}</p>
              <p><strong>Background:</strong> {selectedApplication.background || 'N/A'}</p>
              <p><strong>Experience:</strong> {selectedApplication.experience || 'N/A'}</p>
              {/* Special Needs Section */}
{selectedApplication.hasSpecialNeed ? (
  <div className="mt-4 bg-blue-50 border border-blue-200 p-4 rounded-lg">
    <h4 className="text-md font-semibold text-blue-800 mb-2">Special Need Information</h4>
    <p className="text-gray-800 mb-1">
      <span className="font-medium">Has Special Need:</span> Yes
    </p>
    <p className="text-gray-800">
      <span className="font-medium">Details:</span> {selectedApplication.specialNeedDetails || "Not specified"}
    </p>
  </div>
) : (
  <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-lg">
    <p className="text-gray-800">
      <span className="font-medium">Has Special Need:</span> No
    </p>
  </div>
)}


              <div className="mt-4">
      <p><strong>Resume:</strong></p>
      {selectedApplication.resume ? (
        <div className="flex space-x-2">
          <button onClick={() => handleViewFile('resume', selectedApplication.resume)}>
            View Resume
          </button>
          <button onClick={() => handleDownloadFile('resume', selectedApplication.resume)}>
            Download Resume
          </button>
        </div>
      ) : (
        <p>No resume uploaded</p>
      )}
    </div>

    <div className="mt-4">
      <p><strong>Certificate:</strong></p>
      {selectedApplication.certificate ? (
        <div className="flex space-x-2">
          <button onClick={() => handleViewFile('certificate', selectedApplication.certificate)}>
            View Certificate
          </button>
          <button onClick={() => handleDownloadFile('certificate', selectedApplication.certificate)}>
            Download Certificate
          </button>
        </div>
      ) : (
        <p>No certificate uploaded</p>
      )}
    </div>

              <div className="my-3">
                <label className="block font-medium mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                </select>
              </div>

              <div className="my-3">
                <label className="block font-medium mb-1">Notes</label>
                <textarea
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => updateStatus(selectedApplication._id, newStatus, selectedApplication.jobId._id, reviewNotes)}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
                <button onClick={() => setReviewModalOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === APPLICANTS MODAL === */}
{applicantsModalOpen && selectedJobApplicants && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] overflow-y-auto">
      <h3 className="text-xl font-bold mb-4">
        Applicants for {jobs.find(j => j._id === selectedJobApplicants[0]?.jobId?._id)?.title || 'Job'}
      </h3>
      {selectedJobApplicants.length > 0 ? (
        <ul className="space-y-2">
          {selectedJobApplicants.map((app) => (
            <li key={app._id} className="p-3 border rounded bg-gray-50 dark:bg-gray-700">
              <p><strong>{app.applicantId?.email}</strong></p>
              <p>Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
              <p>Status: <span className={`px-2 py-1 rounded text-xs ${
                app.status === 'Accepted' ? 'bg-green-100' :
                app.status === 'Rejected' ? 'bg-red-100' :
                app.status === 'Interview Scheduled' ? 'bg-blue-100' :
                'bg-yellow-100'
              }`}>{app.status || 'Pending'}</span></p>
              <button
                onClick={() => {
                  setSelectedApplication(app);
                  setNewStatus(app.status || 'Pending');
                  setReviewNotes(app.feedback || '');
                  setReviewModalOpen(true);
                  setApplicantsModalOpen(false);
                }}
                className="mt-2 text-purple-600 hover:underline text-sm"
              >
                Review
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No applicants yet.</p>
      )}
      <button
        onClick={() => setApplicantsModalOpen(false)}
        className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
      >
        Close
      </button>
    </div>
  </div>
)}
        </div>
      </div>

  );
};

export default EmployerDashboard;
