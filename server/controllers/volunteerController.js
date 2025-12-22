const Volunteer = require("../models/Volunteer");
const User = require("../models/User");

// @desc    Get all volunteers
// @route   GET /api/volunteers
const getVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find({})
      .populate("assignedEventId", "title")
      .populate("user", "isActive"); // Populate user to see active status

    // Format for frontend
    const formatted = volunteers.map(vol => ({
      _id: vol._id,
      name: vol.name,
      email: vol.email,
      phone: vol.phone,
      assignedEventId: vol.assignedEventId,
      // Use the linked User's active status, default to true if no user linked
      isActive: vol.user ? vol.user.isActive : true, 
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create a volunteer (Creates User + Volunteer Profile)
// @route   POST /api/volunteers
const createVolunteer = async (req, res) => {
  try {
    const { name, email, password, phone, role, assignedEventId, isActive } = req.body;

    // 1. Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, Email, and Password are required" });
    }

    // 2. Check if User already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // 3. Create User Account (For Login)
    const user = await User.create({
      name,
      email,
      password, // Password is hashed automatically by User model
      role: "volunteer",
      isActive: isActive !== undefined ? isActive : true,
    });

    // 4. Create Volunteer Profile (Linked to User)
    const volunteer = await Volunteer.create({
      user: user._id,
      name,
      email,
      phone,
      role: role || "Check-in",
      assignedEventId: assignedEventId === "unassigned" ? null : assignedEventId,
    });

    res.status(201).json(volunteer);
  } catch (error) {
    console.error("Create Volunteer Error:", error);
    res.status(500).json({ message: error.message || "Failed to create volunteer" });
  }
};

// @desc    Update a volunteer
// @route   PUT /api/volunteers/:id
const updateVolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);

    if (volunteer) {
      // Update Volunteer Details
      volunteer.name = req.body.name || volunteer.name;
      volunteer.email = req.body.email || volunteer.email;
      volunteer.phone = req.body.phone || volunteer.phone;
      volunteer.assignedEventId = req.body.assignedEventId || volunteer.assignedEventId;

      const updatedVolunteer = await volunteer.save();

      // Sync changes to the Linked User Account (if exists)
      if (volunteer.user) {
        const user = await User.findById(volunteer.user);
        if (user) {
          user.name = req.body.name || user.name;
          user.email = req.body.email || user.email; // Keep emails in sync
          if (req.body.isActive !== undefined) user.isActive = req.body.isActive;
          
          // Only update password if a new one is provided
          if (req.body.password) {
            user.password = req.body.password; 
          }
          await user.save();
        }
      }

      res.json(updatedVolunteer);
    } else {
      res.status(404).json({ message: "Volunteer not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete a volunteer
// @route   DELETE /api/volunteers/:id
const deleteVolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);

    if (volunteer) {
      // Optional: Delete the linked User account too
      if (volunteer.user) {
        await User.findByIdAndDelete(volunteer.user);
      }
      
      await volunteer.deleteOne();
      res.json({ message: "Volunteer and linked User removed" });
    } else {
      res.status(404).json({ message: "Volunteer not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get current volunteer's profile
// @route   GET /api/volunteers/me
const getVolunteerProfile = async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ user: req.user._id })
      .populate("assignedEventId", "title dateTime venue");

    if (volunteer) {
      res.json(volunteer);
    } else {
      res.status(404).json({ message: "Volunteer profile not found for this user." });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getVolunteers,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
  getVolunteerProfile,
};