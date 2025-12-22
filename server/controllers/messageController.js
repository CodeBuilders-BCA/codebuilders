const Message = require("../models/Message");
const nodemailer = require("nodemailer");

// @desc    Send a new message (Save DB + Email)
// @route   POST /api/messages
const sendMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // 1. Save to MongoDB (For Admin Panel)
    const newMessage = await Message.create({
      name,
      email,
      subject,
      message,
    });

    // 2. Send Email (using Nodemailer)
    // Configure your email service (Gmail, Outlook, etc.)
    const transporter = nodemailer.createTransport({
      service: "gmail", // or 'outlook', 'hotmail'
      auth: {
        user: process.env.EMAIL_USER, // Add these to your .env file
        pass: process.env.EMAIL_PASS, // App Password (not your login password)
      },
    });

    const mailOptions = {
      from: `"CodeBuilders Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself/admin
      replyTo: email, // Allow replying directly to the user
      subject: `New Contact Form: ${subject}`,
      html: `
        <h3>New Message from CodeBuilders Website</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr/>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    console.error("Message Error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// @desc    Get all messages (For Admin Panel)
// @route   GET /api/messages
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({}).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
const deleteMessage = async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (msg) {
      await msg.deleteOne();
      res.json({ message: "Message removed" });
    } else {
      res.status(404).json({ message: "Message not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { sendMessage, getMessages, deleteMessage };