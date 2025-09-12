const express = require("express");
const Ticket = require("../models/Ticket");
const { sendTicketConfirmation } = require("../services/emailService");
const { sendScreenshotEmail } = require("../services/screenshotService");
const { authenticateToken, checkRole } = require("../middleware/auth");
const upload = require("../utils/upload");
const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

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
router.post("/", checkRole(['admin', 'support', 'user']), upload.single('attachment'), async (req, res) => {
  try {
    const token = generateToken();
    const userId = req.user.userId || req.user._id; // Handle both userId and _id
    
    // Handle file upload if present
    let attachmentInfo = null;
    if (req.file) {
      attachmentInfo = {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        size: req.file.size,
        buffer: req.file.buffer
      };
    }
    
    console.log('Creating new ticket for user:', userId);
    console.log('Request body:', req.body);
    
    // Prepare ticket data with required fields
    const ticketData = {
      ...req.body,
      token,
      userId: req.user?.userId || req.user?._id, // Ensure userId is set
      status: 'Open', // Must match enum values: 'Open', 'In Progress', 'Closed'
      priority: req.body.priority || 'medium',
      attachments: []
    };
    
    // Remove any undefined fields
    Object.keys(ticketData).forEach(key => {
      if (ticketData[key] === undefined) {
        delete ticketData[key];
      }
    });
    
    // Add attachment info to ticket if file was uploaded
    if (attachmentInfo) {
      ticketData.attachments.push({
        filename: attachmentInfo.filename,
        contentType: attachmentInfo.contentType,
        size: attachmentInfo.size,
        path: 'email-only' // Indicates the file was sent via email, not stored
      });
    }
    
    const ticket = new Ticket(ticketData);
    await ticket.save();
    
    // Generate email subject with ticket ID and subject
    const emailSubject = `[TKT-${ticket._id}] ${req.body.subject || 'No Subject'}`;
    console.log('Ticket saved successfully:', ticket._id);
    
    // Prepare email data
    const emailData = {
      userEmail: req.body.email || req.user?.email,
      userName: req.body.name || req.user?.name || 'User',
      subject: req.body.subject || 'No Subject',
      description: req.body.description || 'No description provided',
      ticketId: ticket._id,
      status: ticket.status
    };
    
    // Send email with attachment if present
    if (attachmentInfo) {
      await sendScreenshotEmail(
        emailData.userEmail,
        emailData.userName,
        emailData.description,
        {
          buffer: attachmentInfo.buffer,
          mimetype: attachmentInfo.contentType,
          originalname: attachmentInfo.filename
        },
        emailSubject
      ).catch(err => {
        console.error('Error sending email with attachment:', err);
      });
    }
    
    // Also send a confirmation email
    sendTicketConfirmation(ticket).catch(err => {
      console.error('Error sending confirmation email:', err);
    });
    
    res.json({ 
      success: true, 
      ticket: {
        ...ticket.toObject(),
        // Ensure we're sending back the correct userId
        userId: ticket.userId.toString()
      }
    });
  } catch (err) {
    console.error('Error creating ticket:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET → Get all Tickets
router.get("/", checkRole(['admin', 'support', 'user']), async (req, res) => {
  try {
    console.log('=== TICKET REQUEST ===');
    const userId = req.user.userId || req.user._id;
    console.log('User making request:', {
      userId: userId,
      role: req.user.role,
      allUserData: req.user
    });
    
    let query = {};
    
    // Regular users can only see their own tickets
    if (req.user.role === 'user') {
      query.userId = userId.toString();
      console.log(`Filtering tickets for user ID: ${userId}`);
    } else {
      console.log('Admin/Support: Showing all tickets');
    }
    
    console.log('MongoDB query:', JSON.stringify(query, null, 2));
    
    // Convert query.userId to string to match stored format
    if (query.userId) {
      query.userId = query.userId.toString();
    }
    
    const tickets = await Ticket.find(query).sort({ createdAt: -1 }).lean();
    
    console.log(`Found ${tickets.length} tickets`);
    if (tickets.length > 0) {
      console.log('Sample ticket:', {
        _id: tickets[0]._id,
        userId: tickets[0].userId,
        status: tickets[0].status,
        subject: tickets[0].subject
      });
    }
    
    // Ensure all userIds are strings in the response
    const sanitizedTickets = tickets.map(ticket => ({
      ...ticket,
      userId: ticket.userId ? ticket.userId.toString() : null
    }));
    
    console.log('Sending response with tickets:', sanitizedTickets.length);
    res.json(sanitizedTickets);
  } catch (err) {
    console.error('Error fetching tickets:', err);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// PATCH → Update Ticket Status
router.patch("/:id/status", checkRole(['admin', 'support']), async (req, res) => {
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
router.delete("/:id", checkRole(['admin', 'support', 'user']), async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }
    
    const userId = req.user.userId || req.user._id;
    
    // Allow delete if user is admin/support OR if user is the ticket owner
    if (req.user.role === 'user' && ticket.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this ticket' });
    }
    
    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Ticket deleted successfully' });
  } catch (err) {
    console.error('Error deleting ticket:', err);
    res.status(500).json({ success: false, error: 'Failed to delete ticket' });
  }
});

module.exports = router;
