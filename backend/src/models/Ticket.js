const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

const ticketSchema = new mongoose.Schema({
  ticketId: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => `TKT-${uuidv4()}`
  },
  token: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  subject: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["Open", "In Progress", "Closed"],
    default: "Open" 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Add a pre-save hook to ensure ticketId is unique
ticketSchema.pre('save', async function(next) {
  if (!this.isNew) return next();
  
  // This is just an extra safety check as the schema already handles the unique constraint
  const existingTicket = await this.constructor.findOne({ ticketId: this.ticketId });
  if (existingTicket) {
    // If by any chance the ticketId is not unique, generate a new one
    this.ticketId = `TKT-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model("Ticket", ticketSchema);
