
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

function JobSeekerDashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    phone: "",
    location: "",
  });
  const [preferencesForm, setPreferencesForm] = useState({
    jobTypes: [],
    preferredLocation: "",
    desiredSalary: "",
  });
  const [accommodationForm, setAccommodationForm] = useState({
    accommodationPreferences: "",
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeURL, setResumeURL] = useState(null);
  const [activeTab, setActiveTab] = useState("applications");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/jobs");
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const data = await res.json();
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs. Please try again later.");
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/api/applications/jobseeker", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch applications");
      const data = await res.json();
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications.");
    }
  }, [token]);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/api/applications/jobseeker/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfile(data || {});
      setFormData({
        username: data.username || "",
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        location: data.location || "",
      });
      setPreferencesForm({
        jobTypes: data.jobTypes || [],
        preferredLocation: data.preferredLocation || "",
        desiredSalary: data.desiredSalary || "",
      });
      setAccommodationForm({
        accommodationPreferences: data.accommodationPreferences || "",
      });
      setSavedJobs(data.savedJobs || []);
      if (data.username) localStorage.setItem("username", data.username);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile.");
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchJobs();
    fetchApplications();
    fetchProfile();
    const interval = setInterval(() => {
      fetchJobs();
      fetchApplications();
      fetchProfile();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchJobs, fetchApplications, fetchProfile, token]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      navigate("/login");
    }
  };

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async () => {
    if (!token) return;
    if (!formData.username.trim()) {
      toast.error("Username is required.");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append("username", formData.username.trim());
    formDataToSend.append("name", formData.name.trim());
    formDataToSend.append("email", formData.email.trim());
    formDataToSend.append("phone", formData.phone.trim());
    formDataToSend.append("location", formData.location.trim());
    if (resumeFile && resumeFile instanceof File) formDataToSend.append("resume", resumeFile);

    try {
      const res = await fetch("http://localhost:5000/api/applications/jobseeker/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update profile");
      }
      const data = await res.json();
      setProfile(data);
      setFormData({
        username: data.username || "",
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        location: data.location || "",
      });
      setResumeFile(data.resume?.filename ? { name: data.resume.filename } : null);
      setResumeURL(null);
      setEditingSection(null);
      localStorage.setItem("username", data.username || "");
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile.");
    }
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      const fileUrl = URL.createObjectURL(file);
      setResumeURL(fileUrl);
    }
  };

  const handlePreferencesChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === "jobTypes" && checked) {
      setPreferencesForm((prev) => ({
        ...prev,
        jobTypes: [...prev.jobTypes, value],
      }));
    } else if (name === "jobTypes") {
      setPreferencesForm((prev) => ({
        ...prev,
        jobTypes: prev.jobTypes.filter((type) => type !== value),
      }));
    } else {
      setPreferencesForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePreferencesSave = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/api/applications/jobseeker/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preferencesForm),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setProfile((prev) => ({ ...prev, ...data }));
      setEditingSection(null);
      toast.success("Preferences updated successfully!");
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error(`Failed to update preferences: ${error.message}`);
    }
  };

  const handleAccommodationChange = (e) => {
    setAccommodationForm({ ...accommodationForm, [e.target.name]: e.target.value });
  };

  const handleAccommodationSave = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/api/applications/jobseeker/accommodation", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(accommodationForm),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setProfile((prev) => ({ ...prev, ...data }));
      setAccommodationForm({ accommodationPreferences: data.accommodationPreferences });
      setEditingSection(null);
      toast.success("Accommodation preferences updated successfully!");
    } catch (error) {
      console.error("Error updating accommodation preferences:", error);
      toast.error(`Failed to update accommodation preferences: ${error.message}`);
    }
  };

  const handleDeleteApplication = async (applicationId) => {
    if (!token) {
      toast.error("Please log in to remove an application.");
      return;
    }
    if (!window.confirm("Are you sure you want to remove this application?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/applications/${applicationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete application");
      }
      setApplications((prev) => prev.filter((app) => app._id !== applicationId));
      toast.success("Application removed successfully!");
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error(error.message || "Failed to remove application.");
    }
  };

  const handleViewFile = async (type, filename) => {
    if (!token || !filename) {
      toast.error("Authentication token or file missing");
      return;
    }
    try {
      const url = `http://localhost:5000/api/applications/${type}/${filename}?view=true`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch file");
      }
      const blob = await response.blob();
      const fileExt = filename.split('.').pop().toLowerCase();
      const mimeTypes = {
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };
      const mimeType = mimeTypes[fileExt] || 'application/octet-stream';
      const fileURL = window.URL.createObjectURL(new Blob([blob], { type: mimeType }));
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(fileURL);
    } catch (err) {
      console.error(`Error viewing ${type}:`, err);
      toast.error(err.message || `Failed to view ${type}`);
    }
  };

  const profileCompleteness = () => {
    if (!profile) return 0;
    let filled = 0;
    const fields = ["username", "name", "email", "phone", "location"];
    fields.forEach((f) => {
      if (profile[f]) filled++;
    });
    return Math.round((filled / fields.length) * 100);
  };

  const handleRemoveJob = async (jobId) => {
    if (!token) {
      toast.error("Please log in to remove a job.");
      navigate("/login");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${jobId}/save`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to remove job");
      const data = await res.json();
      setSavedJobs((prev) => prev.filter((id) => id !== jobId));
      let savedJobs = JSON.parse(localStorage.getItem("savedJobs") || "[]");
      savedJobs = savedJobs.filter((id) => id !== jobId);
      localStorage.setItem("savedJobs", JSON.stringify(savedJobs));
      toast.success(data.message);
    } catch (err) {
      console.error("Error removing job:", err);
      toast.error("Failed to remove job.");
    }
  };

  const handleApplyJob = async (jobId) => {
    if (!token) {
      toast.error("Please log in to apply.");
      navigate("/login");
      return;
    }
    navigate(`/job/${jobId}`);
    toast.success("Please fill out the application form on the job page.");
  };

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
          <Link to="/my-applications" className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-lg" aria-label="My Applications">
            My Applications
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
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Welcome, {profile?.username || "Job Seeker"} 👋</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Track applications, manage saved jobs, and update your profile here.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="p-6 bg-gradient-to-br from-blue-100 to-white dark:from-blue-900 dark:to-gray-800 rounded-lg shadow-lg text-center">
            <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Saved Jobs</h2>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{savedJobs.length}</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-green-100 to-white dark:from-green-900 dark:to-gray-800 rounded-lg shadow-lg text-center">
            <h2 className="text-lg font-semibold text-green-800 dark:text-green-200">Applications</h2>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{applications.length}</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-gray-100 to-white dark:from-gray-700 dark:to-gray-800 rounded-lg shadow-lg text-center">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Profile Complete</h2>
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{profileCompleteness()}%</p>
          </div>
        </div>

        <Link
          to="/browse-jobs"
          className="bg-red-500 dark:bg-red-600 text-white px-4 py-2 rounded hover:bg-red-600 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 mb-12 inline-block"
          aria-label="Browse Jobs"
        >
          Browse Jobs
        </Link>

        <div className="mb-8">
          <div className="flex space-x-4 border-b pb-2 mb-4 border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setActiveTab("applications");
                fetchApplications();
              }}
              className={`px-4 py-2 rounded-t ${
                activeTab === "applications"
                  ? "bg-blue-600 text-white"
                  : "text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
              aria-label="View Applications"
            >
              Applications
            </button>
            <button
              onClick={() => {
                setActiveTab("savedJobs");
                fetchJobs();
              }}
              className={`px-4 py-2 rounded-t ${
                activeTab === "savedJobs"
                  ? "bg-blue-600 text-white"
                  : "text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
              aria-label="View Saved Jobs"
            >
              Saved Jobs
            </button>
            <button
              onClick={() => {
                setActiveTab("profile");
                fetchProfile();
              }}
              className={`px-4 py-2 rounded-t ${
                activeTab === "profile"
                  ? "bg-blue-600 text-white"
                  : "text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
              aria-label="View Profile"
            >
              Profile
            </button>
          </div>
        </div>

        <div>
          {activeTab === "applications" && (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-10 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">My Applications</h2>
              {applications.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-lg">You haven't applied for any jobs yet.</p>
              ) : (
                <ul className="space-y-4">
                  {applications.map((app) => (
                    <li
                      key={app._id}
                      className="p-5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center"
                      role="article"
                      aria-label={`Application for ${app.jobId?.title || "Job Deleted"}`}
                    >
                      <div>
                        <p className="font-semibold text-lg text-gray-800 dark:text-gray-100">
                          Job: {app.jobId?.title || "Job Deleted"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Company: {app.jobId?.company || app.jobId?.companyName || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Location: {app.jobId?.location || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Date Applied: {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Status:{" "}
                          <span
                            className={`font-medium px-2 py-1 rounded text-xs ${
                              !app.jobId
                                ? "bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100"
                                : app.status === "Pending"
                                ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                                : app.status === "Accepted"
                                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                : app.status === "Rejected"
                                ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                                : app.status === "Interview Scheduled"
                                ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                                : "bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-100"
                            }`}
                          >
                            {!app.jobId ? "Job Deleted" : app.status || "Pending"}
                          </span>
                        </p>
                        <div className="mt-2">
                          <p className="text-sm text-gray-800 dark:text-gray-100"><strong>Background:</strong></p>
                          {Array.isArray(app.background) && app.background.length > 0 ? (
                            <ul className="list-disc pl-5 mt-1 text-sm text-gray-800 dark:text-gray-100">
                              {app.background.map((item, index) => (
                                <li key={index}>{item}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-800 dark:text-gray-100">{app.background || "N/A"}</p>
                          )}
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-800 dark:text-gray-100"><strong>Experience:</strong></p>
                          {Array.isArray(app.experience) && app.experience.length > 0 ? (
                            <ul className="list-disc pl-5 mt-1 text-sm text-gray-800 dark:text-gray-100">
                              {app.experience.map((item, index) => (
                                <li key={index}>{item}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-800 dark:text-gray-100">{app.experience || "N/A"}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 sm:mt-0">
                        <button
                          onClick={() => {
                            setSelectedApplication(app);
                            setViewModalOpen(true);
                          }}
                          className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                          aria-label={`View application for ${app.jobId?.title || "Job Deleted"}`}
                        >
                          View
                        </button>
                        {!app.jobId && (
                          <button
                            onClick={() => handleDeleteApplication(app._id)}
                            className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 text-sm"
                            aria-label={`Remove application for deleted job`}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {viewModalOpen && selectedApplication && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 dark:bg-opacity-70 flex justify-center items-center">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Application Details</h3>
                <p><strong className="text-gray-800 dark:text-gray-100">Job Title:</strong> {selectedApplication.jobId?.title || "Job Deleted"}</p>
                <p><strong className="text-gray-800 dark:text-gray-100">Company:</strong> {selectedApplication.jobId?.company || selectedApplication.jobId?.companyName || "N/A"}</p>
                <p><strong className="text-gray-800 dark:text-gray-100">Name:</strong> {selectedApplication.name || "N/A"}</p>
                <p><strong className="text-gray-800 dark:text-gray-100">Email:</strong> {selectedApplication.email || "N/A"}</p>
                <p><strong className="text-gray-800 dark:text-gray-100">Phone:</strong> {selectedApplication.phone || "N/A"}</p>
                <p><strong className="text-gray-800 dark:text-gray-100">Bio:</strong> {selectedApplication.bio || "N/A"}</p>
                <p><strong className="text-gray-800 dark:text-gray-100">Background:</strong></p>
                {Array.isArray(selectedApplication.background) && selectedApplication.background.length > 0 ? (
                  <ul className="list-disc pl-5 mb-4 text-gray-800 dark:text-gray-100">
                    {selectedApplication.background.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mb-4 text-gray-800 dark:text-gray-100">{selectedApplication.background || "N/A"}</p>
                )}
                <p><strong className="text-gray-800 dark:text-gray-100">Experience:</strong></p>
                {Array.isArray(selectedApplication.experience) && selectedApplication.experience.length > 0 ? (
                  <ul className="list-disc pl-5 mb-4 text-gray-800 dark:text-gray-100">
                    {selectedApplication.experience.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mb-4 text-gray-800 dark:text-gray-100">{selectedApplication.experience || "N/A"}</p>
                )}
                <p><strong className="text-gray-800 dark:text-gray-100">Cover Letter:</strong> {selectedApplication.coverLetter || "N/A"}</p>
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
                  <p><strong className="text-gray-800 dark:text-gray-100">Resume:</strong></p>
                  {selectedApplication.resume ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewFile("resume", selectedApplication.resume)}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                        aria-label="View resume"
                      >
                        View Resume
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">No resume uploaded</p>
                  )}
                </div>
                <div className="mt-4">
                  <p><strong className="text-gray-800 dark:text-gray-100">Certificate:</strong></p>
                  {selectedApplication.certificate ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewFile("certificate", selectedApplication.certificate)}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                        aria-label="View certificate"
                      >
                        View Certificate
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">No certificate uploaded</p>
                  )}
                </div>
                <div className="mt-4">
                  <p><strong className="text-gray-800 dark:text-gray-100">Status:</strong> {!selectedApplication.jobId ? "Job Deleted" : selectedApplication.status || "Pending"}</p>
                  {selectedApplication.feedback && (
                    <p><strong className="text-gray-800 dark:text-gray-100">Feedback:</strong> {selectedApplication.feedback}</p>
                  )}
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  {!selectedApplication.jobId && (
                    <button
                      onClick={() => handleDeleteApplication(selectedApplication._id)}
                      className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 text-sm"
                      aria-label="Remove application for deleted job"
                    >
                      Remove Application
                    </button>
                  )}
                  <button
                    onClick={() => setViewModalOpen(false)}
                    className="px-4 py-2 bg-gray-400 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-500 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 text-sm"
                    aria-label="Close application details"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "savedJobs" && (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-10 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Saved Jobs</h2>
              {savedJobs.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-lg">You haven't saved any jobs yet.</p>
              ) : (
                <ul className="space-y-4">
                  {savedJobs.map((jobId) => {
                    const fullJob = jobs.find((j) => j._id === jobId);
                    if (!fullJob) return null;
                    return (
                      <li
                        key={jobId}
                        className="p-5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center"
                        role="article"
                        aria-label={`Saved job ${fullJob.title}`}
                      >
                        <div>
                          <p className="font-semibold text-lg text-gray-800 dark:text-gray-100">{fullJob.title || "Untitled Job"}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{fullJob.company || "N/A"} • {fullJob.location || "N/A"}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Saved on: {new Date(fullJob.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-3 sm:mt-0">
                          <button
                            onClick={() => handleRemoveJob(jobId)}
                            className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 text-sm"
                            aria-label={`Remove saved job ${fullJob.title}`}
                          >
                            Remove
                          </button>
                          <button
                            onClick={() => handleApplyJob(jobId)}
                            className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 text-sm"
                            aria-label={`Apply for ${fullJob.title}`}
                          >
                            Apply
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow mb-10 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Profile</h2>

              <section className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Personal Information</h3>
                {editingSection === "personal" ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-300" htmlFor="username">
                        Username <span className="text-red-500 dark:text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleProfileChange}
                        placeholder="Username"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        aria-label="Username"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-300" htmlFor="name">
                        Full Name <span className="text-red-500 dark:text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleProfileChange}
                        placeholder="Full Name"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        aria-label="Full Name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-300" htmlFor="email">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleProfileChange}
                        placeholder="Email"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        aria-label="Email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-300" htmlFor="phone">
                        Phone
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleProfileChange}
                        placeholder="Phone"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        aria-label="Phone"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-300" htmlFor="location">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleProfileChange}
                        placeholder="Location"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        aria-label="Location"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleProfileSave}
                        className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        aria-label="Save Personal Information"
                      >
                        Save Personal Info
                      </button>
                      <button
                        onClick={() => {
                          setEditingSection(null);
                          setFormData({
                            username: profile?.username || "",
                            name: profile?.name || "",
                            email: profile?.email || "",
                            phone: profile?.phone || "",
                            location: profile?.location || "",
                          });
                        }}
                        className="px-4 py-2 bg-gray-400 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-500 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                        aria-label="Cancel Editing Personal Information"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p><strong className="text-gray-800 dark:text-gray-100">Username:</strong> {profile?.username || "Not set"}</p>
                    <p><strong className="text-gray-800 dark:text-gray-100">Name:</strong> {profile?.name || "Not set"}</p>
                    <p><strong className="text-gray-800 dark:text-gray-100">Email:</strong> {profile?.email || "Not set"}</p>
                    <p><strong className="text-gray-800 dark:text-gray-100">Phone:</strong> {profile?.phone || "Not set"}</p>
                    <p><strong className="text-gray-800 dark:text-gray-100">Location:</strong> {profile?.location || "Not set"}</p>
                    <button
                      onClick={() => setEditingSection("personal")}
                      className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      aria-label="Edit Personal Information"
                    >
                      Edit Personal Info
                    </button>
                  </div>
                )}
              </section>

              <section className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Resume</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Your current resume: {profile?.resume?.filename || "Not uploaded"}
                  </p>
                </div>
                {editingSection === "resume" && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeUpload}
                        className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 dark:file:bg-blue-700 file:text-white file:hover:bg-blue-700 dark:file:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        aria-label="Upload Resume"
                      />
                      {resumeFile && (
                        <div className="text-green-600 dark:text-green-400 text-sm">
                          ✅ {resumeFile.name} selected
                          {resumeURL && (
                            <a
                              href={resumeURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-blue-600 dark:text-blue-400 underline"
                              aria-label="Preview Resume"
                            >
                              Preview
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleProfileSave}
                        className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        aria-label="Upload Resume"
                      >
                        Upload Resume
                      </button>
                      <button
                        onClick={() => {
                          setEditingSection(null);
                          setResumeFile(null);
                          setResumeURL(null);
                        }}
                        className="px-4 py-2 bg-gray-400 dark:bg-gray-600 text-white rounded hover:bg-gray-500 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                        aria-label="Cancel Resume Upload"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {!editingSection && (
                  <button
                    onClick={() => setEditingSection("resume")}
                    className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    aria-label="Update Resume"
                  >
                    Update Resume
                  </button>
                )}
              </section>

              <section className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Preferences</h3>
                {editingSection === "preferences" ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-300">Job Types</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Full-time", "Part-time", "Contract", "Internship"].map((type) => (
                          <label key={type} className="flex items-center text-gray-800 dark:text-gray-100">
                            <input
                              type="checkbox"
                              value={type}
                              checked={preferencesForm.jobTypes.includes(type)}
                              onChange={handlePreferencesChange}
                              name="jobTypes"
                              className="mr-2 accent-blue-600 dark:accent-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                              aria-label={`Select ${type} job type`}
                            />
                            {type}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-300" htmlFor="preferredLocation">
                        Preferred Location
                      </label>
                      <input
                        type="text"
                        name="preferredLocation"
                        value={preferencesForm.preferredLocation}
                        onChange={handlePreferencesChange}
                        placeholder="e.g., Nairobi, Kenya"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        aria-label="Preferred Location"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-300" htmlFor="desiredSalary">
                        Desired Salary
                      </label>
                      <input
                        type="text"
                        name="desiredSalary"
                        value={preferencesForm.desiredSalary}
                        onChange={handlePreferencesChange}
                        placeholder="e.g., $50,000 - $70,000"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        aria-label="Desired Salary"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handlePreferencesSave}
                        className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        aria-label="Save Preferences"
                      >
                        Save Preferences
                      </button>
                      <button
                        onClick={() => setEditingSection(null)}
                        className="px-4 py-2 bg-gray-400 dark:bg-gray-600 text-white rounded hover:bg-gray-500 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                        aria-label="Cancel Editing Preferences"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p>
                      <strong className="text-gray-800 dark:text-gray-100">Job Types:</strong>{" "}
                      {preferencesForm.jobTypes.length > 0 ? preferencesForm.jobTypes.join(", ") : "Not set"}
                    </p>
                    <p>
                      <strong className="text-gray-800 dark:text-gray-100">Preferred Location:</strong>{" "}
                      {preferencesForm.preferredLocation || "Not set"}
                    </p>
                    <p>
                      <strong className="text-gray-800 dark:text-gray-100">Desired Salary:</strong>{" "}
                      {preferencesForm.desiredSalary || "Not set"}
                    </p>
                    <button
                      onClick={() => setEditingSection("preferences")}
                      className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      aria-label="Edit Preferences"
                    >
                      Edit Preferences
                    </button>
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Accommodation Preferences</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">Let employers know about accommodations you may need</p>
                {editingSection === "accommodation" ? (
                  <div className="space-y-4">
                    <textarea
                      name="accommodationPreferences"
                      value={accommodationForm.accommodationPreferences}
                      onChange={handleAccommodationChange}
                      placeholder="e.g., Remote work, Assistive technology, Flexible hours..."
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      rows={4}
                      aria-label="Accommodation Preferences"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleAccommodationSave}
                        className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        aria-label="Save Accommodation Preferences"
                      >
                        Save Accommodation Preferences
                      </button>
                      <button
                        onClick={() => setEditingSection(null)}
                        className="px-4 py-2 bg-gray-400 dark:bg-gray-600 text-white rounded hover:bg-gray-500 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                        aria-label="Cancel Editing Accommodation Preferences"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-800 dark:text-gray-100">{accommodationForm.accommodationPreferences || "Not set"}</p>
                    <button
                      onClick={() => setEditingSection("accommodation")}
                      className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      aria-label="Edit Accommodation Preferences"
                    >
                      Edit Accommodation Preferences
                    </button>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobSeekerDashboard;
