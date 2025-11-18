import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Users, X, Book, Briefcase, Accessibility, Folder, BookOpen, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import apiFetch from '../../utils/api';
//import toast from 'react-hot-toast';

const highlightMatch = (text, query) => {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-yellow-200">{part}</mark> : part
  );
};

const Section = ({ title, icon, items, searchQuery, isOpen, toggle }) => {
  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredItems.length === 0) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="border rounded-xl mb-4 shadow-md"
    >
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200 transition"
      >
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        {isOpen ? <ChevronUp /> : <ChevronDown />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden p-4 space-y-2"
          >
            {filteredItems.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                {item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    {highlightMatch(item.title, searchQuery)}
                  </a>
                ) : (
                  <div>
                    <p className="text-gray-900">{highlightMatch(item.title, searchQuery)}</p>
                    <p className="text-gray-700">{highlightMatch(item.body.substring(0, 100), searchQuery)}...</p>
                    <button
                      onClick={() => {
                        const utterance = new SpeechSynthesisUtterance(item.body);
                        utterance.lang = 'en-US';
                        speechSynthesis.speak(utterance);
                      }}
                      className="mt-2 bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                      aria-label={`Read aloud: ${item.title}`}
                    >
                      Read Aloud
                    </button>
                  </div>
                )}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [openSections, setOpenSections] = useState({});
  const [cmsResources, setCmsResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  const toggleSection = (title) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  useEffect(() => {
    const fetchCmsResources = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/content?category=Guides,Guidelines,Announcements');
        setCmsResources(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching CMS resources:', err);
        setError(`Failed to load resources: ${err.message}`);
        setLoading(false);
      }
    };

    fetchCmsResources();
  }, []);

  const categories = [
    { name: 'All', icon: <Folder size={16} /> },
    { name: 'Job Seekers', icon: <Users size={16} /> },
    { name: 'Employers', icon: <Briefcase size={16} /> },
    { name: 'Accessibility Tools', icon: <Accessibility size={16} /> },
    { name: 'Accommodation Guides', icon: <BookOpen size={16} /> },
    { name: 'Announcements', icon: <Megaphone size={16} /> },
  ];

  const staticResources = [
    {
      category: 'Job Seekers',
      title: 'For Job Seekers',
      icon: <Book />,
      items: [
        { title: 'How to Write a Great Resume', link: 'https://www.resume-example.com' },
        { title: 'Job Interview Preparation Guide', link: 'https://www.job-interview-tips.com' },
        { title: 'Free Online Skills Development Courses', link: 'https://www.skills-development.org' },
      ],
    },
    {
      category: 'Employers',
      title: 'For Employers',
      icon: <Briefcase />,
      items: [
        { title: 'Best Practices for Inclusive Hiring', link: 'https://www.inclusive-hiring.com' },
        { title: 'Writing Effective Job Postings', link: 'https://www.job-posting-guide.org' },
        { title: 'Legal Resources for Employers', link: 'https://www.legal-resources-for-employers.com' },
      ],
    },
    {
      category: 'Accessibility Tools',
      title: 'Accessibility Tools',
      icon: <Accessibility />,
      items: [
        { title: 'Free Screen Reader Software', link: 'https://www.screenreader.com' },
        { title: 'Text-to-Speech Tools', link: 'https://www.text-to-speech.org' },
        { title: 'Website Accessibility Checker', link: 'https://www.web-accessibility-checker.com' },
      ],
    },
    {
      category: 'Accommodation Guides',
      title: 'Workplace Accommodation Guides',
      icon: <BookOpen />,
      items: [
        { title: 'Download Workplace Accommodation Guide', link: '/Workplace_Accommodation_Guide.pdf' },
        { title: 'Job Accommodation Network (JAN)', link: 'https://askjan.org/' },
        { title: 'EEOC - Disability Rights', link: 'https://www.eeoc.gov/laws/guidance' },
        { title: 'ADA National Network', link: 'https://adata.org/' },
        { title: 'UN Disability Resources', link: 'https://www.un.org/development/desa/disabilities/' },
      ],
    },
  ];

  const cmsResourceSections = [
    {
      category: 'Job Seekers',
      title: 'Job Seeker Guides',
      icon: <Book />,
      items: cmsResources
        .filter((res) => res.category === 'Guides' && res.isPublished)
        .map((res) => ({ title: res.title, body: res.body })),
    },
    {
      category: 'Employers',
      title: 'Employer Guides',
      icon: <Briefcase />,
      items: cmsResources
        .filter((res) => res.category === 'Guides' && res.isPublished)
        .map((res) => ({ title: res.title, body: res.body })),
    },
    {
      category: 'Accommodation Guides',
      title: 'Dynamic Accommodation Guides',
      icon: <BookOpen />,
      items: cmsResources
        .filter((res) => res.category === 'Guidelines' && res.isPublished)
        .map((res) => ({ title: res.title, body: res.body })),
    },
    {
      category: 'Announcements',
      title: 'Announcements',
      icon: <Megaphone />,
      items: cmsResources
        .filter((res) => res.category === 'Announcements' && res.isPublished)
        .map((res) => ({ title: res.title, body: res.body })),
    },
  ];

  const allResources = [...staticResources, ...cmsResourceSections].filter(
    (res) => activeCategory === 'All' || res.category === activeCategory
  );

  return (
    <>
      <div className="p-4">
        <div className="top-13 left-4 flex space-x-4 z-50">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:underline text-lg font-medium"
          >
            Go Back
          </button>
          <Link to="/" className="text-blue-600 hover:underline text-lg font-medium">
            Home
          </Link>
          <Link
            to={userRole === 'employer' ? '/dashboard/employer' : '/dashboard/jobseeker'}
            className="text-blue-600 hover:underline text-lg font-medium"
          >
            Dashboard
          </Link>
          <Link
            to="/my-applications"
            className="text-blue-600 hover:underline text-lg font-medium"
          >
            My Applications
          </Link>
        </div>
      </div>
      <div className="p-8 max-w-3xl mx-auto dark:bg-gray-900 text-black dark:text-white min-h-screen">
        <div className="flex justify-end mb-4">
          
        </div>
        <h1 className="text-4xl font-bold mb-6 text-center">Resources</h1>
        {error && (
          <p className="text-red-600 mb-4 text-center" role="alert">
            {error}
          </p>
        )}
        {loading && <p className="text-gray-600 text-center">Loading resources...</p>}
        <p className="text-lg text-gray-700 mb-4 text-center dark:text-gray-300">
          Find helpful tools, guides, and links for your journey.
        </p>

        <div className="mb-4 flex items-center gap-2">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                activeCategory === cat.name ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
              }`}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {allResources.map((res) => (
            <Section
              key={res.title}
              title={res.title}
              icon={res.icon}
              items={res.items}
              searchQuery={searchQuery}
              isOpen={!!openSections[res.title]}
              toggle={() => toggleSection(res.title)}
            />
          ))}
        </AnimatePresence>

        {(searchQuery || activeCategory !== 'All') && (
          <p className="text-sm text-gray-500 text-center mt-4 dark:text-gray-400">
            {allResources.length > 0
              ? `Showing ${allResources.length} sections`
              : 'No resources found'}
          </p>
        )}
      </div>
    </>
  );
};

export default Resources;