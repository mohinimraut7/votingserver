// middlewares/uploadPdf.js
const multer = require("multer");
const fs = require("fs");

const pdfDir = "uploads/pdf";
fs.mkdirSync(pdfDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, pdfDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "_" + file.originalname),
});

module.exports = multer({ storage });
