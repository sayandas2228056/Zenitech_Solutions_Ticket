import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Img from '../assets/Images/Pic5.jpg';
import { useAuth } from '../context/AuthContext';
const backendurl = import.meta.env.VITE_BACKEND_URL;

const SignUp = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${backendurl}/api/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Image Section */}
      <div className="hidden md:block">
        <img
          src={Img}
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Form Section */}
      <div className="flex items-center justify-center px-8 py-12 bg-[#fcefe4]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <p className="mt-2 text-4xl text-[#553926] font-medium">Create Account</p>
            <p className="text-sm text-[#6b5547] mt-1">Join us to give a solution to your problems</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#a18674]">
                <User className="h-5 w-5" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2cfc3] rounded-lg text-[#4d3a2a] placeholder-[#a08b7c] focus:outline-none focus:ring-2 focus:ring-[#c89b7b]"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#a18674]">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2cfc3] rounded-lg text-[#4d3a2a] placeholder-[#a08b7c] focus:outline-none focus:ring-2 focus:ring-[#c89b7b]"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#a18674]">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Password"
                className="w-full pl-10 pr-10 py-3 bg-white border border-[#e2cfc3] rounded-lg text-[#4d3a2a] placeholder-[#a08b7c] focus:outline-none focus:ring-2 focus:ring-[#c89b7b]"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-[#a18674] hover:text-[#8a7568]"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#a18674]">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm Password"
                className="w-full pl-10 pr-10 py-3 bg-white border border-[#e2cfc3] rounded-lg text-[#4d3a2a] placeholder-[#a08b7c] focus:outline-none focus:ring-2 focus:ring-[#c89b7b]"
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-[#a18674] hover:text-[#8a7568]"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Terms */}
            <div className="flex items-center">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                required
                className="h-4 w-4 text-[#c89b7b] border-gray-300 rounded"
              />
              <label htmlFor="agreeToTerms" className="ml-2 text-sm text-[#5c4a3a]">
                I agree to the <button type="button" className="text-[#b9825b] underline">Terms of Service</button> and <button type="button" className="text-[#b9825b] underline">Privacy Policy</button>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full group flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#c89b7b] to-[#d4a07a] text-white font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6f4e37]">
            Already have an account? <button type="button" onClick={() => navigate('/login')} className="font-medium text-[#b9825b] hover:underline">Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
