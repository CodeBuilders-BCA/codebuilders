const mongoose = require("mongoose");

const volunteerSchema = mongoose.Schema(
  {
    // Link to a User account (so they can log in to the Volunteer Panel)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional: You might create a volunteer record before they sign up
    },
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true 
    },
    phone: { 
      type: String 
    },
    role: {
      type: String,
      enum: ["Check-in", "Usher", "General", "Support"],
      default: "Check-in",
    },
    // The specific event they are assigned to manage
    assignedEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Volunteer", volunteerSchema);