const TeamMember = require("../models/TeamMember");
const cloudinary = require("cloudinary").v2;

// 1️⃣ Cloudinary Config (Only needed here for Deletion logic)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ❌ Removed: streamifier and uploadToCloudinary helper function
// (Your middleware now handles uploads automatically)

// @desc    Get all team members
// @route   GET /api/team-members
const getTeamMembers = async (req, res) => {
  try {
    const teamMembers = await TeamMember.find({});
    res.json(teamMembers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a team member
// @route   POST /api/team-members
const createTeamMember = async (req, res) => {
  try {
    const { 
      name, role, specialty, bio, linkedinUrl, githubUrl, whatsappNumber 
    } = req.body;

    let imageUrl = "";

    // ✅ UPDATED: Get URL directly from Middleware
    // Middleware uploads the file and puts the details in req.file
    if (req.file) {
      imageUrl = req.file.path; // Cloudinary URL
    }

    const teamMember = await TeamMember.create({
      name,
      role,
      specialty,
      bio,
      linkedinUrl,
      githubUrl,
      whatsappNumber,
      imageUrl, // Saved as full URL
    });

    res.status(201).json(teamMember);
  } catch (error) {
    console.error("Error creating team member:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a team member
// @route   PUT /api/team-members/:id
const updateTeamMember = async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);

    if (teamMember) {
      teamMember.name = req.body.name || teamMember.name;
      teamMember.role = req.body.role || teamMember.role;
      teamMember.specialty = req.body.specialty || teamMember.specialty;
      teamMember.bio = req.body.bio || teamMember.bio;
      teamMember.linkedinUrl = req.body.linkedinUrl || teamMember.linkedinUrl;
      teamMember.githubUrl = req.body.githubUrl || teamMember.githubUrl;
      teamMember.whatsappNumber = req.body.whatsappNumber || teamMember.whatsappNumber;

      // ✅ UPDATED: Update Image
      if (req.file) {
        // Optional: If you want to delete the OLD image from Cloudinary, 
        // you would need to store the public_id in your DB or extract it from the old URL.

        teamMember.imageUrl = req.file.path; // Update with new URL
      }

      const updatedTeamMember = await teamMember.save();
      res.json(updatedTeamMember);
    } else {
      res.status(404).json({ message: "Team member not found" });
    }
  } catch (error) {
    console.error("Error updating team member:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a team member
// @route   DELETE /api/team-members/:id
const deleteTeamMember = async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    if (teamMember) {

      // ✅ Optional: Delete image from Cloudinary
      // This extracts "folder/filename" from "https://res.cloudinary.com/.../folder/filename.jpg"
      if (teamMember.imageUrl) {
        try {
            const publicId = teamMember.imageUrl.split('/').slice(-2).join('/').split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        } catch (err) {
            console.error("Failed to delete image from Cloudinary:", err);
        }
      }

      await teamMember.deleteOne();
      res.json({ message: "Team member removed" });
    } else {
      res.status(404).json({ message: "Team member not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember };