import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiFetch from '../../utils/api';
import '../../globals.css';

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'jobseeker',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = (name, value) => {
    switch (name) {
      case 'name':
        return value.length < 2 ? 'Name must be at least 2 characters' : '';
      case 'username':
        return value.length < 3 ? 'Username must be at least 3 characters' : '';
      case 'email':
        return !/^\S+@\S+\.\S+$/.test(value) ? 'Invalid email format' : '';
      case 'password':
        return value.length < 6 ? 'Password must be at least 6 characters' : '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    const errorMsg = validate(name, value);
    setErrors({ ...errors, [name]: errorMsg });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (!formData[key]) {
        newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      toast.success('Registration successful!');
      navigate('/login');
    } catch (err) {
      setErrors((prevErrors) => ({ ...prevErrors, general: err.message }));
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-700 dark:text-blue-400">Register</h2>

        {errors.general && <p className="text-red-600 dark:text-red-400 text-sm mt-2 text-center" role="alert">{errors.general}</p>}

        <div className="mb-4">
          <label htmlFor="name" className="font-semibold block mb-1 text-gray-800 dark:text-gray-300">
            Full Name <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            type="text"
            name="name"
            id="name"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mt-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            value={formData.name}
            onChange={handleChange}
            required
            aria-label="Full Name"
          />
          {errors.name && <p className="text-red-600 dark:text-red-400 text-sm mt-1" role="alert">{errors.name}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="username" className="font-semibold block mb-1 text-gray-800 dark:text-gray-300">
            Username <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            type="text"
            name="username"
            id="username"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mt-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            value={formData.username}
            onChange={handleChange}
            required
            aria-label="Username"
          />
          {errors.username && <p className="text-red-600 dark:text-red-400 text-sm mt-1" role="alert">{errors.username}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="font-semibold block mb-1 text-gray-800 dark:text-gray-300">
            Email <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            type="email"
            name="email"
            id="email"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mt-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            value={formData.email}
            onChange={handleChange}
            required
            aria-label="Email"
          />
          {errors.email && <p className="text-red-600 dark:text-red-400 text-sm mt-1" role="alert">{errors.email}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="font-semibold block mb-1 text-gray-800 dark:text-gray-300">
            Password <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            type="password"
            name="password"
            id="password"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mt-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            value={formData.password}
            onChange={handleChange}
            required
            aria-label="Password"
          />
          {errors.password && <p className="text-red-600 dark:text-red-400 text-sm mt-1" role="alert">{errors.password}</p>}
        </div>

        <fieldset className="mb-4">
          <legend className="font-semibold mb-2 text-gray-800 dark:text-gray-300">User Role <span className="text-red-500 dark:text-red-400">*</span></legend>
          <div className="flex items-center gap-4">
            <label className="text-gray-800 dark:text-gray-100">
              <input
                type="radio"
                name="role"
                value="jobseeker"
                checked={formData.role === 'jobseeker'}
                onChange={handleChange}
                className="mr-2 accent-blue-600 dark:accent-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                aria-label="Job Seeker Role"
              />
              Job Seeker
            </label>
            <label className="text-gray-800 dark:text-gray-100">
              <input
                type="radio"
                name="role"
                value="employer"
                checked={formData.role === 'employer'}
                onChange={handleChange}
                className="mr-2 accent-blue-600 dark:accent-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                aria-label="Employer Role"
              />
              Employer
            </label>
          </div>
        </fieldset>

        <button
          type="submit"
          className="bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded w-full hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:bg-blue-300 dark:disabled:bg-blue-500 transition"
          aria-label={loading ? 'Registering' : 'Register'}
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        <p className="text-sm text-center mt-4 text-gray-800 dark:text-gray-100">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            aria-label="Login or Sign In"
          >
            Login / Sign In
          </Link>
        </p>
      </form>
    </main>
  );
}

export default Register;