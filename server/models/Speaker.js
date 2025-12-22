const mongoose = require("mongoose");

const speakerSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true }, // e.g., "Senior Engineer @ Google"
    specialty: { type: String, required: true }, // e.g., "React & TypeScript"
    bio: { type: String },
    imageUrl: { type: String }, // Stores "/uploads/filename.jpg"
    
    // Social Links (Updated)
    linkedinUrl: { type: String },
    githubUrl: { type: String },
    whatsappNumber: { type: String }, // 👈 Added WhatsApp, Removed Twitter
  },
  { timestamps: true }
);

module.exports = mongoose.model("Speaker", speakerSchema);