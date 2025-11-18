
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiFetch from '../../utils/api';

const JobSeekerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      if (!token) {
        setError('Please log in to view your applications');
        setLoading(false);
        return;
      }
      try {
        const data = await apiFetch('/applications/jobseeker');
        setApplications(data);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  
  // Download Resume Handler
  const handleDownloadResume = async (filename) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to download resume');
      return;
    }
    if (!filename) {
      toast.error('No resume available');
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:5000/api/applications/resume/${encodeURIComponent(filename)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error('Failed to fetch resume');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download resume');
    }
  };

  // Download Certificate Handler
  const handleDownloadCertificate = async (certificateName) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to download certificate');
      return;
    }
    if (!certificateName) {
      toast.error('No certificate available');
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:5000/api/applications/certificate/${encodeURIComponent(certificateName)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error('Failed to fetch certificate');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = certificateName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download certificate');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Job Applications</h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 dark:bg-red-600 text-white px-4 py-2 rounded hover:bg-red-600 dark:hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
          aria-label="Logout"
        >
          Logout
        </button>
      </div>

      {/* Navigation Link */}
      <Link
        to="/dashboard/jobseeker"
        className="text-blue-600 dark:text-blue-400 hover:underline mb-6 inline-block"
        aria-label="Back to Job Seeker Dashboard"
      >
        ← Back to Dashboard
      </Link>

      {/* State Handling */}
      {loading ? (
        <p className="text-gray-600 dark:text-gray-400">Loading applications...</p>
      ) : error ? (
        <p className="text-red-600 dark:text-red-400">{error}</p>
      ) : applications.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">You haven't applied to any jobs yet.</p>
      ) : (
        <ul className="space-y-6">
          {applications.map((app) => (
            <li
              key={app._id}
              className="border p-5 rounded-lg shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {app.jobId?.title || 'Job Deleted'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                {app.jobId?.location || 'N/A'} — {app.jobId?.salary || 'N/A'}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                {app.jobId?.description || 'No description'}
              </p>

              {app.bio && (
                <div className="mb-2">
                  <p className="text-sm text-gray-800 dark:text-gray-100">
                    <strong>Bio:</strong> {app.bio}
                  </p>
                </div>
              )}

              <div className="mb-2">
                <p className="text-sm text-gray-800 dark:text-gray-100">
                  <strong>Background:</strong>
                </p>
                {Array.isArray(app.background) && app.background.length > 0 ? (
                  <ul className="list-disc pl-5 mt-1 text-sm text-gray-800 dark:text-gray-100">
                    {app.background.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-800 dark:text-gray-100">{app.background || 'N/A'}</p>
                )}
              </div>

              <div className="mb-2">
                <p className="text-sm text-gray-800 dark:text-gray-100">
                  <strong>Experience:</strong>
                </p>
                {Array.isArray(app.experience) && app.experience.length > 0 ? (
                  <ul className="list-disc pl-5 mt-1 text-sm text-gray-800 dark:text-gray-100">
                    {app.experience.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-800 dark:text-gray-100">{app.experience || 'N/A'}</p>
                )}
              </div>

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


              {app.coverLetter && (
                <div className="mb-2">
                  <p className="text-sm text-gray-800 dark:text-gray-100">
                    <strong>Cover Letter:</strong> {app.coverLetter}
                  </p>
                </div>
              )}

              {app.accommodation && (
                <div className="mb-2">
                  <p className="text-sm text-gray-800 dark:text-gray-100">
                    <strong>Accommodation Request:</strong> {app.accommodation}
                  </p>
                </div>
              )}

              <p className="text-sm text-gray-500 dark:text-gray-400">
                <strong>Applied on:</strong>{' '}
                {new Date(app.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>

              <p className="mt-1 text-sm">
                <strong>Status:</strong>{' '}
                <span
                  className={
                    app.status === 'Accepted'
                      ? 'text-green-600 dark:text-green-400'
                      : app.status === 'Rejected'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-yellow-600 dark:text-yellow-400'
                  }
                >
                  {app.status || 'Pending'}
                </span>
              </p>

              {/* Resume Download */}
              {app.resume && (
                <div className="mt-2">
                  <button
                    onClick={() => handleDownloadResume(app.resume)}
                    className="text-blue-600 dark:text-blue-400 underline text-sm hover:text-blue-800 dark:hover:text-blue-300"
                    aria-label="Download Resume"
                  >
                    Download Resume
                  </button>
                </div>
              )}

              {/* Certificate Download */}
              {app.certificate && (
                <div className="mt-2">
                  <button
                    onClick={() => handleDownloadCertificate(app.certificate)}
                    className="text-blue-600 dark:text-blue-400 underline text-sm hover:text-blue-800 dark:hover:text-blue-300"
                    aria-label="Download Certificate"
                  >
                    Download Certificate
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JobSeekerApplications;
