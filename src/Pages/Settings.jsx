
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAccessibility } from '../hooks/use-accessibility';
import useTextToSpeech from '../hooks/useTextToSpeech';
import apiFetch from '../utils/api';

const Settings = () => {
  const navigate = useNavigate();
  const { fontSize, highContrast, increaseFontSize, decreaseFontSize, resetFontSize, toggleHighContrast } = useAccessibility();
  const { speak } = useTextToSpeech();
  const [settings, setSettings] = useState({
    tts: { voice: '', rate: 1, volume: 1 },
    notifications: { jobAlerts: true, announcements: true },
  });
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userRole = localStorage.getItem('userRole');
  const isVoiceInitialized = useRef(false);
  const hasRedirected = useRef(false);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length && !isVoiceInitialized.current) {
        isVoiceInitialized.current = true;
        setSettings((prev) => ({
          ...prev,
          tts: { ...prev.tts, voice: availableVoices[0]?.name || '' },
        }));
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Check authentication and fetch settings
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && !hasRedirected.current) {
      setError('Please log in to access settings.');
      speak('Please log in to access settings.');
      hasRedirected.current = true;
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 5000); // Delay redirect by 5 seconds
      return;
    }

    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/settings');
        setSettings({
          tts: data.tts || { voice: '', rate: 1, volume: 1 },
          notifications: data.notifications || { jobAlerts: true, announcements: true },
        });
        setLoading(false);
      } catch (err) {
        setError(`Failed to load settings: ${err.message}`);
        speak(`Failed to load settings: ${err.message}`);
        setLoading(false);
      }
    };
    if (token) {
      fetchSettings();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Removed navigate and speak from dependencies

  const saveSettings = async () => {
    setError(null);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to save settings.');
      speak('Please log in to save settings.');
      if (!hasRedirected.current) {
        hasRedirected.current = true;
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 5000); // Delay redirect by 5 seconds
      }
      return;
    }
    try {
      await apiFetch('/settings', {
        method: 'PUT',
        body: JSON.stringify({ ...settings, fontSize, highContrast }),
      });
      toast.success('Settings saved successfully!', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#ecfdf5',
          color: '#047857',
          border: '1px solid #047857',
        },
      });
      speak('Settings saved successfully!');
    } catch (err) {
      setError(`Failed to save settings: ${err.message}`);
      speak(`Failed to save settings: ${err.message}`);
    }
  };

  const dismissError = () => {
    setError(null);
    speak('Error dismissed.');
  };

  return (
    <div className="p-8 max-w-3xl mx-auto dark:bg-gray-900 text-black dark:text-white min-h-screen">
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 dark:text-blue-400 hover:underline text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          aria-label="Go back"
        >
          Go Back
        </button>
        <Link
          to="/"
          className="text-blue-600 dark:text-blue-400 hover:underline text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          aria-label="Go to home"
        >
          Home
        </Link>
      </div>
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
        Settings
      </h1>
      {error && (
        <div
          className="bg-red-100 border border-red-500 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center"
          role="alert"
          aria-live="assertive"
        >
          <span>
            {error}{' '}
            <Link
              to="/login"
              className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
              aria-label="Go to login page"
            >
              Log in here
            </Link>
          </span>
          <button
            onClick={dismissError}
            className="text-red-700 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Dismiss error message"
          >
            ✕
          </button>
        </div>
      )}
      {loading && <p className="text-gray-600 dark:text-gray-300 text-center">Loading settings...</p>}
      {!loading && !error && (
        <div className="space-y-6">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow" role="region" aria-label="Accessibility settings">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Accessibility</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                  Font Size: {fontSize}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={increaseFontSize}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    aria-label="Increase font size"
                  >
                    +
                  </button>
                  <button
                    onClick={decreaseFontSize}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    aria-label="Decrease font size"
                  >
                    -
                  </button>
                  <button
                    onClick={resetFontSize}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    aria-label="Reset font size"
                  >
                    Reset
                  </button>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={toggleHighContrast}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                    aria-label="Toggle high contrast mode"
                  />
                  High Contrast Mode
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100" htmlFor="tts-voice">
                  TTS Voice
                </label>
                <select
                  id="tts-voice"
                  value={settings.tts.voice}
                  onChange={(e) =>
                    setSettings({ ...settings, tts: { ...settings.tts, voice: e.target.value } })
                  }
                  className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  aria-label="Select text-to-speech voice"
                >
                  {voices.map((v, idx) => (
                    <option key={idx} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                  TTS Speed: {settings.tts.rate.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={settings.tts.rate}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      tts: { ...settings.tts, rate: parseFloat(e.target.value) },
                    })
                  }
                  className="w-full accent-blue-600 dark:accent-blue-400"
                  aria-label="Adjust text-to-speech speed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                  TTS Volume: {Math.round(settings.tts.volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.tts.volume}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      tts: { ...settings.tts, volume: parseFloat(e.target.value) },
                    })
                  }
                  className="w-full accent-blue-600 dark:accent-blue-400"
                  aria-label="Adjust text-to-speech volume"
                />
              </div>
            </div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow" role="region" aria-label="Notification settings">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Notifications</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <input
                  type="checkbox"
                  checked={settings.notifications.jobAlerts}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, jobAlerts: e.target.checked },
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                  aria-label="Toggle job alerts"
                />
                Job Alerts
              </label>
              <label className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <input
                  type="checkbox"
                  checked={settings.notifications.announcements}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, announcements: e.target.checked },
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                  aria-label="Toggle announcements"
                />
                Announcements
              </label>
            </div>
          </div>
          {userRole === 'admin' && (
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow" role="region" aria-label="Admin settings">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Admin Settings</h2>
              <p className="text-gray-700 dark:text-gray-300">System-wide settings (e.g., site maintenance) coming soon!</p>
            </div>
          )}
          <button
            onClick={saveSettings}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            aria-label="Save settings"
          >
            Save Settings
          </button>
        </div>
      )}
    </div>
  );
};

export default Settings;