
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Megaphone } from 'lucide-react';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/content?category=Announcements', {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        const data = await res.json();
        setAnnouncements(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError(`Failed to load announcements: ${err.message}`);
        toast.error(`Failed to load announcements: ${err.message}`);
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const speakText = (text, title) => {
    const utterance = new SpeechSynthesisUtterance(`${title}. ${text}`);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100">
        Announcements
      </h1>
      <div className="mb-6">
        <Link
          to="/dashboard/jobseeker"
          className="text-blue-600 dark:text-blue-400 underline text-sm hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
          aria-label="Back to Job Seeker Dashboard"
        >
          ← Back to Dashboard
        </Link>
      </div>
      {loading && <p className="text-gray-600 dark:text-gray-400">Loading announcements...</p>}
      {error && (
        <p className="text-red-600 dark:text-red-400 mb-4 text-center" role="alert">
          {error}
        </p>
      )}
      {announcements.length === 0 && !loading && !error && (
        <p className="text-gray-600 dark:text-gray-400">No announcements available.</p>
      )}
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div
            key={announcement._id}
            className="border p-4 rounded shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            role="alert"
            aria-labelledby={`announcement-title-${announcement._id}`}
          >
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
              <h2
                id={`announcement-title-${announcement._id}`}
                className="text-xl font-bold text-gray-900 dark:text-gray-100"
              >
                {announcement.title}
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mt-2">{announcement.body}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Posted: {new Date(announcement.createdAt).toLocaleString()}
            </p>
            <button
              onClick={() => speakText(announcement.body, announcement.title)}
              className="mt-2 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
              aria-label={`Read aloud announcement: ${announcement.title}`}
            >
              Read Aloud
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;
