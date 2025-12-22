const mongoose = require("mongoose");

const eventSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String, // Short description for cards
      required: true,
    },
    fullDescription: {
      type: String, // Long description for detail page
    },
    venue: {
      type: String,
      required: true,
    },
    
    // 👇 ADDED: Google Maps Link Field
    mapUrl: {
      type: String, 
    },

    dateTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "past", "cancelled"],
      default: "upcoming",
    },
    maxAttendees: {
      type: Number,
      default: 100,
    },
    
    // --- Images ---
    imageUrl: {
      type: String, // Main Event Thumbnail: "/uploads/filename.jpg"
    },
    
    // Legacy simple gallery (Keep this if you use it elsewhere, or migrate to memories)
    galleryImages: [
      {
        type: String,
      },
    ],

    // 👇 NEW: Memories Gallery (for the Admin Upload & Memories Page)
    // We use an Array of Objects so each image gets a unique _id for easier deletion
    memories: [
      {
        url: { type: String, required: true },
        publicId: { type: String }, // Stores filename for local deletion
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    
    // --- Registration Logic ---
    isRegistrationEnabled: {
      type: Boolean,
      default: true,
    },

    // --- Certificate Logic ---
    isCertificateEnabled: {
      type: Boolean,
      default: false,
    },
    certificateTemplateUrl: {
      type: String, // Stores "/uploads/cert-template.jpg"
    },
    // Coordinates to know where to print the Name on the PDF
    certNameX: {
      type: Number,
      default: 300, 
    },
    certNameY: {
      type: Number,
      default: 250,
    },
    certFontSize: {
      type: Number,
      default: 30,
    },
    certFontFamily: { 
      type: String, 
      default: "Helvetica", // Options: Helvetica, Times, Courier, Cursive
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;