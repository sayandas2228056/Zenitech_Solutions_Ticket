import React, { useState, useEffect } from 'react';
import { LogIn, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Img from '../assets/Images/Pic4.jpg'
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }
    const backendurl = import.meta.env.VITE_BACKEND_URL;
    try {
      console.log('Attempting login for:', formData.email);
      const response = await axios.post(`${backendurl}/api/auth/login`, formData);
      console.log('Login response:', response.data);
      
      if (response.data.token && response.data.user) {
        login(response.data.user, response.data.token);
        navigate('/dashboard');
      } else {
        console.error('Invalid response format:', response.data);
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Image */}
      <div className="hidden md:block">
        <img src={Img} alt="Zenitech Solutions" className="w-full h-full object-cover" />
      </div>

      {/* Right Form */}
      <div className="flex items-center justify-center px-8 py-12 bg-[#fef3e7]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <a href="/">
              <h1 className="text-3xl font-bold mb-2">
                <span className='text-orange-500'>Zenitech</span> <span className='text-b'>Solutions</span>
              </h1>
            </a>
            <h2 className="text-4xl text-[#92400e] font-semibold">Welcome Back</h2>
            <p className="text-sm text-[#7c3e0a] mt-2">Sign in to access your solutions</p>
          </div>

          {error && (
            <div className="bg-red-100 text-red-600 px-4 py-3 rounded mb-4 border border-red-300">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#b45309]">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 bg-white border border-orange-200 rounded-lg text-[#78350f] placeholder-[#b45309] focus:outline-none focus:ring-2 focus:ring-orange-400"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#b45309]">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-white border border-orange-200 rounded-lg text-[#78350f] placeholder-[#b45309] focus:outline-none focus:ring-2 focus:ring-orange-400"
                required
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-[#b45309]"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </div>
            </div>

            {/* Options */}
            <div className="flex justify-between items-center text-sm text-[#92400e]">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-orange-500" />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-orange-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full group flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-400 to-orange-500 text-white font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#92400e]">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="font-medium text-orange-600 hover:underline"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;