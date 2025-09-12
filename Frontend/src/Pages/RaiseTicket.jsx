import React, { useState, useEffect } from 'react';
import { Send, User, Phone, Mail, FileText, MessageSquare, Image as ImageIcon, X } from 'lucide-react';
import BgImg from "../assets/Images/Pic1.jpg";
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const RaiseTicket = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    description: ''
  });
  
  const [attachment, setAttachment] = useState(null);
  const [preview, setPreview] = useState('');
  const fileInputRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error(`File size should be less than 10MB (current: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
      return;
    }

    setAttachment(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = () => {
    setAttachment(null);
    setPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      try {
        setLoading(true);
        const formDataToSend = new FormData();
        
        // Append all form fields
        Object.entries(formData).forEach(([key, value]) => {
          formDataToSend.append(key, value);
        });
        
        // Append the file if it exists
        if (attachment) {
          formDataToSend.append('attachment', attachment);
        }
        
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('NO_TOKEN');
        }

        const response = await fetch("http://localhost:3000/api/tickets", {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${token}`
          },
          body: formDataToSend
        });

        const data = await response.json();
        
        if (!response.ok) {
          // Handle specific error cases
          if (response.status === 401) {
            // Token expired or invalid, redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login', { state: { from: '/raise-ticket' } });
            throw new Error('Your session has expired. Please log in again.');
          }
          throw new Error(data.message || 'Failed to submit ticket');
        }

        // Show success toast with token
        toast.success(
          <div>
            <p className="font-semibold">Ticket Submitted Successfully!</p>
            <p className="text-sm">Your Token: <span className="font-bold">{data.ticket?.token || data.token || 'N/A'}</span></p>
          </div>,
          {
            duration: 5000,
            position: 'top-center',
            style: {
              background: '#10B981',
              color: '#fff',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#059669',
            },
          }
        );
        
        // Reset form
        setFormData({
          name: '',
          phone: '',
          email: '',
          subject: '',
          description: ''
        });
        
        // Set a flag to refresh tickets when returning to dashboard
        sessionStorage.setItem('shouldRefreshTickets', 'true');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard', { state: { shouldRefresh: true } });
        }, 3000);
      } catch (err) {
        console.error('Error submitting ticket:', err);
        const errorMessage = err.message === 'NO_TOKEN' 
          ? 'You need to be logged in to submit a ticket' 
          : err.message || 'Something went wrong while submitting ticket';
          
        toast.error(
          `❌ ${errorMessage}`,
          {
            duration: 4000,
            position: 'top-center',
            style: {
              background: '#EF4444',
              color: '#fff',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
          }
        );
      } finally {
        setLoading(false);
      }
    } else {
      setErrors(newErrors);
      // Show error toast for form validation
      toast.error(
        'Please fill in all required fields correctly',
        {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#F59E0B',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
          },
        }
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url(${BgImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
      <Toaster />
      <div className="w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-violet-900 rounded-full mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-900 to-blue-500 bg-clip-text text-transparent mb-2">
            Raise Support Ticket
          </h1>
          <p className="text-gray-600 text-lg">We're here to help! Submit your request below.</p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Name and Phone Row */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="inline w-4 h-4 mr-1" />
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 placeholder-gray-400 text-black ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone className="inline w-4 h-4 mr-1" />
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 placeholder-gray-400 text-black ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your phone number"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Mail className="inline w-4 h-4 mr-1" />
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 placeholder-gray-400 text-black ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email address"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <MessageSquare className="inline w-4 h-4 mr-1" />
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 placeholder-gray-400 text-black ${
                errors.subject ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Brief summary of your issue"
            />
            {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <MessageSquare className="inline w-4 h-4 mr-1" />
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 placeholder-gray-400 text-black ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Please describe your issue in detail..."
            ></textarea>
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Attachment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-100 mb-2">
              <ImageIcon className="inline-block mr-2" size={18} />
              Attach Screenshot (Optional)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                id="ticket-attachment"
              />
              <label
                htmlFor="ticket-attachment"
                className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                <ImageIcon size={18} />
                {attachment ? 'Change File' : 'Choose File'}
              </label>
              {attachment && (
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="truncate max-w-xs">{attachment.name}</span>
                  <button
                    type="button"
                    onClick={removeAttachment}
                    className="text-red-400 hover:text-red-300"
                    title="Remove file"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
            </p>
            
            {/* Image preview */}
            {preview && (
              <div className="mt-4">
                <p className="text-sm text-gray-300 mb-2">Preview:</p>
                <div className="border border-gray-600 rounded-md p-2 max-w-xs">
                  <img 
                    src={preview} 
                    alt="Attachment preview" 
                    className="max-h-40 mx-auto"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-70"
          >
            <Send className="w-5 h-5" />
            <span>{loading ? "Submitting..." : "Submit Ticket"}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default RaiseTicket;
