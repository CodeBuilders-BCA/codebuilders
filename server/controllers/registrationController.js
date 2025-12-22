const Registration = require("../models/Registration");
const Event = require("../models/Event");
// 👇 1. Import your central email helper instead of nodemailer directly
const sendEmail = require("../utils/sendEmail"); 
const { generateTicketPDF } = require("../utils/generateTicket"); 

// @desc    Register for an event & Send Ticket Email
// @route   POST /api/registrations
const registerForEvent = async (req, res) => {
  try {
    const { eventId, userName, userEmail, userPhone } = req.body;

    // 1. Check duplicate registration
    const existingReg = await Registration.findOne({ eventId, userEmail });
    if (existingReg) {
      return res.status(400).json({ message: "User already registered for this event" });
    }

    // 2. Fetch Event Details
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // 3. Create Registration
    const registration = await Registration.create({
      eventId,
      userId: req.user ? req.user._id : null, 
      userName,
      userEmail,
      userPhone,
    });

    // 4. Generate PDF Ticket
    let pdfBuffer;
    try {
      console.log("Generating PDF for:", userName); 
      pdfBuffer = await generateTicketPDF(registration, event);
      console.log("PDF Generated successfully. Size:", pdfBuffer.length); 
    } catch (pdfError) {
      console.error("❌ PDF Generation Failed:", pdfError);
    }

    // 5. Send Email (Using Helper)
    const ticketLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/ticket/${registration.tokenId}`;
    const uniqueRef = new Date().getTime().toString(36); // Anti-collapse trick

    // HTML Content for the email
    const emailHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        
        <div style="background-color: #3730a3; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="color: #ffffff; margin: 0;">Registration Confirmed!</h2>
        </div>

        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px;">Hi <strong>${userName}</strong>,</p>
          <p>You are all set for <strong>${event.title}</strong>.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 5px 0;">📅 <strong>Date:</strong> ${new Date(event.dateTime).toLocaleString()}</p>
            <p style="margin: 5px 0;">📍 <strong>Venue:</strong> ${event.venue}</p>
            <p style="margin: 5px 0;">🎟️ <strong>Token ID:</strong> <span style="font-family: monospace;">${registration.tokenId}</span></p>
          </div>

          <p>Your <strong>e-Ticket PDF</strong> is attached to this email. Please scan the QR code at the entrance.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${ticketLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Mobile Ticket</a>
          </div>
          
          <br/>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          
          <div style="text-align: center; font-size: 12px; color: #888;">
            <p style="margin: 5px 0;">CodeBuilders Community Team</p>
            <span style="opacity: 0; font-size: 1px; color: transparent; display: none;">Ref: ${uniqueRef}</span>
          </div>
        </div>
      </div>
    `;

    // Send the email 
    try {
      await sendEmail({
        email: userEmail,
        subject: `Your Ticket: ${event.title}`,
        html: emailHtml,
        message: `You are registered for ${event.title}. View ticket: ${ticketLink}`, // Fallback text
        attachments: pdfBuffer ? [
          {
            filename: `${event.title.replace(/[^a-z0-9]/gi, '_')}_Ticket.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ] : [],
      });
      console.log(`Email sent to ${userEmail}`);
    } catch (emailErr) {
      console.error("Email Sending Failed:", emailErr);
      // We don't block the response here, user is still registered
    }

    res.status(201).json(registration);
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ... keep your other exports (getTicketByToken, etc.) as they are ...
const getTicketByToken = async (req, res) => {
    // ... your existing code
    try {
        const registration = await Registration.findOne({ tokenId: req.params.tokenId })
          .populate("eventId", "title venue dateTime fullDescription"); 
        if (registration) {
          res.json(registration);
        } else {
          res.status(404).json({ message: "Ticket not found" });
        }
      } catch (error) {
        res.status(500).json({ message: "Server Error" });
      }
};

const getEventRegistrations = async (req, res) => {
    // ... your existing code
    try {
        const registrations = await Registration.find({ eventId: req.params.eventId });
        res.json(registrations);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
};

const getAllRegistrations = async (req, res) => {
    // ... your existing code
    try {
        let query = {};
        if (req.query.eventId && req.query.eventId !== 'all') {
          query.eventId = req.query.eventId;
        }
        const registrations = await Registration.find(query)
          .populate("eventId", "title dateTime") 
          .sort({ createdAt: -1 });
        res.json(registrations);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
};

const checkInRegistration = async (req, res) => {
    // ... your existing code
    try {
        const registration = await Registration.findOne({ tokenId: req.params.tokenId });
        if (registration) {
          registration.isAttended = true;
          registration.status = "attended";
          const updatedReg = await registration.save();
          res.json({
              _id: updatedReg._id,
              userName: updatedReg.userName,
              userEmail: updatedReg.userEmail,
              tokenId: updatedReg.tokenId,
              isAttended: updatedReg.isAttended
          });
        } else {
          res.status(404).json({ message: "Registration token not found" });
        }
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
};

const updateAttendance = async (req, res) => {
    // ... your existing code
    try {
        const registration = await Registration.findById(req.params.id);
        if (registration) {
          registration.isAttended = req.body.isAttended;
          registration.status = req.body.isAttended ? "attended" : "registered";
          const updatedReg = await registration.save();
          res.json(updatedReg);
        } else {
          res.status(404).json({ message: "Registration not found" });
        }
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
};

const deleteRegistration = async (req, res) => {
    // ... your existing code
    try {
        const registration = await Registration.findById(req.params.id);
        if (registration) {
          await registration.deleteOne();
          res.json({ message: "Registration cancelled" });
        } else {
          res.status(404).json({ message: "Registration not found" });
        }
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
};

module.exports = {
  registerForEvent,
  getTicketByToken,
  getEventRegistrations,
  getAllRegistrations,
  checkInRegistration,
  updateAttendance,
  deleteRegistration,
};