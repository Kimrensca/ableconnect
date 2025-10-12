import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function ApplicationDetails() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/applications/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplication(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load application details.");
        toast.error(err.response?.data?.message || "Error loading application.");
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchApplication();
    } else {
      setError("Please log in to view application details.");
      setLoading(false);
    }
  }, [id, token]);

  if (loading) return <div className="text-center p-6 text-gray-600">Loading...</div>;
  if (error) return <div className="text-center text-red-600 p-6">{error}</div>;
  if (!application) return <div className="text-center text-red-600 p-6">Application not found</div>;

  const handleViewResume = async () => {
    if (!application.resume) {
      toast.error("No resume attached.");
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:5000/api/applications/resume/${encodeURIComponent(application.resume)}?view=true`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] }));
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 1000); // Clean up after a short delay
    } catch (err) {
      console.error("Error fetching resume:", err);
      toast.error(err.response?.data?.message || "Failed to load resume.");
    }
  };

  const handleViewCertificate = async () => {
    if (!application.certificate) {
      toast.error("No certificate attached.");
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:5000/api/applications/certificate/${encodeURIComponent(application.certificate)}?view=true`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] }));
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 1000); // Clean up after a short delay
    } catch (err) {
      console.error("Error fetching certificate:", err);
      toast.error(err.response?.data?.message || "Failed to load certificate.");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white min-h-screen">
      <div className="mb-6">
        <Link
          to="/dashboard/jobseeker"
          className="text-blue-600 underline text-sm hover:text-blue-800 transition-colors duration-200"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg shadow-md overflow-y-auto max-h-[90vh]">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Application Details</h1>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Job: {application.jobId?.title || "Job Deleted"}</h2>
        <p className="text-gray-600 mb-2">Status: <span className="font-medium text-gray-800">{application.status || "Pending"}</span></p>
        <p className="text-gray-600 mb-2">Applied on: {new Date(application.createdAt).toLocaleDateString()}</p>
        <p className="text-gray-600 mb-2">Name: {application.name}</p>
        <p className="text-gray-600 mb-2">Email: {application.email}</p>
        <p className="text-gray-600 mb-2">Phone: {application.phone || "N/A"}</p>
        {application.coverLetter && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Cover Letter</h3>
            <p className="text-gray-700 bg-white p-4 rounded-lg">{application.coverLetter}</p>
          </div>
        )}
        {application.accommodation && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Accommodation Requested</h3>
            <p className="text-gray-700 bg-white p-4 rounded-lg">{application.accommodation}</p>
          </div>
        )}
        {application.resume && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Resume</h3>
            <button
              onClick={handleViewResume}
              className="text-blue-600 underline hover:text-blue-800 transition-colors duration-200"
            >
              View Resume
            </button>
          </div>
        )}
        {!application.resume && (
          <p className="text-gray-600 mt-6">No resume attached.</p>
        )}
        {application.certificate && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Certificate</h3>
            <button
              onClick={handleViewCertificate}
              className="text-blue-600 underline hover:text-blue-800 transition-colors duration-200"
            >
              View Certificate
            </button>
          </div>
        )}
        {!application.certificate && (
          <p className="text-gray-600 mt-6">No certificate attached.</p>
        )}
      </div>
    </div>
  );
}