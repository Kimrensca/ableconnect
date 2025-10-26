import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const CompanyProfile = () => {
  const { companyName } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        console.log(`Fetching company profile for ${companyName}`);
        const res = await axios.get(`http://localhost:5000/api/applications/companies/${companyName}`, {
          // No auth header since it's public
        });
        console.log('Response data:', res.data);
        setCompany(res.data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError("Failed to load company profile.");
        toast.error(err.response?.data?.message || "Error loading company profile. Check console for details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyProfile();
  }, [companyName]);

  if (loading) return <div className="text-center p-6">Loading...</div>;
  if (error) return <div className="text-center text-red-600">{error}</div>;
  if (!company) return <div className="text-center text-red-600">Company not found</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className=" ml-8 text-blue-600 dark:text-blue-400 hover:underline text-lg font-medium"
          aria-label="Go back"
        >
          Go Back
        </button>
      </div>
      <h1 className="text-3xl font-bold">Company Profile: {company.name}</h1>
      <div className="mt-6">
        <p className="text-gray-600"><strong>Website:</strong> {company.website || "Not provided"}</p>
        <p className="text-gray-600"><strong>Industry:</strong> {company.industry || "Not provided"}</p>
        <p className="text-gray-600"><strong>Size:</strong> {company.size || "Not provided"}</p>
        <p className="text-gray-600"><strong>Inclusion Statement:</strong> {company.inclusionStatement || "Not provided"}</p>
        {company.accommodations && company.accommodations.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Accommodations</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {company.accommodations.map((acc, idx) => (
                <li key={idx}>{acc.name} {acc.available ? "(Available)" : "(Not Available)"}</li>
              ))}
            </ul>
          </div>
        )}
        <p className="mt-4 text-gray-600">
          Accommodations Available: {company.accommodationsAvailable ? "Yes" : "No"}
        </p>
      </div>
    </div>
  );
};

export default CompanyProfile;