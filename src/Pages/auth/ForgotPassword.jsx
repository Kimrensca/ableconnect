import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiFetch from '../../utils/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      setMessage('Password reset link sent! Check your email.');
      toast.success('Password reset link sent! Check your email.');
    } catch (err) {
      const errorMsg = err.message || 'Failed to send reset link';
      setMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="w-80">
        <h2 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">Forgot Password</h2>
        <div className="mb-4">
          <Link
            to="/login"
            className="text-blue-600 dark:text-blue-400 underline text-sm hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
            aria-label="Back to Login"
          >
            ← Back to Login
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-gray-800 shadow-md rounded border border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
              disabled={loading}
              aria-label="Email address for password reset"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 dark:bg-blue-700 text-white py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-blue-300 dark:disabled:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
            aria-label={loading ? 'Sending reset link' : 'Send password reset link'}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          {message && (
            <p
              className={`text-sm text-center mt-3 ${
                message.toLowerCase().includes('sent') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
              role="alert"
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}

export default ForgotPassword;