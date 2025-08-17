import React, { useEffect, useState } from "react";

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/api/tickets");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTickets(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setError("Failed to load tickets. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Support Tickets</h1>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Refresh
        </button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map(ticket => (
          <div
            key={ticket._id}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200"
          >
            <h2 className="text-lg font-bold text-blue-700">
              Token: {ticket.token}
            </h2>
            <p className="text-gray-600">👤 {ticket.name}</p>
            <p className="text-gray-600">📧 {ticket.email}</p>
            <p className="text-gray-600">📞 {ticket.phone}</p>
            <p className="font-semibold mt-2">📌 {ticket.subject}</p>
            <details className="mt-2">
              <summary className="cursor-pointer text-blue-500">Read More</summary>
              <p className="text-gray-700 mt-1">{ticket.description}</p>
            </details>
            <span
              className={`inline-block mt-4 px-3 py-1 rounded-full text-sm font-medium ${
                ticket.status === "Open"
                  ? "bg-green-100 text-green-700"
                  : ticket.status === "In Progress"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {ticket.status}
            </span>
          </div>
        ))}
        {tickets.length === 0 ? (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500 text-lg">No tickets found. Create your first ticket!</p>
          </div>
        ) : (
          tickets.map(ticket => (
            <div
              key={ticket._id}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200"
            >
              <h2 className="text-lg font-bold text-blue-700">
                Token: {ticket.token}
              </h2>
              <p className="text-gray-600">👤 {ticket.name}</p>
              <p className="text-gray-600">📧 {ticket.email}</p>
              <p className="text-gray-600">📞 {ticket.phone}</p>
              <p className="font-semibold mt-2">📌 {ticket.subject}</p>
              <details className="mt-2">
                <summary className="cursor-pointer text-blue-500">Read More</summary>
                <p className="text-gray-700 mt-1">{ticket.description}</p>
              </details>
              <span
                className={`inline-block mt-4 px-3 py-1 rounded-full text-sm font-medium ${
                  ticket.status === "Open"
                    ? "bg-green-100 text-green-700"
                    : ticket.status === "In Progress"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {ticket.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
