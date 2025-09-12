import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ScreenshotUpload = ({ onClose }) => {
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      toast.error('Please select an image file (JPEG, JPG, PNG, GIF)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setScreenshot(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCaptureClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!screenshot) {
      toast.error('Please select a screenshot');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('screenshot', screenshot);
    formData.append('description', description);

    try {
      const response = await fetch('http://localhost:5000/api/screenshot', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit screenshot');
      }

      // Reset form
      setScreenshot(null);
      setPreview('');
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast.success('Screenshot submitted successfully!');
      if (onClose) onClose();
    } catch (error) {
      console.error('Error submitting screenshot:', error);
      toast.error(error.message || 'Failed to submit screenshot');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Report an Issue</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Issue Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Please describe the issue you're experiencing..."
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Screenshot
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            capture="environment"
          />
          
          <div className="mt-1 flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={handleCaptureClick}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {screenshot ? 'Change Screenshot' : 'Select Screenshot'}
            </button>
            
            {screenshot && (
              <button
                type="button"
                onClick={() => {
                  setScreenshot(null);
                  setPreview('');
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Remove
              </button>
            )}
          </div>

          {preview && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Preview:</p>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-2">
                <img 
                  src={preview} 
                  alt="Screenshot preview" 
                  className="max-h-64 mx-auto"
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={!screenshot || isSubmitting}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              !screenshot || isSubmitting
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Issue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScreenshotUpload;
