import React, { useState, useEffect, useCallback } from 'react';
import {
  User, Mail, Lock, Save, X, Eye, EyeOff, Linkedin, Github, Twitter,
  Facebook, Instagram, MapPin, Edit3, Camera,
  Globe, Phone, Calendar, Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

/**
 * TOP-LEVEL INPUT COMPONENTS (moved outside Profile to avoid remounting on each render)
 */
const InputField = React.memo(({ icon: Icon, label, name, value, onChange, disabled, type = 'text', placeholder, children, required = false }) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-semibold text-orange-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-orange-400 group-focus-within:text-orange-500 transition-colors" />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-4 py-2.5 bg-white border border-orange-200 rounded-lg text-orange-900 placeholder-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-orange-50 disabled:text-orange-500 disabled:border-orange-200 transition-all duration-200 shadow-sm hover:shadow-md`}
          required={required}
        />
        {children}
      </div>
    </div>
  );
});

const TextAreaField = React.memo(({ label, name, value, onChange, disabled, placeholder, rows = 4, required = false }) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-semibold text-orange-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        value={value ?? ''}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-white border border-orange-200 rounded-lg text-orange-900 placeholder-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-orange-50 disabled:text-orange-500 disabled:border-orange-200 transition-all duration-200 shadow-sm hover:shadow-md resize-none"
        required={required}
      />
    </div>
  );
});

/**
 * PROFILE COMPONENT
 */
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
    phone: '',
    company: '',
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

  const backendurl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${backendurl}/api/profile/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Accept either response.data.socialLinks or response.data.social for compatibility
      const socialFromBackend = response.data.socialLinks || response.data.social || {};

      setFormData(prev => ({
        ...prev,
        ...response.data,
        socialLinks: {
          ...prev.socialLinks,
          ...socialFromBackend
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

  // stable handler so memoized InputField/TextAreaField don't get a new onChange ref each render
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setFormData(prev => {
      // support both "socialLinks.platform" and "social.platform" names
      if (name.startsWith('socialLinks.') || name.startsWith('social.')) {
        const platform = name.split('.')[1];
        return {
          ...prev,
          socialLinks: {
            ...prev.socialLinks,
            [platform]: value
          }
        };
      }

      return {
        ...prev,
        [name]: value
      };
    });

    setError('');
    setSuccess('');
  }, []);

  // Helper function to format social media URLs
  const formatSocialUrl = (platform, username) => {
    if (!username) return '';
    
    // Remove any protocol, www, and trailing slashes
    const cleanUsername = username
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/+$/, '')
      .trim();
    
    switch(platform) {
      case 'linkedin':
        // Extract username from URL if it's a full URL
        let linkedinUsername = cleanUsername;
        const linkedinMatch = cleanUsername.match(/linkedin\.com\/in\/([^/]+)/);
        if (linkedinMatch) {
          linkedinUsername = linkedinMatch[1];
        }
        // Ensure the username doesn't contain any slashes
        linkedinUsername = linkedinUsername.split('/')[0];
        return `https://linkedin.com/in/${linkedinUsername}`;
        
      case 'github':
        let githubUsername = cleanUsername;
        if (cleanUsername.includes('github.com/')) {
          githubUsername = cleanUsername.split('github.com/')[1].split('/')[0];
        } else if (cleanUsername.includes('@')) {
          githubUsername = cleanUsername.split('@')[1];
        }
        return `https://github.com/${githubUsername}`;
        
      case 'twitter':
        let twitterUsername = cleanUsername;
        if (cleanUsername.includes('twitter.com/')) {
          twitterUsername = cleanUsername.split('twitter.com/')[1].split('/')[0];
        } else if (cleanUsername.startsWith('@')) {
          twitterUsername = cleanUsername.substring(1);
        }
        // Ensure we don't have duplicate 'twitter.com' in the URL
        if (twitterUsername === 'twitter.com') {
          return ''; // Skip invalid Twitter username
        }
        return twitterUsername ? `https://twitter.com/${twitterUsername}` : '';
        
      case 'facebook':
        let facebookUsername = cleanUsername;
        if (cleanUsername.includes('facebook.com/')) {
          facebookUsername = cleanUsername.split('facebook.com/')[1].split('/')[0];
        }
        // Ensure we don't have duplicate 'facebook.com' in the URL
        if (facebookUsername === 'facebook.com') {
          return ''; // Skip invalid Facebook username
        }
        return facebookUsername ? `https://facebook.com/${facebookUsername}` : '';
        
      case 'instagram':
        let instagramUsername = cleanUsername;
        if (cleanUsername.includes('instagram.com/')) {
          instagramUsername = cleanUsername.split('instagram.com/')[1].split('/')[0];
        } else if (cleanUsername.startsWith('@')) {
          instagramUsername = cleanUsername.substring(1);
        }
        // Ensure we don't have duplicate 'instagram.com' in the URL
        if (instagramUsername === 'instagram.com') {
          return ''; // Skip invalid Instagram username
        }
        return instagramUsername ? `https://instagram.com/${instagramUsername}` : '';
        
      default:
        return username;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    console.log('Form submitted with data:', formData);

    // If we're changing the password, handle that separately
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }
      if (!formData.currentPassword) {
        setError('Current password is required to set new password');
        return;
      }
      
      try {
        console.log('Attempting to change password...');
        await axios.put(
          `${backendurl}/api/profile/change-password`,
          {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        console.log('Password changed successfully');
      } catch (err) {
        console.error('Password change error:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to update password');
        return;
      }
    }

    try {
      // Format social links before sending
      const formattedSocialLinks = {};
      
      // Only include non-empty, valid URLs
      const socials = {
        linkedin: formData.socialLinks.linkedin,
        github: formData.socialLinks.github,
        twitter: formData.socialLinks.twitter,
        facebook: formData.socialLinks.facebook,
        instagram: formData.socialLinks.instagram
      };
      
      // Process each social link
      Object.entries(socials).forEach(([platform, url]) => {
        if (url && url.trim() !== '') {
          const formattedUrl = formatSocialUrl(platform, url);
          if (formattedUrl && formattedUrl.trim() !== '') {
            formattedSocialLinks[platform] = formattedUrl;
          }
        }
      });
      
      console.log('Formatted social links:', formattedSocialLinks);

      // Update profile data
      const profileData = {
        name: formData.name,
        email: formData.email,
        bio: formData.bio || undefined,
        location: formData.location || undefined,
        website: formData.website || undefined,
        socialLinks: Object.keys(formattedSocialLinks).length > 0 ? formattedSocialLinks : undefined
      };

      console.log('Sending profile update with data:', JSON.stringify(profileData, null, 2));

      const response = await axios.put(
        `${backendurl}/api/profile/update`,
        profileData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'X-Debug': 'true' // Add debug header
          },
          validateStatus: (status) => status < 500 // Don't throw for 4xx errors
        }
      );

      console.log('Profile update response:', response.data);

      if (response.status >= 400) {
        throw new Error(response.data?.message || 'Failed to update profile');
      }

      // Update auth context with new user data
      login(response.data, localStorage.getItem('token'));
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err) {
      console.error('Profile update error:', {
        message: err.message,
        response: err.response?.data,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          data: err.config?.data
        }
      });
      
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      
      setError(err.response?.data?.message || 'Failed to update profile. Please check the console for details.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    fetchProfile();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-600"></div>
          <span className="text-orange-600 font-medium">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                {isEditing && (
                  <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white hover:bg-orange-600 transition-colors">
                    <Camera className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-orange-900">{formData.name || 'Your Name'}</h1>
                <p className="text-orange-600">{formData.email}</p>
                {formData.location && (
                  <p className="text-sm text-orange-500 flex items-center mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    {formData.location}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 sm:mt-0">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors duration-200"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm font-medium">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-6">
            <h2 className="text-lg font-bold text-orange-900 mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-orange-600" />
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                icon={User}
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Enter your full name"
                required
              />
              <InputField
                icon={Mail}
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="your.email@example.com"
                required
              />
              <InputField
                icon={Phone}
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="+1 (555) 123-4567"
              />
              <InputField
                icon={Briefcase}
                label="Company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Your company name"
              />
              <InputField
                icon={MapPin}
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="City, Country"
              />
              <InputField
                icon={Globe}
                label="Website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="https://your-website.com"
              />
            </div>

            <div className="mt-6">
              <TextAreaField
                label="Bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                rows={4}
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-6">
            <h2 className="text-lg font-bold text-orange-900 mb-6 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-orange-600" />
              Social Links
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                icon={Linkedin}
                label="LinkedIn"
                name="socialLinks.linkedin"
                value={formData.socialLinks.linkedin || ''}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="linkedin.com/in/username"
                type="url"
              />
              <InputField
                icon={Github}
                label="GitHub"
                name="socialLinks.github"
                value={formData.socialLinks.github || ''}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="github.com/username"
                type="url"
              />
              <InputField
                icon={Twitter}
                label="Twitter"
                name="socialLinks.twitter"
                value={formData.socialLinks.twitter || ''}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="twitter.com/username"
                type="url"
              />
              <InputField
                icon={Facebook}
                label="Facebook"
                name="socialLinks.facebook"
                value={formData.socialLinks.facebook || ''}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="facebook.com/username"
                type="url"
              />
              <InputField
                icon={Instagram}
                label="Instagram"
                name="socialLinks.instagram"
                value={formData.socialLinks.instagram || ''}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="instagram.com/username"
                type="url"
              />
            </div>
          </div>

          {/* Security Settings */}
          {isEditing && (
            <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-6">
              <h2 className="text-lg font-bold text-orange-900 mb-6 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-orange-600" />
                Change Password
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField
                  icon={Lock}
                  label="Current Password"
                  name="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter current password"
                >
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-orange-400 hover:text-orange-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </InputField>

                <InputField
                  icon={Lock}
                  label="New Password"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                >
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(v => !v)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-orange-400 hover:text-orange-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </InputField>

                <InputField
                  icon={Lock}
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                >
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-orange-400 hover:text-orange-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </InputField>
              </div>
              <p className="text-xs text-orange-500 mt-3">
                Leave password fields empty if you don't want to change your password.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
