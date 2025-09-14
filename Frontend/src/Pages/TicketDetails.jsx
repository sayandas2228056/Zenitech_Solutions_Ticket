import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Ticket, User, Mail, Phone, Clock, ArrowLeft, Calendar, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`http://localhost:3000/api/tickets/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch ticket details');
        }

        const data = await response.json();
        setTicket(data);
      } catch (err) {
        console.error('Error fetching ticket:', err);
        setError('Failed to load ticket details');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
  }, [id, navigate]);

  const getStatusBadge = (status) => {
    const statusStyles = {
      'Open': 'bg-green-100 text-green-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Closed': 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityStyles = {
      'high': 'bg-red-100 text-red-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-green-100 text-green-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityStyles[priority?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
        {priority || 'Not specified'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-4" />
          <p className="text-gray-600">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Ticket Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the ticket you're looking for.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-orange-600 hover:text-orange-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        {/* Ticket Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
                <p className="text-gray-500 mt-1">Ticket #{ticket.token}</p>
              </div>
              <div className="mt-4 md:mt-0">
                {getStatusBadge(ticket.status)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Requested By</h3>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                    <User className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{ticket.name || 'No name provided'}</p>
                    <p className="text-sm text-gray-500">{ticket.email || 'No email provided'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Priority</h3>
                <div className="flex items-center">
                  {getPriorityBadge(ticket.priority)}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Created</h3>
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  {new Date(ticket.createdAt).toLocaleString()}
                </div>
              </div>

              {ticket.phone && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Contact</h3>
                  <div className="flex items-center text-gray-700">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {ticket.phone}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="p-6 md:p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 text-orange-500 mr-2" />
              Description
            </h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{ticket.description || 'No description provided.'}</p>
            </div>
          </div>
        </div>

        {/* Attachments */}
        {ticket.attachments && ticket.attachments.length > 0 && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ticket.attachments.map((attachment, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start">
                      <div className="bg-orange-100 p-2 rounded-lg mr-3">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 truncate">{attachment.filename}</p>
                        <p className="text-sm text-gray-500">
                          {attachment.size ? `${(attachment.size / 1024).toFixed(2)} KB` : 'Size not available'}
                        </p>
                        <a 
                          href={`http://localhost:3000/api/tickets/${ticket._id}/attachments/${attachment._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-orange-600 hover:text-orange-700 hover:underline mt-1 inline-block"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetails;
