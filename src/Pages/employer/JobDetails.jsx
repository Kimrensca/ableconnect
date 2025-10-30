import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);

  // ✅ Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/jobs/${jobId}`);
        if (!res.data) throw new Error("Job not found");
        setJob(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  // ✅ Handle job application
  const handleApply = async () => {
    try {
      setApplying(true);
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("Please log in to apply for this job.");
        navigate("/login");
        return;
      }

      const res = await axios.post("http://localhost:5000/api/applications", {
        jobId: job?._id,
        userId,
      });

      if (res.status === 201) {
        toast.success("Application submitted successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error submitting application.");
    } finally {
      setApplying(false);
    }
  };

  // ✅ Early returns for clear rendering states
  if (loading)
    return (
      <div className="text-center p-6 text-gray-600 dark:text-gray-400">
        Loading job details...
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-600 dark:text-red-400 p-6">
        {error}
      </div>
    );

  if (!job)
    return (
      <div className="text-center text-red-600 dark:text-red-400 p-6">
        Job not found.
      </div>
    );

  // ✅ Job Details Render
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link
        to="/jobs"
        className="inline-block mb-4 text-blue-600 hover:underline dark:text-blue-400"
      >
        ← Back to Job Listings
      </Link>

      <div className="bg-white dark:bg-gray-800 shadow rounded-2xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {job?.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          <strong>Company:</strong> {job?.company}
        </p>

        <p className="text-gray-600 dark:text-gray-300">
          <strong>Location:</strong> {job?.location}
        </p>

        {job?.disabilityFriendly && (
          <p className="text-green-600 dark:text-green-400 font-medium">
            ♿ Disability-Friendly Employer
          </p>
        )}

        <div>
          <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            Job Description
          </h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {job?.description || "No description provided."}
          </p>
        </div>

        {job?.requirements?.length > 0 && (
          <div>
            <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
              Requirements
            </h2>
            <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300">
              {job.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        {job?.accommodations?.length > 0 && (
          <div>
            <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
              Workplace Accommodations
            </h2>
            <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300">
              {job.accommodations.map((acc, index) => (
                <li key={index}>{acc}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-4 border-t dark:border-gray-700 flex justify-between items-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Posted on:{" "}
            {new Date(job?.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          <button
            onClick={handleApply}
            disabled={applying}
            className={`px-4 py-2 rounded-xl font-medium text-white transition ${
              applying
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {applying ? "Submitting..." : "Apply Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
