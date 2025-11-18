import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';
import { useAccessibility } from '../../hooks/use-accessibility';
import DarkModeToggle from './DarkModeToggle';
import { Menu, X } from 'lucide-react'; 

const Header = ({ userType }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const { toggleAccessibilityPanel } = useAccessibility();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    toast({ title: 'Logged out successfully' });
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/jobs', label: 'Browse Jobs' },
    { 
      to: isLoggedIn && userType === 'employer' ? '/employer/dashboard' : '/employer/register',
      label: 'For Employers'
    },
    { to: '/resources', label: 'Resources' },
    { to: '/faq', label: 'FAQ' },
    { to: '/announcements', label: 'Announcements' },
    { to: '/content', label: 'Content' },
    { to: '/settings', label: 'Settings' },
    ...(isLoggedIn && userType === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <header className="w-full py-4 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded px-2 py-1 transition"
          onClick={() => setMobileMenuOpen(false)}
        >
          AbleConnect
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-base text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded px-3 py-1 transition"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <DarkModeToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAccessibilityPanel}
            className="border-gray-300 dark:border-gray-600"
          >
            Accessibility
          </Button>

          {isLoggedIn ? (
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Log Out
            </Button>
          ) : (
            <>
              <Link to="/login"><Button variant="outline" size="sm">Log In</Button></Link>
              <Link to="/register"><Button size="sm">Register</Button></Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg">
          <nav className="flex flex-col py-4 px-6 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded px-4 py-2 transition text-left"
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Dark Mode</span>
                <DarkModeToggle />
              </div>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={toggleAccessibilityPanel}
              >
                Accessibility Options
              </Button>

              {isLoggedIn ? (
                <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                  Log Out
                </Button>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Log In</Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">Register</Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;