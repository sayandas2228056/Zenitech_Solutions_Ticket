import React from "react";
import { Ticket, User, Mail, Phone, Clock, Trash2, Eye, Calendar } from "lucide-react";

const Cards = ({ tickets, deletingId, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-green-50 text-green-800 border-green-200 shadow-green-100";
      case "In Progress":
        return "bg-yellow-50 text-yellow-800 border-yellow-200 shadow-yellow-100";
      case "Closed":
        return "bg-red-50 text-red-800 border-red-200 shadow-red-100";
      default:
        return "bg-orange-50 text-orange-800 border-orange-200 shadow-orange-100";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-500 shadow-red-200";
      case "medium":
        return "bg-amber-500 shadow-amber-200";
      case "low":
        return "bg-emerald-500 shadow-emerald-200";
      default:
        return "bg-orange-500 shadow-orange-200";
    }
  };

  if (tickets.length === 0) {
    return (
      <div className="col-span-full">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-orange-200/50 p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Ticket className="w-12 h-12 text-orange-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No tickets found</h3>
          <p className="text-amber-700/80 text-lg leading-relaxed max-w-md mx-auto">
            Try adjusting your search or filter criteria to find what you're looking for
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {tickets.map((ticket, index) => (
        <div
          key={ticket._id}
          className="group bg-white/85 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl border border-orange-200/50 overflow-hidden transition-all duration-500 transform hover:-translate-y-2 hover:rotate-1"
          style={{
            animationDelay: `${index * 150}ms`,
            animation: 'slideInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          {/* Card Header with Token */}
          <div className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-6 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-orange-100 text-xs uppercase tracking-wider font-medium">Token</p>
                    <p className="font-bold text-xl">#{ticket.token}</p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full ${getPriorityColor(ticket.priority || 'medium')} shadow-lg`}></div>
              </div>
              <h3 className="font-bold text-xl mb-2 leading-tight line-clamp-2">{ticket.subject}</h3>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 text-orange-100">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Support Request</span>
                </div>
                <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  {new Date(ticket.createdAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-5">
            {/* Customer Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-sm">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider">Customer</p>
                  <p className="font-bold text-gray-900">{ticket.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-blue-700 font-semibold uppercase tracking-wider">Email</p>
                  <p className="text-sm text-gray-800 truncate">{ticket.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-sm">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Phone</p>
                  <p className="text-sm text-gray-800">{ticket.phone}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gradient-to-r from-gray-50 to-orange-50/50 rounded-2xl p-4 border border-gray-200">
              <details className="group/details">
                <summary className="cursor-pointer text-amber-800 font-semibold hover:text-orange-700 transition-colors duration-200 flex items-center gap-2 list-none">
                  <Eye className="w-4 h-4" />
                  <span>View Description</span>
                  <span className="text-xs text-amber-600 group-open/details:hidden ml-auto">Click to expand</span>
                </summary>
                <div className="mt-4 p-4 bg-white/80 rounded-xl text-gray-700 text-sm leading-relaxed border border-orange-100">
                  {ticket.description}
                </div>
              </details>
            </div>

            {/* Status Display and Actions */}
            <div className="flex items-center justify-between pt-3">
              <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold border shadow-sm ${getStatusColor(ticket.status)}`}>
                {ticket.status || 'Open'}
              </div>
              <button
                onClick={() => onDelete(ticket._id)}
                disabled={deletingId === ticket._id}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                  deletingId === ticket._id
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    : 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 hover:from-red-500 hover:to-red-600 hover:text-white border border-red-200 hover:border-red-500 transform hover:scale-105 shadow-sm hover:shadow-lg'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                {deletingId === ticket._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
};

export default Cards;