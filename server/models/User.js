const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "volunteer"], 
      default: "user",
    },
    // Volunteer ke liye extra fields (optional)
    assignedEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    
    // 👇 NEW FIELDS FOR FORGOT PASSWORD
    resetPasswordOtp: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
  },
  {
    timestamps: true, // CreatedAt aur UpdatedAt apne aap aa jayenge
  }
);

// Password check karne ka method (Login ke waqt kaam aayega)
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Password save karne se pehle encrypt (hash) karein
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

module.exports = User;