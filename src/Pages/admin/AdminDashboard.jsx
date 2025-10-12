
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
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [reports, setReports] = useState({});
  const [contentItems, setContentItems] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [contentForm, setContentForm] = useState({ title: '', body: '', category: 'Other', isPublished: false });

  const fetchUsers = useCallback(async () => {
    if (!token) {
      console.log('No token found');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
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

  const handleApproveJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to approve this job?')) return;
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
    if (!window.confirm('Are you sure you want to reject this job?')) return;
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

  const handleUpdateAppStatus = async (appId, newStatus) => {
    if (!window.confirm(`Update status to ${newStatus}?`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/applications/${appId}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(await res.text());
      fetchApplications();
      toast.success('Application status updated');
    } catch (err) {
      toast.error(`Failed to update status: ${err.message}`);
    }
  };

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
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      try {
        chartInstanceRef.current = new Chart(chartRef.current, {
          type: 'bar',
          data: {
            labels: ['Users', 'Jobs', 'Applications', 'Hires'],
            datasets: [{
              label: 'Platform Metrics',
              data: [
                reports.totalUsers || 0,
                reports.totalJobs || 0,
                reports.totalApplications || 0,
                reports.hires || 0,
              ],
              backgroundColor: [
                '#60a5fa', // Lighter blue for dark mode
                '#34d399', // Lighter green
                '#facc15', // Lighter yellow
                '#f87171', // Lighter red
              ],
              borderColor: [
                '#3b82f6', // Darker blue
                '#10b981', // Darker green
                '#eab308', // Darker yellow
                '#ef4444', // Darker red
              ],
              borderWidth: 1,
            }],
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                title: { display: true, text: 'Count', color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151' },
                ticks: { color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151' },
                grid: { color: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb' },
              },
              x: {
                title: { display: true, text: 'Metrics', color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151' },
                ticks: { color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151' },
                grid: { color: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb' },
              },
            },
            plugins: {
              legend: { display: true, labels: { color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151' } },
              title: { display: true, text: 'Platform Activity', color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151' },
            },
          },
        });
      } catch (err) {
        console.error('Error initializing chart:', err);
        toast.error('Failed to render chart');
      }
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [activeTab, reports]);

  return (
    <div className="p-8 text-gray-900 dark:text-gray-100">
      <div className="flex justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome, {username} 👨‍💼</h1>
        <div className="flex space-x-4">
          <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline text-lg font-medium" aria-label="Go to Home">
            Home
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('userRole');
              navigate('/login');
            }}
            className="bg-red-500 dark:bg-red-600 text-white px-4 py-2 rounded hover:bg-red-600 dark:hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex space-x-4 border-b pb-2 mb-4 border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-t ${
              activeTab === 'users'
                ? 'bg-blue-600 dark:bg-blue-700 text-white'
                : 'text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
            aria-label="View Users Tab"
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 rounded-t ${
              activeTab === 'jobs'
                ? 'bg-blue-600 dark:bg-blue-700 text-white'
                : 'text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
            aria-label="View Jobs Tab"
          >
            Jobs
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-t ${
              activeTab === 'applications'
                ? 'bg-blue-600 dark:bg-blue-700 text-white'
                : 'text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
            aria-label="View Applications Tab"
          >
            Applications
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-t ${
              activeTab === 'reports'
                ? 'bg-blue-600 dark:bg-blue-700 text-white'
                : 'text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
            aria-label="View Reports Tab"
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded-t ${
              activeTab === 'content'
                ? 'bg-blue-600 dark:bg-blue-700 text-white'
                : 'text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
            aria-label="View Content Management Tab"
          >
            Content
          </button>
        </div>
      </div>

      <div>
        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">User Management</h2>
            {users.length === 0 ? (
              <p className="text-gray-800 dark:text-gray-300">No users found.</p>
            ) : (
              <ul className="space-y-4">
                {users.map((user) => (
                  <li key={user._id} className="border p-4 rounded shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <p className="text-gray-900 dark:text-gray-100"><strong>Email:</strong> {user.email}</p>
                    <p className="text-gray-900 dark:text-gray-100"><strong>Username:</strong> {user.username || 'Not set'}</p>
                    <p className="text-gray-900 dark:text-gray-100"><strong>Role:</strong> {user.role}</p>
                    <p className="text-gray-900 dark:text-gray-100"><strong>Status:</strong> {user.suspended ? 'Suspended' : user.approved ? 'Approved' : 'Pending'}</p>
                    <div className="flex space-x-2 mt-2">
                      {!user.approved && (
                        <button
                          onClick={() => handleApprove(user._id)}
                          className="bg-green-600 dark:bg-green-700 text-white px-2 py-1 rounded hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                          aria-label={`Approve user ${user.email}`}
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleSuspend(user._id)}
                        className="bg-yellow-600 dark:bg-yellow-700 text-white px-2 py-1 rounded hover:bg-yellow-700 dark:hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400"
                        aria-label={user.suspended ? `Unsuspend user ${user.email}` : `Suspend user ${user.email}`}
                      >
                        {user.suspended ? 'Unsuspend' : 'Suspend'}
                      </button>
                      <button
                        onClick={() => {
                          const newEmail = prompt('New email:', user.email);
                          const newUsername = prompt('New username:', user.username);
                          const newRole = prompt('New role (jobseeker/employer/admin):', user.role);
                          if (newEmail || newUsername || newRole) {
                            handleEditUser(user._id, {
                              email: newEmail,
                              username: newUsername,
                              role: newRole,
                            });
                          }
                        }}
                        className="bg-blue-600 dark:bg-blue-700 text-white px-2 py-1 rounded hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        aria-label={`Edit user ${user.email}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="bg-red-600 dark:bg-red-700 text-white px-2 py-1 rounded hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                        aria-label={`Delete user ${user.email}`}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'jobs' && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Job Management</h2>
            {jobs.length === 0 ? (
              <p className="text-gray-800 dark:text-gray-300">No jobs found.</p>
            ) : (
              <ul className="space-y-4">
                {jobs.map((job) => (
                  <li key={job._id} className="border p-4 rounded shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <p className="text-gray-900 dark:text-gray-100"><strong>Title:</strong> {job.title}</p>
                    <p className="text-gray-900 dark:text-gray-100"><strong>Status:</strong> {job.status}</p>
                    <p className="text-gray-900 dark:text-gray-100"><strong>Posted by:</strong> {job.postedBy?.email || 'Unknown'}</p>
                    <div className="flex space-x-2 mt-2">
                      {job.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleApproveJob(job._id)}
                            className="bg-green-600 dark:bg-green-700 text-white px-2 py-1 rounded hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                            aria-label={`Approve job ${job.title}`}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectJob(job._id)}
                            className="bg-red-600 dark:bg-red-700 text-white px-2 py-1 rounded hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                            aria-label={`Reject job ${job.title}`}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="bg-yellow-600 dark:bg-yellow-700 text-white px-2 py-1 rounded hover:bg-yellow-700 dark:hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400"
                        aria-label={`Edit job ${job.title}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        className="bg-red-600 dark:bg-red-700 text-white px-2 py-1 rounded hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                        aria-label={`Delete job ${job.title}`}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {selectedJob && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                role="dialog"
                aria-labelledby="edit-job-modal"
                aria-modal="true"
              >
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full border border-gray-200 dark:border-gray-700">
                  <h3 id="edit-job-modal" className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
                    Edit Job
                  </h3>
                  <input
                    type="text"
                    placeholder="Title"
                    value={selectedJob.title || ''}
                    onChange={(e) => setSelectedJob({ ...selectedJob, title: e.target.value })}
                    className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full mb-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    aria-label="Job title"
                  />
                  <textarea
                    placeholder="Description"
                    value={selectedJob.description || ''}
                    onChange={(e) => setSelectedJob({ ...selectedJob, description: e.target.value })}
                    className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full mb-3 h-24 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    aria-label="Job description"
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={selectedJob.company || ''}
                    onChange={(e) => setSelectedJob({ ...selectedJob, company: e.target.value })}
                    className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full mb-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    aria-label="Company name"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={selectedJob.location || ''}
                    onChange={(e) => setSelectedJob({ ...selectedJob, location: e.target.value })}
                    className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full mb-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    aria-label="Job location"
                  />
                  <select
                    value={selectedJob.status || 'Active'}
                    onChange={(e) => setSelectedJob({ ...selectedJob, status: e.target.value })}
                    className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full mb-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    aria-label="Job status"
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
                      className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      aria-label="Save job changes"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setSelectedJob(null)}
                      className="bg-gray-500 dark:bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-600 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                      aria-label="Cancel job edit"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Application Oversight</h2>
            {applications.length === 0 ? (
              <p className="text-gray-800 dark:text-gray-300">No applications found.</p>
            ) : (
              <ul className="space-y-4">
                {applications.map((app) => (
                  <li key={app._id} className="border p-4 rounded shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <p className="text-gray-900 dark:text-gray-100"><strong>Applicant:</strong> {app.applicantId?.email || 'Unknown'}</p>
                    <p className="text-gray-900 dark:text-gray-100"><strong>Job:</strong> {app.jobId?.title || 'Unknown'}</p>
                    <p className="text-gray-900 dark:text-gray-100"><strong>Status:</strong> {app.status || 'Pending'}</p>
                    <p className="text-gray-900 dark:text-gray-100"><strong>Bio:</strong> {app.bio || 'N/A'}</p>
                    <p className="text-gray-900 dark:text-gray-100"><strong>Background:</strong> {app.background || 'N/A'}</p>
                    <p className="text-gray-900 dark:text-gray-100"><strong>Experience:</strong> {app.experience || 'N/A'}</p>
                    <div className="my-2">
                      {app.resume && (
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch(
                                `http://localhost:5000/api/applications/resume/${encodeURIComponent(app.resume)}?view=true`,
                                { headers: { Authorization: `Bearer ${token}` } }
                              );
                              const blob = await res.blob();
                              const url = window.URL.createObjectURL(blob);
                              window.open(url, '_blank');
                              setTimeout(() => window.URL.revokeObjectURL(url), 1000);
                            } catch (err) {
                              toast.error('Failed to view resume');
                            }
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                          aria-label={`View resume for application ${app._id}`}
                        >
                          View Resume
                        </button>
                      )}
                      {!app.resume && <p className="text-red-500 dark:text-red-400">No resume</p>}
                    </div>
                    <div className="my-2">
                      {app.certificate && (
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch(
                                `http://localhost:5000/api/applications/certificate/${encodeURIComponent(app.certificate)}?view=true`,
                                { headers: { Authorization: `Bearer ${token}` } }
                              );
                              const blob = await res.blob();
                              const url = window.URL.createObjectURL(blob);
                              window.open(url, '_blank');
                              setTimeout(() => window.URL.revokeObjectURL(url), 1000);
                            } catch (err) {
                              toast.error('Failed to view certificate');
                            }
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                          aria-label={`View certificate for application ${app._id}`}
                        >
                          View Certificate
                        </button>
                      )}
                      {!app.certificate && <p className="text-red-500 dark:text-red-400">No certificate</p>}
                    </div>
                    <div className="my-2">
                      <label className="block text-sm font-medium text-gray-800 dark:text-gray-300">Comments</label>
                      <textarea
                        value={app.feedback || ''}
                        onChange={(e) => {
                          const updatedApps = applications.map(a =>
                            a._id === app._id ? { ...a, feedback: e.target.value } : a
                          );
                          setApplications(updatedApps);
                        }}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        placeholder="Add comments"
                        aria-label={`Comments for application ${app._id}`}
                      />
                      <button
                        onClick={async () => {
                          try {
                            await fetch(`http://localhost:5000/api/admin/applications/${app._id}/feedback`, {
                              method: 'PUT',
                              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                              body: JSON.stringify({ feedback: app.feedback }),
                            });
                            toast.success('Comments saved');
                          } catch (err) {
                            toast.error('Failed to save comments');
                          }
                        }}
                        className="mt-2 bg-blue-600 dark:bg-blue-700 text-white px-2 py-1 rounded hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        aria-label={`Save comments for application ${app._id}`}
                      >
                        Save Comments
                      </button>
                    </div>
                    <div className="flex space-x-2 mt-2">
                      <select
                        value={app.status || 'Pending'}
                        onChange={(e) => handleUpdateAppStatus(app._id, e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 p-1 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        aria-label={`Update status for application ${app._id}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Interview Scheduled">Interview Scheduled</option>
                      </select>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Reports & Analytics</h2>
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Platform Activity Chart</h3>
              <canvas
                ref={chartRef}
                className="max-w-full bg-white dark:bg-gray-800 rounded-lg shadow"
                aria-label="Platform activity bar chart showing users, jobs, applications, and hires"
                role="img"
              ></canvas>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 mb-8">
              <div className="border p-4 rounded shadow bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300">Total Users</h3>
                <p className="text-2xl text-blue-900 dark:text-blue-300">{reports.totalUsers || 0}</p>
              </div>
              <div className="border p-4 rounded shadow bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 transition-colors border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-green-900 dark:text-green-300">Total Jobs</h3>
                <p className="text-2xl text-green-900 dark:text-green-300">{reports.totalJobs || 0}</p>
              </div>
              <div className="border p-4 rounded shadow bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-300">Total Applications</h3>
                <p className="text-2xl text-yellow-900 dark:text-yellow-300">{reports.totalApplications || 0}</p>
              </div>
              <div className="border p-4 rounded shadow bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 transition-colors border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-red-900 dark:text-red-300">Hires</h3>
                <p className="text-2xl text-red-900 dark:text-red-300">{reports.hires || 0}</p>
              </div>
              <div className="border p-4 rounded shadow bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-purple-900 dark:text-purple-300">Resume Uploads</h3>
                <p className="text-2xl text-purple-900 dark:text-purple-300">{reports.resumeUploads || 0}</p>
              </div>
              <div className="border p-4 rounded shadow bg-indigo-100 dark:bg-indigo-900 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300">Accommodation Requests</h3>
                <p className="text-2xl text-indigo-900 dark:text-indigo-300">{reports.accommodations || 0}</p>
              </div>
              <div className="border p-4 rounded shadow bg-teal-100 dark:bg-teal-900 hover:bg-teal-200 dark:hover:bg-teal-800 transition-colors border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-teal-900 dark:text-teal-300">Jobseekers</h3>
                <p className="text-2xl text-teal-900 dark:text-teal-300">{reports.usersByRole?.jobseeker || 0}</p>
              </div>
              <div className="border p-4 rounded shadow bg-orange-100 dark:bg-orange-900 hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-orange-900 dark:text-orange-300">Employers</h3>
                <p className="text-2xl text-orange-900 dark:text-orange-300">{reports.usersByRole?.employer || 0}</p>
              </div>
              <div className="border p-4 rounded shadow bg-pink-100 dark:bg-pink-900 hover:bg-pink-200 dark:hover:bg-pink-800 transition-colors border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-pink-900 dark:text-pink-300">Active Jobs</h3>
                <p className="text-2xl text-pink-900 dark:text-pink-300">{reports.jobsByStatus?.active || 0}</p>
              </div>
            </div>
            {reports.topEmployers && reports.topEmployers.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Top Employers</h3>
                <ul className="space-y-2">
                  {reports.topEmployers.map((employer, index) => (
                    <li key={index} className="border p-4 rounded shadow bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border-gray-200 dark:border-gray-700">
                      <p className="text-gray-900 dark:text-gray-100"><strong>Company:</strong> {employer.company || 'Unknown'}</p>
                      <p className="text-gray-900 dark:text-gray-100"><strong>Email:</strong> {employer.email}</p>
                      <p className="text-gray-900 dark:text-gray-100"><strong>Jobs Posted:</strong> {employer.jobCount}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'content' && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Content Management</h2>
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">{selectedContent ? 'Edit Content' : 'Add New Content'}</h3>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg border border-gray-200 dark:border-gray-700">
                <input
                  type="text"
                  placeholder="Title"
                  value={contentForm.title}
                  onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                  className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full mb-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  aria-label="Content title"
                />
                <textarea
                  placeholder="Body"
                  value={contentForm.body}
                  onChange={(e) => setContentForm({ ...contentForm, body: e.target.value })}
                  className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full mb-3 h-32 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  aria-label="Content body"
                />
                <select
                  value={contentForm.category}
                  onChange={(e) => setContentForm({ ...contentForm, category: e.target.value })}
                  className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full mb-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  aria-label="Content category"
                >
                  <option value="Homepage">Homepage</option>
                  <option value="FAQ">FAQ</option>
                  <option value="Guidelines">Guidelines</option>
                  <option value="Announcements">Announcements</option>
                  <option value="Guides">Guides</option>
                  <option value="Other">Other</option>
                </select>
                <label className="flex items-center gap-2 mb-3 text-gray-800 dark:text-gray-100">
                  <input
                    type="checkbox"
                    checked={contentForm.isPublished}
                    onChange={(e) => setContentForm({ ...contentForm, isPublished: e.target.checked })}
                    className="h-4 w-4 accent-blue-600 dark:accent-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    aria-label="Publish content"
                  />
                  Publish Content
                </label>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={selectedContent ? handleEditContent : handleCreateContent}
                    className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    aria-label={selectedContent ? 'Save content changes' : 'Create content'}
                  >
                    {selectedContent ? 'Save Changes' : 'Create Content'}
                  </button>
                  <button
                    onClick={() => {
                      setContentForm({ title: '', body: '', category: 'Other', isPublished: false });
                      setSelectedContent(null);
                    }}
                    className="bg-gray-500 dark:bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-600 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                    aria-label="Cancel content edit"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Content List</h3>
            {contentItems.length === 0 ? (
              <p className="text-gray-800 dark:text-gray-300">No content found.</p>
            ) : (
              <ul className="space-y-4">
                {contentItems.map((content) => (
                  <li key={content._id} className="border p-4 rounded shadow bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border-gray-200 dark:border-gray-700">
                    <p className="text-gray-900 dark:text-gray-100"><strong>Title:</strong> {content.title}</p>
                    <p className="text-gray-900 dark:text-gray-100"><strong>Category:</strong> {content.category}</p>
                    <p className="text-gray-900 dark:text-gray-100"><strong>Body:</strong> {content.body.substring(0, 100)}...</p>
                    <p className="text-gray-900 dark:text-gray-100"><strong>Created By:</strong> {content.createdBy?.email || 'Unknown'}</p>
                    <p className="text-gray-900 dark:text-gray-100"><strong>Updated:</strong> {new Date(content.updatedAt).toLocaleString()}</p>
                    <p className="text-gray-900 dark:text-gray-100"><strong>Published:</strong> {content.isPublished ? 'Yes' : 'No'}</p>
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => {
                          setSelectedContent(content);
                          setContentForm({
                            title: content.title,
                            body: content.body,
                            category: content.category,
                            isPublished: content.isPublished,
                          });
                        }}
                        className="bg-blue-600 dark:bg-blue-700 text-white px-2 py-1 rounded hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        aria-label={`Edit content ${content.title}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handlePublishContent(content._id, content.isPublished)}
                        className={`px-2 py-1 rounded text-white ${
                          content.isPublished
                            ? 'bg-yellow-600 dark:bg-yellow-700 hover:bg-yellow-700 dark:hover:bg-yellow-600'
                            : 'bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600'
                        } focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400`}
                        aria-label={content.isPublished ? `Unpublish content ${content.title}` : `Publish content ${content.title}`}
                      >
                        {content.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => handleDeleteContent(content._id)}
                        className="bg-red-600 dark:bg-red-700 text-white px-2 py-1 rounded hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                        aria-label={`Delete content ${content.title}`}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
