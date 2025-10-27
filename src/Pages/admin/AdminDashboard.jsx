import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Chart from 'chart.js/auto';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username') || 'Admin';
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const [activeTab, setActiveTab] = useState('users');
  const [appFilter, setAppFilter] = useState('pending');

  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [reports, setReports] = useState({});
  const [contentItems, setContentItems] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [contentForm, setContentForm] = useState({ title: '', body: '', category: 'Other', isPublished: false });

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      toast.error(`Failed to fetch users: ${err.message}`);
    }
  }, [token]);

  const fetchJobs = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/jobs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : data.jobs || []);
    } catch (err) {
      toast.error(`Failed to fetch jobs: ${err.message}`);
    }
  }, [token]);

  const fetchApplications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/applications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : data.applications || []);
    } catch (err) {
      toast.error(`Failed to fetch applications: ${err.message}`);
    }
  }, [token]);

  const fetchReports = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/reports', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setReports(data);
    } catch (err) {
      toast.error(`Failed to fetch reports: ${err.message}`);
    }
  }, [token]);

  const fetchContent = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/content', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setContentItems(Array.isArray(data) ? data : data.content || []);
    } catch (err) {
      toast.error(`Failed to fetch content: ${err.message}`);
    }
  }, [token]);

  // === User Handlers ===
  const handleApprove = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(await res.text());
      fetchUsers();
      toast.success('Employer approved');
    } catch (err) {
      toast.error(`Failed to approve: ${err.message}`);
    }
  };

  const handleEditUser = async (userId, updatedData) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error(await res.text());
      fetchUsers();
      toast.success('User updated');
    } catch (err) {
      toast.error(`Failed to update user: ${err.message}`);
    }
  };

  const handleSuspend = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/suspend`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(await res.text());
      fetchUsers();
      toast.success(`User ${users.find(u => u._id === userId).suspended ? 'unsuspended' : 'suspended'}`);
    } catch (err) {
      toast.error(`Failed to suspend: ${err.message}`);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      fetchUsers();
      toast.success('User deleted');
    } catch (err) {
      toast.error(`Failed to delete: ${err.message}`);
    }
  };

  // === Job Handlers ===
  const handleApproveJob = async (jobId) => {
    if (!window.confirm('Approve this job?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/jobs/${jobId}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      fetchJobs();
      toast.success('Job approved');
    } catch (err) {
      toast.error(`Failed to approve job: ${err.message}`);
    }
  };

  const handleRejectJob = async (jobId) => {
    if (!window.confirm('Reject this job?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/jobs/${jobId}/reject`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      fetchJobs();
      toast.success('Job rejected');
    } catch (err) {
      toast.error(`Failed to reject job: ${err.message}`);
    }
  };

  const handleEditJob = async (jobId, updatedData) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/jobs/${jobId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error(await res.text());
      fetchJobs();
      toast.success('Job updated');
    } catch (err) {
      toast.error(`Failed to update job: ${err.message}`);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      fetchJobs();
      toast.success('Job deleted');
    } catch (err) {
      toast.error(`Failed to delete job: ${err.message}`);
    }
  };

  // === Application Handler ===
  const handleUpdateAppStatus = async (appId, newStatus) => {
    if (!window.confirm(`Update status to ${newStatus}?`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/applications/${appId}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(await res.text());
      fetchApplications(); // Refreshes list → removes from Pending
      toast.success('Application status updated');
    } catch (err) {
      toast.error(`Failed to update status: ${err.message}`);
    }
  };

  // === Content Handlers ===
  const handleCreateContent = async () => {
    if (!contentForm.title || !contentForm.body || !contentForm.category) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/admin/content', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(contentForm),
      });
      if (!res.ok) throw new Error(await res.text());
      fetchContent();
      setContentForm({ title: '', body: '', category: 'Other', isPublished: false });
      setSelectedContent(null);
      toast.success('Content created');
    } catch (err) {
      toast.error(`Failed to create content: ${err.message}`);
    }
  };

  const handleEditContent = async () => {
    if (!contentForm.title || !contentForm.body || !contentForm.category) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/admin/content/${selectedContent._id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(contentForm),
      });
      if (!res.ok) throw new Error(await res.text());
      fetchContent();
      setContentForm({ title: '', body: '', category: 'Other', isPublished: false });
      setSelectedContent(null);
      toast.success('Content updated');
    } catch (err) {
      toast.error(`Failed to update content: ${err.message}`);
    }
  };

  const handlePublishContent = async (contentId, isPublished) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/content/${contentId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !isPublished }),
      });
      if (!res.ok) throw new Error(await res.text());
      fetchContent();
      toast.success(`Content ${isPublished ? 'unpublished' : 'published'}`);
    } catch (err) {
      toast.error(`Failed to update publish status: ${err.message}`);
    }
  };

  const handleDeleteContent = async (contentId) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/content/${contentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      fetchContent();
      toast.success('Content deleted');
    } catch (err) {
      toast.error(`Failed to delete content: ${err.message}`);
    }
  };

  // === Effects ===
  useEffect(() => {
    fetchUsers();
    fetchJobs();
    fetchApplications();
    fetchReports();
    fetchContent();

    const interval = setInterval(() => {
      fetchUsers();
      fetchJobs();
      fetchReports();
      fetchContent();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchUsers, fetchJobs, fetchApplications, fetchReports, fetchContent]);

  useEffect(() => {
    if (activeTab === 'reports' && chartRef.current) {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
      try {
        chartInstanceRef.current = new Chart(chartRef.current, {
          type: 'bar',
          data: {
            labels: ['Users', 'Jobs', 'Applications', 'Hires'],
            datasets: [{
              label: 'Platform Metrics',
              data: [reports.totalUsers || 0, reports.totalJobs || 0, reports.totalApplications || 0, reports.hires || 0],
              backgroundColor: ['#60a5fa', '#34d399', '#facc15', '#f87171'],
              borderColor: ['#3b82f6', '#10b981', '#eab308', '#ef4444'],
              borderWidth: 1,
            }],
          },
          options: {
            responsive: true,
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Count' } },
              x: { title: { display: true, text: 'Metrics' } },
            },
            plugins: { legend: { display: true }, title: { display: true, text: 'Platform Activity' } },
          },
        });
      } catch (err) {
        toast.error('Failed to render chart');
      }
    }
    return () => {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    };
  }, [activeTab, reports]);

  // === Reusable Application Row ===
  const ApplicationRow = ({ app }) => {
    const [feedback, setFeedback] = useState(app.feedback || '');

    const saveFeedback = async () => {
      try {
        await fetch(`http://localhost:5000/api/admin/applications/${app._id}/feedback`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedback }),
        });
        toast.success('Comments saved');
      } catch {
        toast.error('Failed to save comments');
      }
    };

    return (
      <li className="border p-4 rounded shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <p><strong>Applicant:</strong> {app.applicantId?.email || 'Unknown'}</p>
        <p><strong>Job:</strong> {app.jobId?.title || 'Unknown'}</p>
        <p><strong>Status:</strong> {app.status || 'Pending'}</p>
        <p><strong>Bio:</strong> {app.bio || 'N/A'}</p>

        <p className="mt-2 font-medium">Background:</p>
        {Array.isArray(app.background) && app.background.length > 0 ? (
          <ul className="list-disc pl-5 text-sm">{app.background.map((item, i) => <li key={i}>{item}</li>)}</ul>
        ) : <p className="text-sm">N/A</p>}

        <p className="mt-2 font-medium">Experience:</p>
        {Array.isArray(app.experience) && app.experience.length > 0 ? (
          <ul className="list-disc pl-5 text-sm">{app.experience.map((item, i) => <li key={i}>{item}</li>)}</ul>
        ) : <p className="text-sm">N/A</p>}

        {/* Special Needs Section */}
{app.hasSpecialNeed ? (
  <div className="mt-4 bg-blue-50 border border-blue-200 p-4 rounded-lg">
    <h4 className="text-md font-semibold text-blue-800 mb-2">Special Need Information</h4>
    <p className="text-gray-800 mb-1">
      <span className="font-medium">Has Special Need:</span> Yes
    </p>
    <p className="text-gray-800">
      <span className="font-medium">Details:</span> {app.specialNeedDetails || "Not specified"}
    </p>
  </div>
) : (
  <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-lg">
    <p className="text-gray-800">
      <span className="font-medium">Has Special Need:</span> No
    </p>
  </div>
)}


        <div className="my-3 flex gap-3">
          {app.resume && (
            <button
              onClick={async () => {
                try {
                  const res = await fetch(`http://localhost:5000/api/applications/resume/${encodeURIComponent(app.resume)}?view=true`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  const blob = await res.blob();
                  window.open(window.URL.createObjectURL(blob), '_blank');
                } catch { toast.error('Failed to view resume'); }
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              View Resume
            </button>
          )}
          {app.certificate && (
            <button
              onClick={async () => {
                try {
                  const res = await fetch(`http://localhost:5000/api/applications/certificate/${encodeURIComponent(app.certificate)}?view=true`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  const blob = await res.blob();
                  window.open(window.URL.createObjectURL(blob), '_blank');
                } catch { toast.error('Failed to view certificate'); }
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              View Certificate
            </button>
          )}
        </div>

        <div className="my-3">
          <label className="block text-sm font-medium mb-1">Comments</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full p-2 border rounded text-sm bg-gray-50 dark:bg-gray-700"
            rows={2}
            placeholder="Add admin comments..."
          />
          <button onClick={saveFeedback} className="mt-1 text-xs bg-blue-600 text-white px-2 py-1 rounded">
            Save Comments
          </button>
        </div>

        <select
          value={app.status || 'Pending'}
          onChange={(e) => handleUpdateAppStatus(app._id, e.target.value)}
          className="border border-gray-300 dark:border-gray-600 p-1 rounded text-sm"
        >
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
          <option value="Interview Scheduled">Interview Scheduled</option>
        </select>
      </li>
    );
  };

  // === Render ===
  return (
    <div className="p-8 text-gray-900 dark:text-gray-100">
      <div className="flex justify-between mb-8">
        <h1 className="text-2xl font-bold">Welcome, {username}</h1>
        <div className="flex space-x-4">
          <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline text-lg font-medium">Home</Link>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('userRole');
              navigate('/login');
            }}
            className="bg-red-500 dark:bg-red-600 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex space-x-4 border-b pb-2 mb-4 border-gray-200 dark:border-gray-700">
          {['users', 'jobs', 'applications', 'reports', 'content'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-t ${activeTab === tab
                ? 'bg-blue-600 dark:bg-blue-700 text-white'
                : 'text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div>
        {/* === USERS TAB === */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-bold mb-4">User Management</h2>
            {users.length === 0 ? (
              <p className="text-gray-800 dark:text-gray-300">No users found.</p>
            ) : (
              <ul className="space-y-4">
                {users.map(user => (
                  <li key={user._id} className="border p-4 rounded shadow bg-white dark:bg-gray-800">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Username:</strong> {user.username || 'Not set'}</p>
                    <p><strong>Role:</strong> {user.role}</p>
                    <p><strong>Status:</strong> {user.suspended ? 'Suspended' : user.approved ? 'Approved' : 'Pending'}</p>
                    <div className="flex space-x-2 mt-2">
                      {!user.approved && (
                        <button onClick={() => handleApprove(user._id)} className="bg-green-600 text-white px-2 py-1 rounded">Approve</button>
                      )}
                      <button onClick={() => handleSuspend(user._id)} className="bg-yellow-600 text-white px-2 py-1 rounded">
                        {user.suspended ? 'Unsuspend' : 'Suspend'}
                      </button>
                      <button
                        onClick={() => {
                          const newEmail = prompt('New email:', user.email);
                          const newUsername = prompt('New username:', user.username);
                          const newRole = prompt('New role (jobseeker/employer/admin):', user.role);
                          if (newEmail || newUsername || newRole) {
                            handleEditUser(user._id, { email: newEmail, username: newUsername, role: newRole });
                          }
                        }}
                        className="bg-blue-600 text-white px-2 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDelete(user._id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* === JOBS TAB === */}
        {activeTab === 'jobs' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Job Management</h2>
            {jobs.length === 0 ? (
              <p className="text-gray-800 dark:text-gray-300">No jobs found.</p>
            ) : (
              <ul className="space-y-4">
                {jobs.map(job => (
                  <li key={job._id} className="border p-4 rounded shadow bg-white dark:bg-gray-800">
                    <p><strong>Title:</strong> {job.title}</p>
                    <p><strong>Status:</strong> {job.status}</p>
                    <p><strong>Posted by:</strong> {job.postedBy?.email || 'Unknown'}</p>
                    <div className="flex space-x-2 mt-2">
                      {job.status === 'Pending' && (
                        <>
                          <button onClick={() => handleApproveJob(job._id)} className="bg-green-600 text-white px-2 py-1 rounded">Approve</button>
                          <button onClick={() => handleRejectJob(job._id)} className="bg-red-600 text-white px-2 py-1 rounded">Reject</button>
                        </>
                      )}
                      <button onClick={() => setSelectedJob(job)} className="bg-yellow-600 text-white px-2 py-1 rounded">Edit</button>
                      <button onClick={() => handleDeleteJob(job._id)} className="bg-red-600 text-white px-2 py-1 rounded">Remove</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {selectedJob && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full">
                  <h3 className="text-lg font-bold mb-4">Edit Job</h3>
                  <input
                    type="text" placeholder="Title" value={selectedJob.title || ''}
                    onChange={e => setSelectedJob({ ...selectedJob, title: e.target.value })}
                    className="border p-2 rounded w-full mb-3"
                  />
                  <textarea
                    placeholder="Description" value={selectedJob.description || ''}
                    onChange={e => setSelectedJob({ ...selectedJob, description: e.target.value })}
                    className="border p-2 rounded w-full mb-3 h-24"
                  />
                  <input
                    type="text" placeholder="Company" value={selectedJob.company || ''}
                    onChange={e => setSelectedJob({ ...selectedJob, company: e.target.value })}
                    className="border p-2 rounded w-full mb-3"
                  />
                  <input
                    type="text" placeholder="Location" value={selectedJob.location || ''}
                    onChange={e => setSelectedJob({ ...selectedJob, location: e.target.value })}
                    className="border p-2 rounded w-full mb-3"
                  />
                  <select
                    value={selectedJob.status || 'Active'}
                    onChange={e => setSelectedJob({ ...selectedJob, status: e.target.value })}
                    className="border p-2 rounded w-full mb-3"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Active">Active</option>
                    <option value="Closed">Closed</option>
                  </select>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        handleEditJob(selectedJob._id, {
                          title: selectedJob.title,
                          description: selectedJob.description,
                          company: selectedJob.company,
                          location: selectedJob.location,
                          status: selectedJob.status,
                        });
                        setSelectedJob(null);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Save
                    </button>
                    <button onClick={() => setSelectedJob(null)} className="bg-gray-500 text-white px-4 py-2 rounded">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* === APPLICATIONS TAB === */}
        {activeTab === 'applications' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Application Oversight</h2>

            <div className="flex space-x-3 mb-5">
              <button
                onClick={() => setAppFilter('pending')}
                className={`px-4 py-1.5 rounded font-medium text-sm transition-colors ${
                  appFilter === 'pending'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Pending ({applications.filter(a => !a.status || a.status === 'Pending').length})
              </button>
              <button
                onClick={() => setAppFilter('reviewed')}
                className={`px-4 py-1.5 rounded font-medium text-sm transition-colors ${
                  appFilter === 'reviewed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Reviewed ({applications.filter(a => a.status && a.status !== 'Pending').length})
              </button>
            </div>

            {appFilter === 'pending' && (
              <ul className="space-y-4">
                {applications
                  .filter(a => !a.status || a.status === 'Pending')
                  .map(app => (
                    <ApplicationRow key={app._id} app={app} />
                  ))}
                {applications.filter(a => !a.status || a.status === 'Pending').length === 0 && (
                  <p className="text-gray-600 dark:text-gray-400 italic">No pending applications.</p>
                )}
              </ul>
            )}

            {appFilter === 'reviewed' && (
              <div className="space-y-5">
                {['Accepted', 'Rejected', 'Interview Scheduled'].map(status => {
                  const list = applications.filter(a => a.status === status);
                  if (list.length === 0) return null;

                  return (
                    <details key={status} open className="border rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                      <summary className="font-semibold cursor-pointer text-lg mb-2">
                        {status} ({list.length})
                      </summary>
                      <ul className="space-y-3 ml-4">
                        {list.map(app => (
                          <ApplicationRow key={app._id} app={app} />
                        ))}
                      </ul>
                    </details>
                  );
                })}
                {applications.filter(a => a.status && a.status !== 'Pending').length === 0 && (
                  <p className="text-gray-600 dark:text-gray-400 italic">No reviewed applications yet.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* === REPORTS TAB === */}
        {activeTab === 'reports' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Reports & Analytics</h2>
            <canvas ref={chartRef} className="max-w-full bg-white dark:bg-gray-800 rounded-lg shadow"></canvas>
            {/* Add your stats grid here if needed */}
          </div>
        )}

        {/* === CONTENT TAB === */}
        {activeTab === 'content' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Content Management</h2>
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4">{selectedContent ? 'Edit Content' : 'Add New Content'}</h3>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg">
                <input
                  type="text" placeholder="Title" value={contentForm.title}
                  onChange={e => setContentForm({ ...contentForm, title: e.target.value })}
                  className="border p-2 rounded w-full mb-3"
                />
                <textarea
                  placeholder="Body" value={contentForm.body}
                  onChange={e => setContentForm({ ...contentForm, body: e.target.value })}
                  className="border p-2 rounded w-full mb-3 h-32"
                />
                <select
                  value={ contentForm.category}
                  onChange={e => setContentForm({ ...contentForm, category: e.target.value })}
                  className="border p-2 rounded w-full mb-3"
                >
                  <option value="Homepage">Homepage</option>
                  <option value="FAQ">FAQ</option>
                  <option value="Guidelines">Guidelines</option>
                  <option value="Announcements">Announcements</option>
                  <option value="Guides">Guides</option>
                  <option value="Other">Other</option>
                </select>
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox" checked={contentForm.isPublished}
                    onChange={e => setContentForm({ ...contentForm, isPublished: e.target.checked })}
                  />
                  Publish Content
                </label>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={selectedContent ? handleEditContent : handleCreateContent}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    {selectedContent ? 'Save Changes' : 'Create Content'}
                  </button>
                  <button
                    onClick={() => {
                      setContentForm({ title: '', body: '', category: 'Other', isPublished: false });
                      setSelectedContent(null);
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
            <ul className="space-y-4">
              {contentItems.map(content => (
                <li key={content._id} className="border p-4 rounded shadow bg-gray-100 dark:bg-gray-800">
                  <p><strong>Title:</strong> {content.title}</p>
                  <p><strong>Category:</strong> {content.category}</p>
                  <p><strong>Published:</strong> {content.isPublished ? 'Yes' : 'No'}</p>
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => {
                        setSelectedContent(content);
                        setContentForm({ ...content });
                      }}
                      className="bg-blue-600 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handlePublishContent(content._id, content.isPublished)}
                      className="bg-yellow-600 text-white px-2 py-1 rounded"
                    >
                      {content.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button onClick={() => handleDeleteContent(content._id)} className="bg-red-600 text-white px-2 py-1 rounded">
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;