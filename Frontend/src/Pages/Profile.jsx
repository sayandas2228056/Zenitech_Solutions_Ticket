import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Save, X, Eye, EyeOff, Linkedin, Github, Twitter, Facebook, Instagram, Briefcase, MapPin, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    socialLinks: {
      linkedin: '',
      github: '',
      twitter: '',
      facebook: '',
      instagram: ''
    }
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const backendurl = import.meta.env.VITE_BACKEND_URL;

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${backendurl}/api/profile/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setFormData(prev => ({
        ...prev,
        ...response.data,
        socialLinks: {
          ...prev.socialLinks,
          ...(response.data.socialLinks || {})
        }
      }));
    } catch (err) {
      setError('Failed to fetch profile data');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('social.')) {
      const platform = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [platform]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }
      if (!formData.currentPassword) {
        setError('Current password is required to set new password');
        return;
      }
    }

    try {
      const response = await axios.put(
        `${backendurl}/api/profile/update`,
        {
          name: formData.name,
          email: formData.email,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          socialLinks: formData.socialLinks,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      login(response.data, localStorage.getItem('token'));
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      setFormData(prev => ({
        ...prev, currentPassword: '', newPassword: '', confirmPassword: ''
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    fetchProfile(); // Refetch to reset form data to original state
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fef3e7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const InputField = ({ icon: Icon, label, name, value, onChange, disabled, type = 'text', placeholder, children }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[#92400e]">{label}</label>
      <div className="relative">
        {Icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#b45309]"><Icon className="h-5 w-5" /></div>}
        <input
          type={type}
          name={name}
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-white border border-orange-200 rounded-lg text-[#78350f] placeholder-[#b45309] focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none`}
        />
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fef3e7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-[#92400e]">Profile Settings</h2>
              <p className="text-sm text-[#7c3e0a] mt-1">Manage your personal information and preferences.</p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 md:mt-0 px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Edit Profile
              </button>
            )}
          </div>

          {error && <div className="mb-6 p-3 bg-red-100 border border-red-300 rounded-lg text-red-600 text-sm">{error}</div>}
          {success && <div className="mb-6 p-3 bg-green-100 border border-green-300 rounded-lg text-green-700 text-sm">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-orange-100">
            {/* --- Basic Information --- */}
            <div className="pt-8 space-y-6">
              <h3 className="text-xl font-semibold text-[#7c3e0a]">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField icon={User} label="Full Name" name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} placeholder="Your full name" />
                <InputField icon={Mail} label="Email" name="email" value={formData.email} onChange={handleChange} disabled={!isEditing} placeholder="your.email@example.com" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#92400e]">Bio</label>
                <textarea name="bio" value={formData.bio || ''} onChange={handleChange} disabled={!isEditing} rows="4" placeholder="Tell us a little about yourself..." className="w-full px-4 py-3 bg-white border border-orange-200 rounded-lg text-[#78350f] placeholder-[#b45309] focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-slate-50" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField icon={MapPin} label="Location" name="location" value={formData.location} onChange={handleChange} disabled={!isEditing} placeholder="City, Country" />
                <InputField icon={LinkIcon} label="Website" name="website" value={formData.website} onChange={handleChange} disabled={!isEditing} placeholder="https://your-website.com" />
              </div>
            </div>

            {/* --- Social Links --- */}
            <div className="pt-8 space-y-6">
              <h3 className="text-xl font-semibold text-[#7c3e0a]">Social Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField icon={Linkedin} label="LinkedIn" name="social.linkedin" value={formData.socialLinks.linkedin} onChange={handleChange} disabled={!isEditing} placeholder="linkedin.com/in/..." />
                <InputField icon={Github} label="GitHub" name="social.github" value={formData.socialLinks.github} onChange={handleChange} disabled={!isEditing} placeholder="github.com/..." />
                <InputField icon={Twitter} label="Twitter" name="social.twitter" value={formData.socialLinks.twitter} onChange={handleChange} disabled={!isEditing} placeholder="twitter.com/..." />
                <InputField icon={Facebook} label="Facebook" name="social.facebook" value={formData.socialLinks.facebook} onChange={handleChange} disabled={!isEditing} placeholder="facebook.com/..." />
                <InputField icon={Instagram} label="Instagram" name="social.instagram" value={formData.socialLinks.instagram} onChange={handleChange} disabled={!isEditing} placeholder="instagram.com/..." />
              </div>
            </div>

            {isEditing && (
              <>
                {/* --- Change Password --- */}
                <div className="pt-8 space-y-6">
                  <h3 className="text-xl font-semibold text-[#7c3e0a]">Change Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField icon={Lock} label="Current Password" name="currentPassword" type={showPassword ? "text" : "password"} value={formData.currentPassword} onChange={handleChange} placeholder="••••••••">
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#b45309]">{showPassword ? <EyeOff /> : <Eye />}</button>
                    </InputField>
                    <InputField icon={Lock} label="New Password" name="newPassword" type={showNewPassword ? "text" : "password"} value={formData.newPassword} onChange={handleChange} placeholder="••••••••">
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#b45309]">{showNewPassword ? <EyeOff /> : <Eye />}</button>
                    </InputField>
                    <InputField icon={Lock} label="Confirm New Password" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••">
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#b45309]">{showConfirmPassword ? <EyeOff /> : <Eye />}</button>
                    </InputField>
                  </div>
                </div>

                {/* --- Action Buttons --- */}
                <div className="pt-8 flex justify-end gap-4">
                  <button type="button" onClick={handleCancel} className="px-6 py-3 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition-all duration-300">
                    <X className="w-5 h-5 inline-block mr-2" />
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-3 rounded-lg bg-gradient-to-r from-orange-400 to-orange-500 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300">
                    <Save className="w-5 h-5 inline-block mr-2" />
                    Save Changes
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;