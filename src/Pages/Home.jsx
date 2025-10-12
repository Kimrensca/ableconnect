import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../Components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '../Components/ui/button';
import { Megaphone } from 'lucide-react';
import useTextToSpeech from '../hooks/useTextToSpeech';

function Home() {
  const [homepageContent, setHomepageContent] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { speak, speaking } = useTextToSpeech();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/content?category=Homepage,Announcements', {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        const data = await res.json();
        const homepage = data.filter((item) => item.category === 'Homepage');
        const announcements = data.filter((item) => item.category === 'Announcements');
        setHomepageContent(Array.isArray(homepage) ? homepage : []);
        setAnnouncements(Array.isArray(announcements) ? announcements : []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError(`Failed to load content: ${err.message}`);
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return (
    <div className="text-center py-12 px-6 max-w-4xl mx-auto bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-blue-800 dark:text-blue-300">
        Welcome to the AbleConnect Job Portal
      </h1>
      <p className="text-2xl md:text-3xl font-semibold mb-6 text-blue-900 dark:text-blue-400">
        Your gateway to exciting job opportunities!
      </p>
      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
        Connecting people with disabilities to employers committed to accessible workplaces and inclusive hiring.
      </p>

      {/* Announcements Banner */}
      {announcements.length > 0 && (
        <section className="mb-8" aria-labelledby="announcements-heading">
          <h2 id="announcements-heading" className="text-2xl font-semibold mb-4 flex items-center justify-center gap-2 text-gray-900 dark:text-gray-100">
            <Megaphone className="text-blue-500" /> Announcements
          </h2>
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement._id}
                className="border p-4 rounded shadow bg-yellow-100 hover:bg-yellow-200 transition-colors dark:bg-yellow-200 dark:hover:bg-yellow-300"
                role="alert"
                aria-labelledby={`announcement-title-${announcement._id}`}
              >
                <h3
                  id={`announcement-title-${announcement._id}`}
                  className="text-lg font-bold text-gray-900 dark:text-gray-800"
                >
                  {announcement.title}
                </h3>
                <p className="text-gray-900 dark:text-gray-800">{announcement.body}</p>
                <p className="text-sm text-gray-600 dark:text-gray-600 mt-2">
                  Posted: {new Date(announcement.createdAt).toLocaleString()}
                </p>
                <button
                  onClick={() => speak(announcement.body)}
                  className={`mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${speaking ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label={`Read aloud announcement: ${announcement.title}`}
                  disabled={speaking}
                >
                  {speaking ? 'Speaking...' : 'Read Aloud'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Find Jobs Button */}
      <Link
        to="/browse-jobs"
        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 text-lg shadow-md"
      >
        🔍 Find Jobs
      </Link>

      {/* Quick Links */}
      <section className="text-center mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Quick Links
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/login"
            className="bg-white dark:bg-gray-800 px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 shadow"
          >
            👤 Job Seeker Login
          </Link>
          <Link
            to="/employer/register"
            className="bg-white dark:bg-gray-800 px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 shadow"
          >
            🏢 Post a Job
          </Link>
          <Link
            to="/resources"
            className="bg-white dark:bg-gray-800 px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 shadow"
          >
            📚 Accessibility Resources
          </Link>
        </div>
      </section>

      {/* Homepage Content */}
      {loading && <p className="text-gray-600 dark:text-gray-300 mt-8">Loading content...</p>}
      {error && (
        <p className="text-red-600 mt-8 text-center" role="alert">
          {error}
        </p>
      )}
      {homepageContent.length > 0 && (
        <section className="mt-8" aria-labelledby="homepage-content-heading">
          <h2 id="homepage-content-heading" className="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-200">
            Featured Content
          </h2>
          <div className="space-y-4">
            {homepageContent.map((content) => (
              <div
                key={content._id}
                className="border p-4 rounded shadow bg-gray-100 hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:hover:bg-gray-700"
                role="article"
                aria-labelledby={`content-title-${content._id}`}
              >
                <h3
                  id={`content-title-${content._id}`}
                  className="text-xl font-bold text-gray-900 dark:text-gray-100"
                >
                  {content.title}
                </h3>
                <p className="text-gray-900 dark:text-gray-100">{content.body}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Updated: {new Date(content.updatedAt).toLocaleString()}
                </p>
                <button
                  onClick={() => speak(content.body)}
                  className={`mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${speaking ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label={`Read aloud content: ${content.title}`}
                  disabled={speaking}
                >
                  {speaking ? 'Speaking...' : 'Read Aloud'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Mission Section */}
      <section
        className="bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-600 shadow-md py-12 px-6 rounded-2xl mx-auto w-full max-w-3xl mt-8"
        aria-labelledby="mission-heading"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 id="mission-heading" className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
            Our Mission
          </h2>
          <p className="text-lg mb-6 text-gray-700 dark:text-gray-300">
            We believe that everyone deserves equal access to meaningful employment. AbleConnect is dedicated to breaking down barriers and creating pathways to employment for people with disabilities.
          </p>
          <p className="text-lg mb-6 text-gray-700 dark:text-gray-300">
            We partner with employers who are committed to creating inclusive workplaces and connect them with talented individuals who bring diverse perspectives and unique abilities.
          </p>
        </div>
      </section>

      {/* How We Help Section */}
      <section className="py-12 px-6 bg-white dark:bg-gray-900 text-black dark:text-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-200">
          How We Help
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                For Job Seekers
              </h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
                  <span>Find disability-friendly employers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
                  <span>Access accommodations information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
                  <span>Apply with accessible tools</span>
                </li>
              </ul>
              <Link to="/register?type=jobseeker">
                <Button className="w-full" variant="outline">
                  Create Account
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                For Employers
              </h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
                  <span>Post accessible job listings</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
                  <span>Connect with diverse talent</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
                  <span>Showcase inclusive workplace</span>
                </li>
              </ul>
              <Link to="/register?type=employer">
                <Button className="w-full" variant="outline">
                  Join as Employer
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Resources
              </h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
                  <span>Workplace accommodation guides</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
                  <span>Inclusive hiring best practices</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
                  <span>Career development tools</span>
                </li>
              </ul>
              <Link to="/resources">
                <Button className="w-full" variant="outline">
                  View Resources
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default Home;