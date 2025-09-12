import React, { useEffect, useState } from "react";
import { Ticket, Clock, RefreshCw, Search, Filter, AlertCircle, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cards from "../Components/Cards";
import ScreenshotUpload from "../Components/ScreenshotUpload";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);

  const fetchTickets = async () => {
    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching tickets for user:', user); // Debug log
      
      const response = await fetch("http://localhost:3000/api/tickets", {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.status === 401) {
        console.log('Unauthorized - logging out');
        logout();
        navigate('/login');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Tickets received:', data); // Debug log
      
      // The backend now handles filtering, but we'll do a client-side check as well
      const filteredTickets = data;
      
      setTickets(filteredTickets);
      setError(null);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("Failed to load tickets. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh tickets
  const refreshTickets = () => {
    if (user) {
      fetchTickets();
    }
  };

  // Set up a listener for the popstate event to detect when user navigates back
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/dashboard') {
        refreshTickets();
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [user]);

  // Initial fetch and setup
  useEffect(() => {
    // Only fetch tickets if user is authenticated
    if (user) {
      fetchTickets();
      
      // Also check for a refresh flag in session storage
      const shouldRefresh = sessionStorage.getItem('shouldRefreshTickets');
      if (shouldRefresh) {
        fetchTickets();
        sessionStorage.removeItem('shouldRefreshTickets');
      }
    } else {
      // If no user is found, redirect to login
      navigate('/login');
    }
  }, [user]);

  const handleDelete = async (ticketId) => {
    if (window.confirm("Are you sure you want to delete this ticket?")) {
      try {
        setDeletingId(ticketId);
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete ticket');
        }
        
        setTickets(tickets.filter(ticket => ticket._id !== ticketId));
      } catch (err) {
        console.error('Error deleting ticket:', err);
        alert('Failed to delete ticket. Please try again.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.token?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Redirect to login if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-orange-100 border-t-orange-500 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent border-r-amber-400 animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <p className="text-amber-800 font-semibold text-lg">Loading your tickets...</p>
          <p className="text-amber-600 text-sm mt-1">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm p-10 rounded-3xl shadow-2xl border border-orange-200 max-w-md text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Dashboard</h1>
              <button
                onClick={() => setShowScreenshotModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Camera size={18} />
                <span>Report an Issue</span>
              </button>
            </div>
          </div>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {error === 'Forbidden' 
              ? 'You do not have permission to view this page.' 
              : error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl mb-3"
          >
            <RefreshCw className="w-5 h-5 inline mr-2" />
            Try Again
          </button>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-2xl transition-all duration-300"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/30 to-amber-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-red-200/30 to-orange-200/30 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="bg-white/70 backdrop-blur-md border-b border-orange-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-red-600 bg-clip-text text-transparent">
                Support Dashboard
              </h1>
              <p className="text-amber-700/80 font-medium">Manage and track your support tickets seamlessly</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Bar */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600/60 w-5 h-5 transition-colors group-focus-within:text-orange-600" />
                <input
                  type="text"
                  placeholder="Search tickets, names, tokens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3.5 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 outline-none transition-all duration-300 w-full sm:w-72 bg-white/90 backdrop-blur-sm text-gray-900 placeholder-amber-600/60"
                />
              </div>
              
              {/* Status Filter */}
              <div className="relative group">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600/60 w-5 h-5 transition-colors group-focus-within:text-orange-600" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-12 pr-10 py-3.5 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 outline-none transition-all duration-300 bg-white/90 backdrop-blur-sm appearance-none cursor-pointer text-gray-900"
                >
                  <option value="All">All Status</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              
              {/* Refresh Button */}
              <button 
                onClick={fetchTickets}
                className="flex items-center gap-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold py-3.5 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl whitespace-nowrap"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-orange-200/50 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Ticket className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-amber-700 text-sm font-semibold uppercase tracking-wider">Total Tickets</p>
                <p className="text-3xl font-bold text-gray-900">{tickets.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-orange-200/50 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-amber-700 text-sm font-semibold uppercase tracking-wider">Open</p>
                <p className="text-3xl font-bold text-gray-900">
                  {tickets.filter(t => t.status === "Open").length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-orange-200/50 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <RefreshCw className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-amber-700 text-sm font-semibold uppercase tracking-wider">In Progress</p>
                <p className="text-3xl font-bold text-gray-900">
                  {tickets.filter(t => t.status === "In Progress").length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-orange-200/50 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-gray-500 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Ticket className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-amber-700 text-sm font-semibold uppercase tracking-wider">Closed</p>
                <p className="text-3xl font-bold text-gray-900">
                  {tickets.filter(t => t.status === "Closed").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          <Cards 
            tickets={filteredTickets} 
            deletingId={deletingId}
            onDelete={handleDelete}
          />
        </div>

        {/* Results Summary */}
        {filteredTickets.length > 0 && (searchTerm || statusFilter !== "All") && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl border border-orange-200/50 shadow-lg">
              <Search className="w-5 h-5 text-amber-600" />
              <p className="text-amber-800 font-semibold">
                Showing {filteredTickets.length} of {tickets.length} tickets
                {searchTerm && ` matching "${searchTerm}"`}
                {statusFilter !== "All" && ` with status "${statusFilter}"`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Screenshot Upload Modal */}
      {showScreenshotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl relative">
            <button
              onClick={() => setShowScreenshotModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <ScreenshotUpload onClose={() => setShowScreenshotModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;