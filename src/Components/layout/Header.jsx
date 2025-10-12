
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';
import { useAccessibility } from '../../hooks/use-accessibility';
import DarkModeToggle from './DarkModeToggle';

const Header = ({ userType }) => {
  const { toast } = useToast();
  const { toggleAccessibilityPanel } = useAccessibility();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    toast({ title: 'Logged out successfully' });
    navigate('/login');
  };

  return (
    <header className="w-full py-4 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between text-gray-900 dark:text-gray-100">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded px-2 py-1 transition" aria-label="AbleConnect Home">
          AbleConnect
        </Link>
        <nav className="hidden md:flex ml-8">
          <ul className="flex space-x-6">
            <li>
              <Link
                to="/"
                className="text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded px-2 py-1 transition"
                aria-label="Home"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/jobs"
                className="text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded px-2 py-1 transition"
                aria-label="Browse Jobs"
              >
                Browse Jobs
              </Link>
            </li>
            <li>
              <Link
                to={isLoggedIn && userType === 'employer' ? '/employer/dashboard' : '/employer/register'}
                className="text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded px-2 py-1 transition"
                aria-label={isLoggedIn && userType === 'employer' ? 'Employer Dashboard' : 'Register as Employer'}
              >
                For Employers
              </Link>
            </li>
            <li>
              <Link
                to="/resources"
                className="text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded px-2 py-1 transition"
                aria-label="Resources"
              >
                Resources
              </Link>
            </li>
            <li>
              <Link
                to="/faq"
                className="text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded px-2 py-1 transition"
                aria-label="FAQ"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                to="/announcements"
                className="text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded px-2 py-1 transition"
                aria-label="Announcements"
              >
                Announcements
              </Link>
            </li>
            <li>
              <Link
                to="/content"
                className="text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded px-2 py-1 transition"
                aria-label="All Content"
              >
                Content
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className="text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded px-2 py-1 transition"
                aria-label="Settings"
              >
                Settings
              </Link>
            </li>
            {isLoggedIn && userType === 'admin' && (
              <li>
                <Link
                  to="/admin"
                  className="text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded px-2 py-1 transition"
                  aria-label="Admin Dashboard"
                >
                  Admin
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <DarkModeToggle />
        <Button
          variant="outline"
          size="sm"
          onClick={toggleAccessibilityPanel}
          className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-100 dark:hover:bg-blue-900"
          aria-label="Accessibility Options"
        >
          Accessibility
        </Button>
        {isLoggedIn ? (
          <div className="flex items-center gap-2">
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900"
              aria-label="Log Out"
            >
              Log Out
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button
                variant="outline"
                size="sm"
                className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-100 dark:hover:bg-blue-900"
                aria-label="Log In"
              >
                Log In
              </Button>
            </Link>
            <Link to="/register">
              <Button
                variant="default"
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                aria-label="Register"
              >
                Register
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
