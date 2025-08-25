const express = require("express");
const Ticket = require("../models/Ticket");
const { sendTicketConfirmation } = require("../services/emailService");
const router = express.Router();

// Function to generate Token ID
function generateToken() {
  const now = new Date();
  const dateStr = now
    .toISOString()
    .replace(/[-:TZ.]/g, "") // YYYYMMDDHHMMSS
    .slice(0, 12);           // Keep till HHMM
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randStr = "";
  for (let i = 0; i < 4; i++) {
    randStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return dateStr + randStr; // Example: 202508180143ABCD
}

// POST → Create Ticket
router.post("/", async (req, res) => {
  try {
    const token = generateToken();
    const ticket = new Ticket({ ...req.body, token });
    await ticket.save();
    
    // Send email notification (don't await to avoid delaying the response)
    sendTicketConfirmation(ticket).catch(console.error);
    
    res.json({ success: true, ticket });
  } catch (err) {
    console.error('Error creating ticket:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET → Get all Tickets
router.get("/", async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH → Update Ticket Status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['Open', 'In Progress', 'Closed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE → Delete a Ticket
router.delete("/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }
    res.json({ success: true, message: 'Ticket deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
