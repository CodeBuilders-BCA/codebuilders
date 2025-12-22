const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");

// --- Design Constants ---
const COLORS = {
  primary: "#3730a3", // Deep Indigo
  textDark: "#111827", // Near Black
  textGray: "#6b7280", // Medium Gray
  border: "#e5e7eb",   // Light Gray
};

const generateTicketPDF = async (registration, event) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Setup: A5 Landscape
      const doc = new PDFDocument({ 
        size: "A5", 
        layout: "landscape",
        margins: { top: 0, bottom: 0, left: 0, right: 0 }, // Zero margins for full control
        autoFirstPage: true
      });
      
      const buffers = [];
      doc.on("data", (buffer) => buffers.push(buffer));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      const width = doc.page.width;
      const height = doc.page.height;
      const margin = 25;

      // --- 1. Background Border ---
      doc.lineWidth(2)
         .strokeColor(COLORS.border)
         .rect(margin, margin, width - (margin * 2), height - (margin * 2))
         .stroke();

      // --- 2. Header Strip ---
      const headerHeight = 70;
      doc.rect(margin, margin, width - (margin * 2), headerHeight)
         .fill(COLORS.primary);
      
      // "EVENT TICKET" Title
      doc.fillColor("#FFFFFF")
         .font("Helvetica-Bold")
         .fontSize(24)
         .text("EVENT TICKET", margin + 20, margin + 22, { baseline: 'top' });

      // --- LOGO & COMMUNITY NAME ---
      // Load Logo if exists (Must be PNG/JPG, not ICO)
      const logoPath = path.join(__dirname, "../logo.png"); // 👈 Looks for logo.png in 'server' folder
      const logoSize = 30;
      const textX = width - margin - 20; // Anchor right
      
      if (fs.existsSync(logoPath)) {
        try {
            // Draw Logo (Right aligned relative to text)
            // We place it at: Total Width - Margin - Logo Width - Padding
            const logoX = textX - 160; // Adjust based on text length
            doc.image(logoPath, logoX, margin + 20, { width: logoSize });
            
            // Text next to Logo
            doc.fontSize(12)
               .font("Helvetica")
               .opacity(0.9)
               .text("CodeBuilders Community", logoX + logoSize + 10, margin + 28);
        } catch (e) {
            console.error("Logo Load Error:", e);
        }
      } else {
        // Fallback if no logo found
        doc.fontSize(12)
           .font("Helvetica")
           .opacity(0.9)
           .text("CodeBuilders Community", margin, margin + 28, { align: 'right', width: width - (margin * 2) - 20 });
      }
      
      doc.opacity(1.0); // Reset opacity

      // --- 3. Main Layout ---
      const contentTop = margin + headerHeight + 35;
      const leftColX = margin + 25;
      const rightColX = width * 0.65; // Split at 65% width

      // === LEFT SIDE: DETAILS ===
      doc.fillColor(COLORS.textDark);
      
      // Title
      doc.font("Helvetica-Bold").fontSize(20)
         .text(event.title, leftColX, contentTop, { width: 300, lineGap: 5 });
      
      // Move down dynamically based on title height
      const afterTitleY = doc.y + 15;

      // Date Block
      doc.font("Helvetica").fontSize(9).fillColor(COLORS.textGray)
         .text("DATE & TIME", leftColX, afterTitleY);
      doc.font("Helvetica-Bold").fontSize(12).fillColor(COLORS.textDark)
         .text(new Date(event.dateTime).toLocaleString(), leftColX, doc.y + 4);

      // Venue Block (Shifted down)
      doc.font("Helvetica").fontSize(9).fillColor(COLORS.textGray)
         .text("VENUE", leftColX, doc.y + 15);
      doc.font("Helvetica-Bold").fontSize(12).fillColor(COLORS.textDark)
         .text(event.venue, leftColX, doc.y + 4);

      // Attendee Block (Shifted down)
      doc.font("Helvetica").fontSize(9).fillColor(COLORS.textGray)
         .text("ATTENDEE", leftColX, doc.y + 15);
      doc.font("Helvetica-Bold").fontSize(16).fillColor(COLORS.primary)
         .text(registration.userName, leftColX, doc.y + 4);

      // === RIGHT SIDE: QR CODE ===
      const qrBoxSize = 140;
      const qrY = contentTop + 10; // Align roughly with title

      try {
        const qrBuffer = await QRCode.toBuffer(registration.tokenId, { 
            margin: 1, 
            width: qrBoxSize,
            color: { dark: COLORS.textDark, light: '#0000' } // Transparent bg
        });
        
        doc.image(qrBuffer, rightColX, qrY, { width: qrBoxSize });
        
        // Token Text
        doc.font("Courier-Bold").fontSize(10).fillColor(COLORS.textDark)
           .text(registration.tokenId, rightColX, qrY + qrBoxSize + 5, { 
               width: qrBoxSize, 
               align: 'center' 
           });

      } catch (err) { console.error(err); }

      // --- 4. Footer (Absolute Positioning) ---
      // Placing it exactly 40px from bottom to ensure it never creates a new page
      doc.fontSize(8).fillColor(COLORS.textGray)
         .text(
             "Please present this ticket at the event entrance. One-time use only.", 
             margin, 
             height - margin - 20, 
             { width: width - (margin * 2), align: 'center' }
         );

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateTicketPDF };