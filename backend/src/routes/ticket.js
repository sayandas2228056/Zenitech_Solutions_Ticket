const express = require("express");
const Ticket = require("../models/Ticket");
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
    res.json({ success: true, ticket });
  } catch (err) {
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

module.exports = router;
