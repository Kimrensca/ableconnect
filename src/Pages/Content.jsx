// frontend/src/Pages/Content.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import  useTextToSpeech  from '../hooks/useTextToSpeech';

const Content = () => {
  const navigate = useNavigate();
  const { speak } = useTextToSpeech();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const url = selectedCategory
          ? `http://localhost:5000/api/content?category=${selectedCategory}`
          : 'http://localhost:5000/api/content';
        const res = await fetch(url, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }
        const data = await res.json();
        setContent(data);
        setLoading(false);
      } catch (err) {
        toast.error(`Failed to load content: ${err.message}`, {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#fef3f3',
            color: '#b91c1c',
            border: '1px solid #b91c1c',
          },
        });
        setLoading(false);
      }
    };
    fetchContent();
  }, [selectedCategory]);

  return (
    <div className="p-8 max-w-4xl mx-auto dark:bg-gray-900 text-black dark:text-white min-h-screen">
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 dark:text-blue-400 hover:underline text-lg font-medium"
          aria-label="Go back"
        >
          Go Back
        </button>
        <a href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-lg font-medium" aria-label="Go to home">
          Home
        </a>
      </div>
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
        All Content
      </h1>
      <div className="mb-6">
        <label htmlFor="category-filter" className="block text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Filter by Category
        </label>
        <select
          id="category-filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border p-2 rounded w-full max-w-xs text-black dark:text-white dark:bg-gray-800"
          aria-label="Filter content by category"
        >
          <option value="">All Categories</option>
          <option value="Homepage">Homepage</option>
          <option value="FAQ">FAQ</option>
          <option value="Guidelines">Guidelines</option>
          <option value="Announcements">Announcements</option>
          <option value="Guides">Guides</option>
          <option value="Other">Other</option>
        </select>
      </div>
      {loading ? (
        <p className="text-gray-600 dark:text-gray-300 text-center">Loading content...</p>
      ) : (
        <div className="space-y-6">
          {content.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300 text-center">No content available.</p>
          ) : (
            content.map((item) => (
              <div
                key={item._id}
                className="bg-indigo-100 dark:bg-gray-800 p-4 rounded shadow"
                role="article"
                aria-label={item.title}
              >
                <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  {item.title}
                </h2>
                <p className="text-gray-700 dark:text-gray-300"><strong>Category:</strong> {item.category}</p>
                <p className="text-gray-700 dark:text-gray-300">{item.body}</p>
                <button
                  onClick={() => speak(item.body)}
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  aria-label={`Read ${item.title} aloud`}
                >
                  Read Aloud
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Content;