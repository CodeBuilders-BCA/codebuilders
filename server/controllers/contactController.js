const Contact = require("../models/Contact");

// @desc    Submit a contact form (Public)
// @route   POST /api/contact
const submitContactForm = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Please fill in all required fields" });
  }

  const contact = await Contact.create({
    name,
    email,
    subject,
    message,
  });

  res.status(201).json({ message: "Message sent successfully", contact });
};

// @desc    Get all messages (Admin only)
// @route   GET /api/contact
const getAllMessages = async (req, res) => {
  const messages = await Contact.find({}).sort({ createdAt: -1 }); // Latest first
  res.json(messages);
};

// @desc    Delete a message (Admin only)
// @route   DELETE /api/contact/:id
const deleteMessage = async (req, res) => {
  const message = await Contact.findById(req.params.id);

  if (message) {
    await message.deleteOne();
    res.json({ message: "Message deleted" });
  } else {
    res.status(404).json({ message: "Message not found" });
  }
};

// 👇 Ye sabse zaroori line hai, teeno functions export hone chahiye
module.exports = { 
  submitContactForm, 
  getAllMessages, 
  deleteMessage 
};