
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    background: "",
    experience: "",
    coverLetter: "",
    resume: null,
    certificate: null,
    accommodation: "",
  });

  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      const validTypes = [".pdf", ".doc", ".docx"];
      const ext = `.${file.name.split(".").pop().toLowerCase()}`;
      if (!validTypes.includes(ext)) {
        toast.error("Please upload a PDF, DOC, or DOCX file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be under 5MB.");
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please log in to apply.");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    data.append("jobId", jobId);
    for (let key in formData) {
      if (formData[key]) {
        data.append(key, formData[key]);
      }
    }

    try {
      await axios.post(`http://localhost:5000/api/applications`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Application submitted!");
      setApplyOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        bio: "",
        background: "",
        experience: "",
        coverLetter: "",
        resume: null,
        certificate: null,
        accommodation: "",
      });
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Submission failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveJob = async () => {
    if (!token) {
      toast.error("Please log in to save a job.");
      navigate("/login");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:5000/api/jobs/${jobId}/save`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsSaved(!isSaved);
      let savedJobs = JSON.parse(localStorage.getItem("savedJobs") || "[]");
      if (isSaved) {
        savedJobs = savedJobs.filter((id) => id !== jobId);
      } else {
        savedJobs.push(jobId);
      }
      localStorage.setItem("savedJobs", JSON.stringify(savedJobs));
      toast.success(res.data.message);
    } catch (err) {
      console.error("Save job error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to save job.");
    }
  };

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/jobs/${jobId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const jobData = res.data;
        setJob(jobData);
        const savedJobs = JSON.parse(localStorage.getItem("savedJobs") || "[]");
        setIsSaved(savedJobs.includes(jobId));
      } catch (err) {
        console.error("Fetch error:", err.response?.data || err.message);
        setError("Failed to load job details. " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId, token]);

  if (loading) return <div className="text-center p-6 text-gray-600 dark:text-gray-400">Loading...</div>;
  if (error) return <div className="text-center text-red-600 dark:text-red-400 p-6">{error}</div>;
  if (!job) return <div className="text-center text-red-600 dark:text-red-400 p-6">Job not found</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white dark:bg-gray-800 min-h-screen text-gray-900 dark:text-gray-100">
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <Link
          to="/dashboard/jobseeker"
          className="text-blue-600 dark:text-blue-400 underline text-sm hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
          aria-label="Back to Job Seeker Dashboard"
        >
          ← Back to Dashboard
        </Link>
        <Link
          to="/browse-jobs"
          className="text-blue-600 dark:text-blue-400 underline text-sm hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
          aria-label="Back to Job Listings"
        >
          ← Back to Job Listings
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">{job.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">{job.location} • {job.salary}</p>
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
            {job.type}
          </span>
          {job.disabilityFriendly && (
            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm">
              Disability-Friendly
            </span>
          )}
        </div>
      </div>

      <section className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Job Description</h2>
        <p className="text-gray-700 dark:text-gray-300">{job.description}</p>
      </section>

      {job.requirements && Array.isArray(job.requirements) && job.requirements.length > 0 && (
        <section className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-1">Requirements</h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
            {job.requirements.map((req, idx) => (
              <li key={idx}>{req}</li>
            ))}
          </ul>
        </section>
      )}

      {job.accommodations && Array.isArray(job.accommodations) && job.accommodations.length > 0 && (
        <section className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Workplace Accommodations</h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
            {job.accommodations.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {job.company && (
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            About {job.companyName || job.company}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{job.aboutCompany}</p>
          <Link to={`/companies/${job.company.toLowerCase().replace(/\s+/g, "-")}`}>
            <button
              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              aria-label={`View profile for ${job.companyName || job.company}`}
            >
              View Company Profile
            </button>
          </Link>
        </div>
      )}

      <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setApplyOpen(true)}
            className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
            aria-label="Apply for this job"
          >
            Apply Now
          </button>
          <button
            onClick={handleSaveJob}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 ${
              isSaved
                ? "bg-gray-400 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                : "bg-yellow-600 dark:bg-yellow-700 text-white hover:bg-yellow-700 dark:hover:bg-yellow-600"
            }`}
            disabled={isSaved}
            aria-label={isSaved ? "Job saved" : "Save this job"}
          >
            {isSaved ? "Saved" : "Save Job"}
          </button>
        </div>
      </div>

      {applyOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh] transform transition-all duration-300 ease-in-out scale-100 hover:scale-105">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
              Apply for {job.title}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Full Name"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    onChange={handleChange}
                    required
                    aria-label="Full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Email"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    onChange={handleChange}
                    required
                    aria-label="Email address"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Phone (optional)"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    onChange={handleChange}
                    aria-label="Phone number (optional)"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    placeholder="Bio (short introduction)"
                    rows={2}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    onChange={handleChange}
                    aria-label="Short introduction or bio"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="background" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Background
                  </label>
                  <textarea
                    id="background"
                    name="background"
                    placeholder="Background (education, etc.)"
                    rows={2}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    onChange={handleChange}
                    aria-label="Educational background"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Experience
                  </label>
                  <textarea
                    id="experience"
                    name="experience"
                    placeholder="Experience (previous roles)"
                    rows={2}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    onChange={handleChange}
                    aria-label="Previous work experience"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cover Letter
                  </label>
                  <textarea
                    id="coverLetter"
                    name="coverLetter"
                    placeholder="Cover Letter"
                    rows={4}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    onChange={handleChange}
                    aria-label="Cover letter"
                  />
                </div>
                {job.disabilityFriendly && (
                  <div className="col-span-1 md:col-span-2">
                    <label htmlFor="accommodation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Accommodation Needed
                    </label>
                    <textarea
                      id="accommodation"
                      name="accommodation"
                      placeholder="Any accommodation needed?"
                      rows={2}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                      onChange={handleChange}
                      aria-label="Accommodation requirements"
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="resume" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Upload Resume
                  </label>
                  <input
                    type="file"
                    id="resume"
                    name="resume"
                    accept=".pdf,.doc,.docx"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    onChange={handleFileChange}
                    required
                    aria-label="Upload resume (PDF, DOC, or DOCX)"
                  />
                </div>
                <div>
                  <label htmlFor="certificate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Upload Certificate
                  </label>
                  <input
                    type="file"
                    id="certificate"
                    name="certificate"
                    accept=".pdf,.doc,.docx"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    onChange={handleFileChange}
                    required
                    aria-label="Upload certificate (PDF, DOC, or DOCX)"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setApplyOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200 font-medium"
                  aria-label="Cancel application"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200 font-medium disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                  aria-label={isSubmitting ? "Submitting application" : "Submit application"}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
