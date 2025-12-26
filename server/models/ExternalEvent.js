const mongoose = require("mongoose");

const externalEventSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["event", "hackathon"],
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    venue: {
      type: String,
    },
    organizer: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "past"],
      default: "upcoming",
    },
  },
  {
    timestamps: true,
  }
);

const ExternalEvent = mongoose.model("ExternalEvent", externalEventSchema);

module.exports = ExternalEvent;