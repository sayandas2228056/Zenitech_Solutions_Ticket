const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  name: String,
  phone: String,
  email: String,
  subject: String,
  description: String,
  status: { type: String, default: "Open" }, // Open | In Progress | Closed
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Ticket", ticketSchema);
