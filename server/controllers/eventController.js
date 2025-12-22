const Event = require("../models/Event");
const Registration = require("../models/Registration"); 
const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb } = require('pdf-lib'); 
const fontkit = require('@pdf-lib/fontkit');     
const nodemailer = require('nodemailer');        
const axios = require('axios');                  

// @desc    Create an event
// @route   POST /api/events
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      fullDescription,
      venue,
      dateTime,
      maxAttendees,
      status,
      isRegistrationEnabled,
      isCertificateEnabled,
      certNameX,
      certNameY,
      certFontSize,
      certFontFamily,
      mapUrl, // 👈 1. Extract mapUrl
    } = req.body;

    let imageUrl = null;
    let certificateTemplateUrl = null;

    if (req.files && req.files.image) {
      imageUrl = `/uploads/${req.files.image[0].filename}`;
    }

    if (req.files && req.files.certFile) {
      certificateTemplateUrl = `/uploads/${req.files.certFile[0].filename}`;
    }

    const event = await Event.create({
      title,
      description,
      fullDescription,
      venue,
      dateTime,
      maxAttendees,
      status,
      imageUrl,
      mapUrl, // 👈 2. Save mapUrl to database
      isRegistrationEnabled: isRegistrationEnabled === "true",
      isCertificateEnabled: isCertificateEnabled === "true",
      certificateTemplateUrl,
      certNameX,
      certNameY,
      certFontSize,
      certFontFamily: certFontFamily || "Helvetica", 
      memories: []
    });

    res.status(201).json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      event.title = req.body.title || event.title;
      event.description = req.body.description || event.description;
      event.fullDescription = req.body.fullDescription || event.fullDescription;
      event.venue = req.body.venue || event.venue;
      
      // 👇 3. Update mapUrl logic
      event.mapUrl = req.body.mapUrl || event.mapUrl;

      event.dateTime = req.body.dateTime || event.dateTime;
      event.maxAttendees = req.body.maxAttendees || event.maxAttendees;
      event.status = req.body.status || event.status;
      
      if (req.body.isRegistrationEnabled !== undefined) {
         event.isRegistrationEnabled = req.body.isRegistrationEnabled === "true";
      }
      if (req.body.isCertificateEnabled !== undefined) {
         event.isCertificateEnabled = req.body.isCertificateEnabled === "true";
      }

      event.certNameX = req.body.certNameX || event.certNameX;
      event.certNameY = req.body.certNameY || event.certNameY;
      event.certFontSize = req.body.certFontSize || event.certFontSize;
      event.certFontFamily = req.body.certFontFamily || event.certFontFamily;

      if (req.files && req.files.image) {
        event.imageUrl = `/uploads/${req.files.image[0].filename}`;
      }
      
      if (req.files && req.files.certFile) {
        event.certificateTemplateUrl = `/uploads/${req.files.certFile[0].filename}`;
      }

      const updatedEvent = await event.save();
      res.json(updatedEvent);
    } else {
      res.status(404).json({ message: "Event not found" });
    }
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all events
// @route   GET /api/events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({}).sort({ dateTime: 1 });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: "Event not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (event) {
      await event.deleteOne();
      res.json({ message: "Event removed" });
    } else {
      res.status(404).json({ message: "Event not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ---------------------------------------------------------
// 👇 MEMORIES FUNCTIONS
// ---------------------------------------------------------

const getEventMemories = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).select('memories');
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event.memories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadEventMemories = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`;
    
    const newMemories = req.files.map(file => ({
      url: baseUrl + file.filename,
      publicId: file.filename 
    }));

    event.memories.push(...newMemories);
    await event.save();

    res.status(200).json(event.memories);
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteEventMemory = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    const event = await Event.findById(id);

    if (!event) return res.status(404).json({ message: "Event not found" });

    const memory = event.memories.id(imageId);
    if (!memory) return res.status(404).json({ message: "Image not found" });

    if (memory.publicId) {
       const filePath = path.join(__dirname, '../uploads', memory.publicId);
       if (fs.existsSync(filePath)) {
         fs.unlinkSync(filePath);
       }
    }

    event.memories.pull(imageId);
    await event.save();

    res.json({ message: "Memory deleted successfully" });
  } catch (error) {
    console.error("Delete Memory Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------
// 👇 CERTIFICATE GENERATION & EMAIL LOGIC
// ---------------------------------------------------------

// @desc    Send Certificates to all attendees
// @route   POST /api/events/:id/certificates/send
const sendCertificates = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // 1. Find Registrations
    const registrations = await Registration.find({
      $or: [{ eventId: req.params.id }, { event: req.params.id }]
    });
    
    if (registrations.length === 0) {
      return res.status(400).json({ message: "No registrations found for this event." });
    }

    if (!event.certificateTemplateUrl) {
      return res.status(400).json({ message: "No certificate template uploaded." });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS,
      },
    });

    // 2. Load Resources
    const templatePath = path.join(__dirname, '..', event.certificateTemplateUrl);
    if (!fs.existsSync(templatePath)) {
        return res.status(400).json({ message: "Template file missing on server." });
    }
    const templateImageBytes = fs.readFileSync(templatePath);

    // Fetch Font
    let fontBytes;
    const fontFamily = event.certFontFamily || "Helvetica";
    if (fontFamily.includes("Great Vibes")) {
       try {
         const fontUrl = 'https://github.com/google/fonts/raw/main/ofl/greatvibes/GreatVibes-Regular.ttf';
         const response = await axios.get(fontUrl, { responseType: 'arraybuffer' });
         fontBytes = response.data;
       } catch (err) { console.error("Font fetch failed:", err); }
    } 

    let sentCount = 0;

    for (const reg of registrations) {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);

      // Embed Image (Handle PNG vs JPG)
      let image;
      const isPng = event.certificateTemplateUrl.toLowerCase().endsWith('.png');
      try {
        image = isPng ? await pdfDoc.embedPng(templateImageBytes) : await pdfDoc.embedJpg(templateImageBytes);
      } catch (e) {
        try { image = isPng ? await pdfDoc.embedJpg(templateImageBytes) : await pdfDoc.embedPng(templateImageBytes); } 
        catch (finalErr) { continue; }
      }

      // Get Actual Image Dimensions (e.g., 2000px width)
      const { width, height } = image.scale(1);
      const page = pdfDoc.addPage([width, height]);
      page.drawImage(image, { x: 0, y: 0, width, height });

      // Embed Font
      let customFont;
      if (fontBytes) customFont = await pdfDoc.embedFont(fontBytes);
      else if (fontFamily.includes("Times")) customFont = await pdfDoc.embedFont("Times-Roman");
      else if (fontFamily.includes("Courier")) customFont = await pdfDoc.embedFont("Courier");
      else customFont = await pdfDoc.embedFont("Helvetica");

      // -----------------------------------------------------------
      // 🎯 EXACT POSITIONING LOGIC
      // -----------------------------------------------------------
      
      // 1. Define Frontend Reference Width
      // This MUST match the value in your React code (800)
      const DESIGNER_WIDTH = 800; 

      // 2. Calculate Scale (Real Image / Frontend Image)
      const scale = width / DESIGNER_WIDTH;

      // 3. Get Saved Coordinates (default to center if missing)
      const savedX = event.certNameX !== undefined ? event.certNameX : 250;
      const savedY = event.certNameY !== undefined ? event.certNameY : 250;
      const savedFontSize = event.certFontSize || 30;

      // 4. Calculate Final Values
      const finalX = savedX * scale;
      const finalFontSize = savedFontSize * scale;

      // 5. Calculate Final Y (The most important part)
      // PDF Y = Image Height - (Saved Top Position * Scale) - (Text Height Correction)
      // We subtract ~80% of the font size to align the visual top-left (HTML) with baseline (PDF).
      const finalY = height - (savedY * scale) - (finalFontSize * 0.8);

      const attendeeName = reg.userName || reg.name || "Attendee";
      const attendeeEmail = reg.userEmail || reg.email;

      if (attendeeEmail) {
        page.drawText(attendeeName, {
          x: finalX,
          y: finalY, 
          size: finalFontSize,
          font: customFont,
          color: rgb(0, 0, 0),
        });

        const pdfBytes = await pdfDoc.save();

        // 👇 UPDATED EMAIL CONTENT & FILENAME LOGIC
        const fileName = `${attendeeName.replace(/ /g, "_")}_Certificate.pdf`;

        await transporter.sendMail({
          from: '"Code Builders Team" <no-reply@codebuilders.com>',
          to: attendeeEmail,
          subject: `Your Certificate for ${event.title}`, // Subject Line
          text: `Hi ${attendeeName},\n\nThank you for attending ${event.title}. Please find your certificate attached.\n\nBest,\nThe Code Builders Team`,
          attachments: [{
            filename: fileName,
            content: Buffer.from(pdfBytes),
            contentType: 'application/pdf',
          }],
        });
        sentCount++;
      }
    }

    res.status(200).json({ message: `Sent ${sentCount} emails.` });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  createEvent, 
  updateEvent, 
  getEvents, 
  getEventById, 
  deleteEvent,
  getEventMemories,
  uploadEventMemories,
  deleteEventMemory,
  sendCertificates 
};