import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiFetch from '../../utils/api';

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        usernameOrEmail: rememberedEmail,
        rememberMe: true,
      }));
    }
  }, []);

  const validate = (name, value) => {
    if (name === 'password' && value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedValue = type === 'checkbox' ? checked : value;

    setFormData({ ...formData, [name]: updatedValue });

    if (name !== 'rememberMe') {
      const errorMsg = validate(name, value);
      setErrors({ ...errors, [name]: errorMsg });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.usernameOrEmail) newErrors.usernameOrEmail = 'Username or Email is required';
    if (!formData.password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setLoginError('');

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          usernameOrEmail: formData.usernameOrEmail,
          password: formData.password,
        }),
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('username', data.user.username);
      localStorage.setItem('userId', data.user.id);

      if (formData.rememberMe) {
        localStorage.setItem('rememberedEmail', formData.usernameOrEmail);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      toast.success('Login successful!');

      if (data.user.role === 'jobseeker') {
        navigate('/dashboard/jobseeker');
      } else if (data.user.role === 'employer') {
        navigate('/dashboard/employer');
      } else if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      const errorMsg = err.message || 'Login failed. Please try again.';
      setLoginError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 rounded-xl shadow-md w-full max-w-full sm:max-w-md border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-blue-700 dark:text-blue-400">
          Login
        </h2>

        {loginError && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-3 sm:mb-4 text-center" role="alert">{loginError}</p>
        )}

        <div className="mb-3 sm:mb-4">
          <label htmlFor="usernameOrEmail" className="font-medium block mb-1 text-gray-800 dark:text-gray-300 text-sm sm:text-base">
            Username or Email <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            type="text"
            name="usernameOrEmail"
            id="usernameOrEmail"
            className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm sm:text-base min-h-[44px]"
            value={formData.usernameOrEmail.trim()}
            onChange={handleChange}
            required
            disabled={loading}
            aria-label="Username or Email"
          />
          {errors.usernameOrEmail && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1" role="alert">{errors.usernameOrEmail}</p>
          )}
        </div>

        <div className="mb-3 sm:mb-4">
          <label htmlFor="password" className="font-medium block mb-1 text-gray-800 dark:text-gray-300 text-sm sm:text-base">
            Password <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="password"
              className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm sm:text-base min-h-[44px]"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              aria-label="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-2 px-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 min-h-[44px] flex items-center"
              disabled={loading}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1" role="alert">{errors.password}</p>
          )}
        </div>

        <div className="mb-4 sm:mb-6 flex items-center">
          <input
            type="checkbox"
            name="rememberMe"
            id="rememberMe"
            className="mr-2 h-4 w-4 accent-blue-600 dark:accent-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            checked={formData.rememberMe}
            onChange={handleChange}
            disabled={loading}
            aria-label="Remember me"
          />
          <label htmlFor="rememberMe" className="text-sm text-gray-800 dark:text-gray-100">
            Remember me
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 dark:bg-blue-700 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 min-h-[44px] text-sm sm:text-base disabled:bg-blue-400 dark:disabled:bg-blue-500 transition"
          aria-label={loading ? 'Logging in' : 'Log In'}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        <div className="mt-3 sm:mt-4 text-center">
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline min-h-[44px] flex items-center justify-center"
            aria-label="Forgot password"
          >
            Forgot password?
          </Link>
        </div>

        <div className="mt-2 text-center">
          <p className="text-sm text-gray-800 dark:text-gray-100">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium min-h-[44px] flex items-center justify-center"
              aria-label="Create Account"
            >
              Create Account
            </Link>
          </p>
        </div>
      </form>
    </main>
  );
}

export default Login;