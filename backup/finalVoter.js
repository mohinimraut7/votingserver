const FinalVoter = require("../models/finalvoter");
// controllers/voterController.js
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");

// bulkImageUpload.js (controller)
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const r2 = require("../utils/r2Client"); // Import your R2 client
const fsex = require("fs-extra"); // or fs/promises
const sharp = require("sharp");




// Option 2: Double backslashes
const FOLDER_PATH = "C:\\mohini\\Project\\VotingCrystalReportByYashSir\\votingproject\\voting2026vvcmc_LIVE\\images_new\\RECOVERED_FROM_BLANK_OR_NO_OCR";



// Option 3: Template literal (also works)
// const FOLDER_PATH = String.raw`C:\mohini\Project\VotingCrystalReportByYashSir\votingproject\voting2026vvcmc_LIVE\img`;



// const FinalUpdated38ks = require("../models/finalupdated38ks");


// exports.getFinalVoters = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 50;
//     const skip = (page - 1) * limit;

//     const { voterId, name, searchHouseNumber } = req.query;
//     let searchQuery = {};

//     if (voterId) {
//       searchQuery.voterId = { $regex: voterId, $options: "i" };
//     } 
//     else if (name) {
//       searchQuery.$or = [
//         { name: { $regex: name, $options: "i" } },
//         { nameMarathi: { $regex: name, $options: "i" } }
//       ];
//     } 
//     else if (searchHouseNumber) {
//       searchQuery.homeNumber = { $regex: searchHouseNumber, $options: "i" };
//     }

//     const totalVoters = await FinalVoter.countDocuments(searchQuery);

//     const voters = await FinalVoter.find(searchQuery)
//       .skip(skip)
//       .limit(limit)
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       voters,
//       pagination: {
//         currentPage: page,
//         totalPages: Math.ceil(totalVoters / limit),
//         totalVoters,
//         limit
//       }
//     });
//   } catch (error) {
//     console.error("Final voters fetch error:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };



// exports.getFinalVoters = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 50;
//     const skip = (page - 1) * limit;

//     const { search } = req.query;
//     let searchQuery = {};

//     if (search) {
//       const searchText = String(search).trim().toLowerCase();
//       const words = searchText.split(/\s+/);

//       searchQuery.$or = [
//         // 🔹 voterId (MRL2030666 style)
//         { voterId: { $regex: searchText, $options: "i" } },

//         // 🔹 mobile (string of 10 digits)
//         { mobileOne: { $regex: searchText, $options: "i" } },
//         { mobileTwo: { $regex: searchText, $options: "i" } },

//         // 🔹 name (ANY ONE WORD MATCH, ANY ORDER)
//         ...words.map(word => ({
//           name: { $regex: word, $options: "i" }
//         }))
//       ];
//     }

//     const totalVoters = await FinalVoter.countDocuments(searchQuery);

//     const voters = await FinalVoter.find(searchQuery)
//       .skip(skip)
//       .limit(limit)
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       voters,
//       pagination: {
//         currentPage: page,
//         totalPages: Math.ceil(totalVoters / limit),
//         totalVoters,
//         limit
//       }
//     });
//   } catch (error) {
//     console.error("Final voters fetch error:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };



// exports.getFinalVoters = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 50;
//     const skip = (page - 1) * limit;

//     const { search } = req.query;
//     let searchQuery = {};

//     if (search) {
//       const searchText = String(search).trim();
//       const lowerSearch = searchText.toLowerCase();

//       // 🔍 Detect mobile (only digits)
//       const isMobile = /^\d{7,}$/.test(lowerSearch);

//       // 🔍 Detect voterId (letters + numbers)
//       const isVoterId = /[a-zA-Z]/.test(searchText) && /\d/.test(searchText);

//       if (isMobile) {
//         // 📱 MOBILE SEARCH
//         searchQuery.$or = [
//           { mobileOne: { $regex: lowerSearch, $options: "i" } },
//           { mobileTwo: { $regex: lowerSearch, $options: "i" } }
//         ];
//       } 
//       else if (isVoterId) {
//         // 🆔 VOTER ID SEARCH
//         searchQuery.voterId = { $regex: searchText, $options: "i" };
//       } 
//       else {
//         // 👤 NAME SEARCH (split words, any order, case-insensitive)
//         const words = lowerSearch.split(/\s+/);

//         searchQuery.$or = words.map(word => ({
//           name: { $regex: word, $options: "i" }
//         }));
//       }
//     }

//     const totalVoters = await FinalVoter.countDocuments(searchQuery);

//     const voters = await FinalVoter.find(searchQuery)
//       .skip(skip)
//       .limit(limit)
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       voters,
//       pagination: {
//         currentPage: page,
//         totalPages: Math.ceil(totalVoters / limit),
//         totalVoters,
//         limit
//       }
//     });
//   } catch (error) {
//     console.error("Final voters fetch error:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };


// exports.getFinalVoters = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 50;
//     const skip = (page - 1) * limit;

//     const { search } = req.query;
//     let searchQuery = {};

//     if (search) {
//       const searchText = String(search).trim();
//       const lower = searchText.toLowerCase();

//       const isMobile = /^\d{7,}$/.test(lower); // only digits
//       const isVoterId = /[a-zA-Z]/.test(searchText) && /\d/.test(searchText);

//       if (isMobile) {
//         // 📱 MOBILE SEARCH (number + string supported)
//         searchQuery.$or = [
//           {
//             $expr: {
//               $regexMatch: {
//                 input: { $toString: "$mobileOne" },
//                 regex: lower,
//                 options: "i"
//               }
//             }
//           },
//           {
//             $expr: {
//               $regexMatch: {
//                 input: { $toString: "$mobileTwo" },
//                 regex: lower,
//                 options: "i"
//               }
//             }
//           }
//         ];
//       }
//       else if (isVoterId) {
//         // 🆔 VOTER ID SEARCH (MRL2030450 / RBG5496666)
//         searchQuery.voterId = { $regex: searchText, $options: "i" };
//       }
//       else {
//         // 👤 NAME SEARCH (ANY WORD, ANY ORDER, case-insensitive)
//         const words = lower.split(/\s+/);

//         searchQuery.$or = words.map(word => ({
//           name: { $regex: word, $options: "i" }
//         }));
//       }
//     }

//     const totalVoters = await FinalVoter.countDocuments(searchQuery);

//     const voters = await FinalVoter.find(searchQuery)
//       .skip(skip)
//       .limit(limit)
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       voters,
//       pagination: {
//         currentPage: page,
//         totalPages: Math.ceil(totalVoters / limit),
//         totalVoters,
//         limit
//       }
//     });
//   } catch (error) {
//     console.error("Final voters fetch error:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };



// exports.getFinalVoters = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 50;
//     const skip = (page - 1) * limit;

//     const { search } = req.query;
//     let searchQuery = {};

//     if (search) {
//       const searchText = String(search).trim();
//       const lower = searchText.toLowerCase();

//       const isMobile = /^\d{7,}$/.test(lower);
//       const isVoterId = /[a-zA-Z]/.test(searchText) && /\d/.test(searchText);

//       if (isMobile) {
//         // 📱 MOBILE SEARCH
//         searchQuery.$or = [
//           {
//             $expr: {
//               $regexMatch: {
//                 input: { $toString: "$mobileOne" },
//                 regex: lower,
//                 options: "i"
//               }
//             }
//           },
//           {
//             $expr: {
//               $regexMatch: {
//                 input: { $toString: "$mobileTwo" },
//                 regex: lower,
//                 options: "i"
//               }
//             }
//           }
//         ];
//       }
//       else if (isVoterId) {
//         // 🆔 VOTER ID SEARCH
//         searchQuery.voterId = { $regex: searchText, $options: "i" };
//       }
//       else {
//         // 👤 NAME SEARCH — ALL WORDS, ANY ORDER, CASE-INSENSITIVE
//         const words = lower.split(/\s+/);

//         searchQuery.$and = words.map(word => ({
//           name: { $regex: word, $options: "i" }
//         }));
//       }
//     }

//     const totalVoters = await FinalVoter.countDocuments(searchQuery);

//     const voters = await FinalVoter.find(searchQuery)
//       .skip(skip)
//       .limit(limit)
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       voters,
//       pagination: {
//         currentPage: page,
//         totalPages: Math.ceil(totalVoters / limit),
//         totalVoters,
//         limit
//       }
//     });
//   } catch (error) {
//     console.error("Final voters fetch error:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// ====================================



// exports.getFinalVoters = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;

//     // 👇 limit घेतली आणि 96 पेक्षा जास्त असेल तर 96 केली
//     const limit = parseInt(req.query.limit) || 50;
//     const safeLimit = limit > 96 ? 96 : limit;

//     const skip = (page - 1) * safeLimit;

//     const { search } = req.query;
//     let searchQuery = {};

//     if (search) {
//       const searchText = String(search).trim();
//       const lower = searchText.toLowerCase();

//       const isMobile = /^\d{7,}$/.test(lower);
//       const isVoterId = /[a-zA-Z]/.test(searchText) && /\d/.test(searchText);

//       if (isMobile) {
//         searchQuery.$or = [
//           {
//             $expr: {
//               $regexMatch: {
//                 input: { $toString: "$mobileOne" },
//                 regex: lower,
//                 options: "i"
//               }
//             }
//           },
//           {
//             $expr: {
//               $regexMatch: {
//                 input: { $toString: "$mobileTwo" },
//                 regex: lower,
//                 options: "i"
//               }
//             }
//           }
//         ];
//       }
//       else if (isVoterId) {
//         searchQuery.voterId = { $regex: searchText, $options: "i" };
//       }
//       else {
//         const words = lower.split(/\s+/);
//         searchQuery.$and = words.map(word => ({
//           name: { $regex: word, $options: "i" }
//         }));
//       }
//     }

//     const totalVoters = await FinalVoter.countDocuments(searchQuery);

//     const voters = await FinalVoter.find(searchQuery)
//       // .skip(skip)
//       // .limit(safeLimit)
//       // .sort({ createdAt: -1 });
//        .collation({ locale: "en", strength: 2 })   // 🔥 case-insensitive A–Z
//    .sort({
//     BuildingName: 1,  // 🏢 building wise sort
//     lastName: 1,
//    middleName: 1    
//   })// 🔥 alphabetical sort
//   .skip(skip)
//   .limit(safeLimit);

//     res.status(200).json({
//       voters,
//       pagination: {
//         currentPage: page,
//         totalPages: Math.ceil(totalVoters / safeLimit),
//         totalVoters,
//         limit: safeLimit
//       }
//     });
//   } catch (error) {
//     console.error("Final voters fetch error:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };


// exports.getFinalVoters = async (req, res) => {
//   try {
//     const { search, export: isExport } = req.query;

//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 96;
//     const safeLimit = limit > 96 ? 96 : limit;
//     const skip = (page - 1) * safeLimit;

//     let searchQuery = {};

//     if (search) {
//       const searchText = String(search).trim();
//       const lower = searchText.toLowerCase();

//       const isMobile = /^\d{7,}$/.test(lower);
//       const isVoterId = /[a-zA-Z]/.test(searchText) && /\d/.test(searchText);

//       if (isMobile) {
//         searchQuery.$or = [
//           { mobileOne: { $regex: lower } },
//           { mobileTwo: { $regex: lower } },
//         ];
//       } else if (isVoterId) {
//         searchQuery.voterId = { $regex: searchText, $options: "i" };
//       } else {
//         searchQuery.name = { $regex: lower, $options: "i" };
//       }
//     }

//     const query = FinalVoter.find(searchQuery)
//       .collation({ locale: "en", strength: 2 })
//       .sort({ BuildingName: 1, lastName: 1, middleName: 1 });

//     // 🔥 EXPORT MODE → NO PAGINATION
//     if (isExport === "true") {
//       const voters = await query.lean();
//       return res.json({
//         voters,
//         total: voters.length,
//         export: true,
//       });
//     }

//     // 🔹 NORMAL PAGINATION MODE
//     const totalVoters = await FinalVoter.countDocuments(searchQuery);

//     const voters = await query
//       .skip(skip)
//       .limit(safeLimit)
//       .lean();

//     res.json({
//       voters,
//       pagination: {
//         currentPage: page,
//         totalPages: Math.ceil(totalVoters / safeLimit),
//         totalVoters,
//         limit: safeLimit,
//       },
//     });

//   } catch (error) {
//     console.error("Final voters fetch error:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };


exports.getFinalVoters = async (req, res) => {
  try {
    const { search, export: isExport } = req.query;

    let searchQuery = {};

    if (search) {
      const searchText = String(search).trim();
      const lower = searchText.toLowerCase();

      const isMobile = /^\d{7,}$/.test(lower);
      const isVoterId = /[a-zA-Z]/.test(searchText) && /\d/.test(searchText);

      if (isMobile) {
        searchQuery.$or = [
          { mobileOne: { $regex: lower } },
          { mobileTwo: { $regex: lower } },
        ];
      } else if (isVoterId) {
        searchQuery.voterId = { $regex: searchText, $options: "i" };
      } else {
        searchQuery.name = { $regex: lower, $options: "i" };
      }
    }

    /* ===========================
       🔥 EXPORT MODE (NO PAGINATION)
    ============================ */
  if (isExport === "true") {
  const voters = await FinalVoter.find(searchQuery)
    .collation({ locale: "en", strength: 2 })
    .sort({ BuildingName: 1, lastName: 1, middleName: 1 })
    .lean();

  return res.json({
    voters,
    total: voters.length,
    export: true,
  });
}

    /* ===========================
       🔹 NORMAL PAGINATION (UI)
    ============================ */
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 96;
    const safeLimit = limit > 96 ? 96 : limit;
    const skip = (page - 1) * safeLimit;

    const totalVoters = await FinalVoter.countDocuments(searchQuery);

    const voters = await FinalVoter.find(searchQuery)
      .collation({ locale: "en", strength: 2 })
      .sort({ BuildingName: 1, lastName: 1, middleName: 1 })
      .skip(skip)
      .limit(safeLimit)
      .lean();

    res.json({
      voters,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalVoters / safeLimit),
        totalVoters,
        limit: safeLimit,
      },
    });

  } catch (error) {
    console.error("Final voters fetch error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};





// ========================================


exports.verifiedPage=async(req,res)=>{
  res.sendFile(path.join(_dirname, "./../views/voterreceipt.html"))
}





// exports.getFinalvoterReceipt = async (req, res) => {
//   try {
//     const { voterId } = req.params;

//     const voter = await FinalVoter.findOne({ voterId });
//     console.log("hdhdhdhdhdh",voter)

//     if (!voter) {
//       return res.send("<h2>Voter Not Found</h2>");
//     }

//     const htmlPath = path.join(__dirname, "../views/voterslip.html");
//     let html = fs.readFileSync(htmlPath, "utf8");

//     // 🔥 Replace placeholders
//     html = html
//       .replace("{{VOTER_ID}}", voter.voterId || "-")
//       .replace("{{NAME}}",voter.name || "-")
//       .replace("{{AGE}}", voter.age || "-")
//       .replace("{{GENDER}}", voter.gender || "-")
//       .replace("{{ADDRESS}}", voter.houseNo || "-")
//       .replace("{{WARD}}", voter.wardNumber || "-")
//       .replace("{{SRN}}", voter.srn || "-")
//         .replace("{{BOOTH_NUMBER}}", voter.boothNumber || "-")
//       .replace("{{BOOTH_NAME}}", voter.boothName || voter.BoothName || "-")
     
//     res.send(html);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Server Error");
//   }
// };








// exports.getFinalvoterReceipt = async (req, res) => {
//   let browser;

//   try {
//     const { voterId } = req.params;

//     // 1️⃣ Fetch voter
//     const voter = await FinalVoter.findOne({ voterId });
//     if (!voter) {
//       return res.status(404).send("Voter Not Found");
//     }

//     // 2️⃣ Read HTML template
//     const htmlPath = path.join(__dirname, "../views/voterslip.html");
//     let html = fs.readFileSync(htmlPath, "utf8");

//     // 🔥 IMPORTANT FIX: base URL for images/CSS
//     // change localhost:5000 to your production domain later
//     const BASE_URL = "http://localhost:5000";
//     html = html.replace(
//       "<head>",
//       `<head><base href="${BASE_URL}">`
//     );

//     // 3️⃣ Replace placeholders (GLOBAL replace)
//     html = html
//       .replace(/{{VOTER_ID}}/g, voter.voterId || "-")
//       .replace(/{{NAME}}/g, voter.name || "-")
//       .replace(/{{WARD}}/g, voter.wardNumber || "-")
//       .replace(/{{SRN}}/g, voter.srn || "-")
//       .replace(/{{ADDRESS}}/g, voter.houseNo || "-")
//       .replace(/{{BOOTH_NUMBER}}/g, voter.boothNumber || "-")
//       .replace(
//         /{{BOOTH_NAME}}/g,
//         voter.boothName || voter.BoothName || "-"
//       );

//     // 4️⃣ Launch Puppeteer
//     browser = await puppeteer.launch({
//       headless: "new",
//       args: ["--no-sandbox", "--disable-setuid-sandbox"],
//     });

//     const page = await browser.newPage();

//     // 🔥 Load HTML + allow images
//     await page.setContent(html, {
//       waitUntil: "networkidle0",
//     });

//     // 5️⃣ Generate PDF buffer
//     const pdfBuffer = await page.pdf({
//       format: "A4",
//       printBackground: true,       // 🔥 background image visible
//       preferCSSPageSize: true,
//       margin: {
//         top: "10mm",
//         bottom: "10mm",
//         left: "10mm",
//         right: "10mm",
//       },
//     });

//     // 6️⃣ Close browser safely
//     await browser.close();
//     browser = null;

//     // 7️⃣ Send PDF response (binary-safe)
//     res.status(200);
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=Voter_Slip_${voterId}.pdf`
//     );
//     res.setHeader("Content-Length", pdfBuffer.length);

//     return res.end(pdfBuffer); // 🔥 MUST use res.end
//   } catch (err) {
//     console.error("PDF generation error:", err);

//     if (browser) {
//       await browser.close();
//     }

//     return res.status(500).send("PDF generation failed");
//   }
// };





// exports.previewFinalVoterReceipt = async (req, res) => {
//   try {
//     const { voterId } = req.params;

//     const voter = await FinalVoter.findOne({ voterId });
//     if (!voter) return res.status(404).send("Voter Not Found");

//     const htmlPath = path.join(__dirname, "../views/voterslip.html");
//     let html = fs.readFileSync(htmlPath, "utf8");

//     html = html
//       .replace(/{{VOTER_ID}}/g, voter.voterId || "-")
//       .replace(/{{NAME}}/g, voter.name || "-")
//       .replace(/{{WARD}}/g, voter.wardNumber || "-")
//       .replace(/{{SRN}}/g, voter.srn || "-")
//       .replace(/{{ADDRESS}}/g, voter.houseNo || "-")
//       .replace(/{{BOOTH_NUMBER}}/g, voter.boothNumber || "-")
//       .replace(
//         /{{BOOTH_NAME}}/g,
//         voter.boothName || voter.BoothName || "-"
//       );

//     res.send(html);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Preview failed");
//   }
// };




// exports.previewFinalVoterReceipt = async (req, res) => {
//   try {
//     const { voterId } = req.params;

//     const voter = await FinalVoter.findOne({ voterId });
//     if (!voter) return res.status(404).send("Voter Not Found");

//     const htmlPath = path.join(__dirname, "../views/voterslip.html");
//     let html = fs.readFileSync(htmlPath, "utf8");

//     html = html
//       .replace(/{{VOTER_ID}}/g, voter.voterId || "-")
//       .replace(/{{NAME}}/g, voter.name || "-")
//       .replace(/{{WARD}}/g, voter.wardNumber || "-")
//       .replace(/{{SRN}}/g, voter.srn || "-")
//       .replace(/{{ADDRESS}}/g, voter.houseNo || "-")
//       .replace(/{{BOOTH_NUMBER}}/g, voter.boothNumber || "-")
//       .replace(
//         /{{BOOTH_NAME}}/g,
//         voter.boothName || voter.BoothName || "-"
//       )
//        .replace(/{{BASEURL}}/g, process.env.BASEURL);

//     res.send(html);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Preview failed");
//   }
// };


exports.previewFinalVoterReceipt = async (req, res) => {
  try {
    const { voterId } = req.params;

    const voter = await FinalVoter.findOne({ voterId });
    if (!voter) return res.status(404).send("Voter Not Found");

    const htmlPath = path.join(__dirname, "../views/voterslip.html");
    let html = fs.readFileSync(htmlPath, "utf8");
     const baseUrl =
      process.env.BASEURL || `${req.protocol}://${req.get("host")}`;

    html = html
      .replace(/{{VOTER_ID}}/g, voter.voterId || "-")
      .replace(/{{NAME}}/g, voter.name || "-")
      .replace(/{{WARD}}/g, voter.wardNumber || "-")
      .replace(/{{SRN}}/g, voter.srn || "-")
      .replace(/{{ADDRESS}}/g, voter.houseNo || "-")
      .replace(/{{BOOTH_NUMBER}}/g, voter.boothNumber || "-")
      .replace(/{{BOOTH_NAME}}/g, voter.boothName || voter.BoothName || "-")
      .replace(/{{BASEURL}}/g, baseUrl);

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("Preview failed");
  }
};






exports.getFinalvoterReceipt = async (req, res) => {
  let browser;

  try {
    const { voterId } = req.params;
    const BASEURL = process.env.BASEURL;

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.goto(`${BASEURL}/api/previewFinalVoterReceipt/${voterId}`, {
      waitUntil: "networkidle0",
    });

    // 🔥 IMPORTANT: use PRINT media
    await page.emulateMediaType("print");

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "10mm",
        bottom: "10mm",
        left: "10mm",
        right: "10mm",
      },
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Voter_Slip_${voterId}.pdf`
    );

    return res.end(pdfBuffer);
  } catch (err) {
    console.error(err);
    if (browser) await browser.close();
    res.status(500).send("PDF generation failed");
  }
};




exports.bulkImageUpload = async (req, res) => {
  try {
    // Verify folder exists
    const folderExists = await fsex.pathExists(FOLDER_PATH);
    if (!folderExists) {
      return res.status(400).json({
        success: false,
        message: `Folder not found: ${FOLDER_PATH}`,
        hint: "Check if the images folder exists at the specified location",
      });
    }

    console.log("📁 Reading from:", FOLDER_PATH);
    const files = await fsex.readdir(FOLDER_PATH);

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files found in the folder",
        path: FOLDER_PATH,
      });
    }

    console.log(`📊 Found ${files.length} files`);

    let uploaded = 0;
    let failed = 0;
    let skipped = 0;
    const errors = [];

    for (const file of files) {
      try {
        // Skip non-image files
        if (!file.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          skipped++;
          console.log("⏭️  Skipped:", file);
          continue;
        }

        const voterId = path.parse(file).name;
        const inputPath = path.join(FOLDER_PATH, file);

        // Check if file exists
        if (!(await fsex.pathExists(inputPath))) {
          throw new Error(`File not found: ${inputPath}`);
        }

        const buffer = await sharp(inputPath)
          .resize(600, 600, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 70 })
          .toBuffer();

        const command = new PutObjectCommand({
          Bucket: process.env.R2_BUCKET,
          Key: `voters/${voterId}.webp`,
          Body: buffer,
          ContentType: "image/webp",
          ContentLength: buffer.length,
        });

        await r2.send(command);

        uploaded++;
        console.log(`✅ Uploaded (${uploaded}/${files.length}):`, voterId);

        // Optional: Add a small delay to avoid rate limiting
        // await new Promise(resolve => setTimeout(resolve, 100));

      } catch (err) {
        failed++;
        errors.push({ file, error: err.message });
        console.error("❌ Failed:", file, err.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Bulk upload completed",
      uploaded,
      failed,
      skipped,
      total: files.length,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error("Bulk upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Bulk upload failed",
      error: error.message,
      path: FOLDER_PATH,
    });
  }
};



const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://mohini:mohiniraut@cluster0.ukt1ubo.mongodb.net/votingDB?retryWrites=true&w=majority";
const client = new MongoClient(uri);

exports.markTwiceVoters = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("votingDB");

    const twiceCol = db.collection("twicevoters");

    // 1️⃣ get all voterIds from twicevoters
    const idsList = await twiceCol
      .find({}, { projection: { voterId: 1, _id: 0 } })
      .toArray();

    const voterIds = idsList
      .map(v => v.voterId)
      .filter(Boolean);

    console.log("TOTAL TWICE IDS:", voterIds.length);

    if (!voterIds.length) {
      return res.status(400).json({ message: "No voterIds found" });
    }

    // 2️⃣ update FinalVoter where voterId matches
    const updateResult = await FinalVoter.updateMany(
      { voterId: { $in: voterIds } },
      {
        $set: {
          flag: "twice",
          updatedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      totalTwiceVoterIds: voterIds.length,
      matchedInFinalVoter: updateResult.matchedCount,
      updatedRecords: updateResult.modifiedCount,
      flagSet: "twice"
    });

  } catch (err) {
    console.error("TWICE UPDATE ERROR:", err);
    res.status(500).json({ error: "Failed to mark twice voters" });
  } finally {
    await client.close();
  }
};


