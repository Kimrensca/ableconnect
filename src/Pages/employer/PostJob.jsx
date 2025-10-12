
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";
import axios from "axios";

const PostJob = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    salary: "",
    type: "Full-time",
    disabilityFriendly: false,
    company: "",
    accessibility: [],
    aboutCompany: "",
    requirements: "",
    category: "",
    otherAccessibility: "",
  });

  const [loading, setLoading] = useState(false);
  const [profileCompany, setProfileCompany] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const res = await axios.get("http://localhost:5000/api/applications/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setProfileCompany(res.data.companyProfile?.name || "");
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCheckboxChange = (option) => {
    setFormData((prev) => {
      const updated = prev.accessibility.includes(option)
        ? prev.accessibility.filter((item) => item !== option)
        : [...prev.accessibility, option];
      return { ...prev, accessibility: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("You must be logged in to post a job");
      navigate("/login");
      return;
    }

    if (!formData.title || !formData.description || !formData.location) {
      toast.error("Please fill in all required fields (Title, Description, Location)");
      return;
    }

    setLoading(true);
    try {
      const normalizedFormData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        type: formData.type,
        disabilityFriendly: formData.disabilityFriendly,
        company: formData.company || profileCompany,
        accessibility: formData.otherAccessibility
          ? [...formData.accessibility, formData.otherAccessibility].filter(item => item)
          : formData.accessibility,
        aboutCompany: formData.aboutCompany || "",
        requirements: formData.requirements,
        category: formData.category || "",
      };

      console.log("Form Data:", normalizedFormData);
      console.log("Token:", token);

      const response = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(normalizedFormData),
      });

      const data = await response.json();
      if (!response.ok) {
        const error = new Error(data.message || "Failed to post job");
        error.response = { status: response.status, data };
        throw error;
      }

      toast.success("Job posted successfully!");
      navigate("/dashboard/employer");
    } catch (error) {
      console.error("Error posting job:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error(error.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  const accessibilityOptions = [
    "Flexible work schedule",
    "Remote work option",
    "Accessible workplace",
    "Assistive tech provided",
    "Mental health support",
  ];

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 shadow rounded border border-gray-200 dark:border-gray-700">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Post a New Job</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">
            Job Title <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            type="text"
            name="title"
            placeholder="Job Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            required
            aria-label="Job Title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">
            Location <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            required
            aria-label="Location"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">Job Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            aria-label="Job Type"
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Remote">Remote</option>
            <option value="Internship">Internship</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">Salary</label>
          <input
            type="text"
            name="salary"
            placeholder="Salary"
            value={formData.salary}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            aria-label="Salary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">
            Job Description <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <textarea
            name="description"
            placeholder="Job Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            required
            aria-label="Job Description"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">Requirements</label>
          <textarea
            name="requirements"
            placeholder="Requirements (one per line)"
            value={formData.requirements}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            aria-label="Requirements"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">Company Name</label>
          <input
            type="text"
            name="company"
            placeholder="Company Name (optional, uses profile if empty)"
            value={formData.company}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            aria-label="Company Name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">About the Company</label>
          <textarea
            name="aboutCompany"
            placeholder="About the Company"
            value={formData.aboutCompany}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            aria-label="About the Company"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">Job Category</label>
          <input
            type="text"
            name="category"
            placeholder="Job Category (e.g., Engineering, Marketing)"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            aria-label="Job Category"
          />
        </div>
        <div>
          <p className="font-semibold mb-2 text-gray-800 dark:text-gray-100">Accessibility Inclusion:</p>
          {accessibilityOptions.map((option) => (
            <label key={option} className="block text-gray-800 dark:text-gray-100">
              <input
                type="checkbox"
                checked={formData.accessibility.includes(option)}
                onChange={() => handleCheckboxChange(option)}
                className="mr-2 accent-blue-600 dark:accent-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                aria-label={option}
              />
              {option}
            </label>
          ))}
          <input
            type="text"
            name="otherAccessibility"
            placeholder="Other Accessibility Features"
            value={formData.otherAccessibility}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mt-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            aria-label="Other Accessibility Features"
          />
        </div>
        <label className="block text-gray-800 dark:text-gray-100">
          <input
            type="checkbox"
            name="disabilityFriendly"
            checked={formData.disabilityFriendly}
            onChange={handleChange}
            className="mr-2 accent-blue-600 dark:accent-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            aria-label="Disability Friendly"
          />
          Disability Friendly
        </label>
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
            disabled={loading}
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            disabled={loading}
            aria-label="Post Job"
          >
            {loading ? <ClipLoader size={20} color="#fff" /> : "Post Job"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostJob;
