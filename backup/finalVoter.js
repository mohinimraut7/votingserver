// const FinalVoter = require("../models/finalvoter");
// const path = require("path");
// const fs = require("fs");
// const puppeteer = require("puppeteer");
import FinalVoter from "../models/finalvoter.js";
import path from "path";
import fs from "fs";
import puppeteer from "puppeteer";


import fsex from "fs-extra";

import sharp from "sharp";
import { PutObjectCommand } from "@aws-sdk/client-s3";
// import r2 from "../utils/r2Client.js";
import { r2 } from "../utils/r2Client.js";


const FOLDER_PATH = "C:\mohini\Project\VotingCrystalReportByYashSir\votingproject\voting2026vvcmc_LIVE\images"; // 🔥 local folder

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

exports.getFinalVoters = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;

    // 👇 limit घेतली आणि 96 पेक्षा जास्त असेल तर 96 केली
    const limit = parseInt(req.query.limit) || 50;
    const safeLimit = limit > 96 ? 96 : limit;

    const skip = (page - 1) * safeLimit;

    const { search } = req.query;
    let searchQuery = {};

    if (search) {
      const searchText = String(search).trim();
      const lower = searchText.toLowerCase();

      const isMobile = /^\d{7,}$/.test(lower);
      const isVoterId = /[a-zA-Z]/.test(searchText) && /\d/.test(searchText);

      if (isMobile) {
        searchQuery.$or = [
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$mobileOne" },
                regex: lower,
                options: "i"
              }
            }
          },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$mobileTwo" },
                regex: lower,
                options: "i"
              }
            }
          }
        ];
      }
      else if (isVoterId) {
        searchQuery.voterId = { $regex: searchText, $options: "i" };
      }
      else {
        const words = lower.split(/\s+/);
        searchQuery.$and = words.map(word => ({
          name: { $regex: word, $options: "i" }
        }));
      }
    }

    const totalVoters = await FinalVoter.countDocuments(searchQuery);

    const voters = await FinalVoter.find(searchQuery)
      // .skip(skip)
      // .limit(safeLimit)
      // .sort({ createdAt: -1 });
       .collation({ locale: "en", strength: 2 })   // 🔥 case-insensitive A–Z
   .sort({
    BuildingName: 1,  // 🏢 building wise sort
    lastName: 1,
   middleName: 1    
  })// 🔥 alphabetical sort
  .skip(skip)
  .limit(safeLimit);

    res.status(200).json({
      voters,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalVoters / safeLimit),
        totalVoters,
        limit: safeLimit
      }
    });
  } catch (error) {
    console.error("Final voters fetch error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


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





exports.previewFinalVoterReceipt = async (req, res) => {
  try {
    const { voterId } = req.params;

    const voter = await FinalVoter.findOne({ voterId });
    if (!voter) return res.status(404).send("Voter Not Found");

    const htmlPath = path.join(__dirname, "../views/voterslip.html");
    let html = fs.readFileSync(htmlPath, "utf8");

    html = html
      .replace(/{{VOTER_ID}}/g, voter.voterId || "-")
      .replace(/{{NAME}}/g, voter.name || "-")
      .replace(/{{WARD}}/g, voter.wardNumber || "-")
      .replace(/{{SRN}}/g, voter.srn || "-")
      .replace(/{{ADDRESS}}/g, voter.houseNo || "-")
      .replace(/{{BOOTH_NUMBER}}/g, voter.boothNumber || "-")
      .replace(
        /{{BOOTH_NAME}}/g,
        voter.boothName || voter.BoothName || "-"
      );

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send("Preview failed");
  }
};



// const puppeteer = require("puppeteer");

exports.getFinalvoterReceipt = async (req, res) => {
  let browser;

  try {
    const { voterId } = req.params;

    browser = await puppeteer.launch({
      headless: true, // 🔥 IMPORTANT (NOT "new")
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // 🔥 THIS IS THE KEY FIX
    await page.goto(
      `http://localhost:5000/api/previewFinalVoterReceipt/${voterId}`,
      { waitUntil: "networkidle0" }
    );

    await page.emulateMediaType("screen");

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
    browser = null;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Voter_Slip_${voterId}.pdf`
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    return res.end(pdfBuffer);
  } catch (err) {
    console.error("PDF generation error:", err);
    if (browser) await browser.close();
    res.status(500).send("PDF generation failed");
  }
};





export const bulkImageUpload = async (req, res) => {
  try {
    const files = await fsex.readdir(FOLDER_PATH);

    let uploaded = 0;
    let failed = 0;

    for (const file of files) {
      try {
        const voterId = path.parse(file).name;
        const inputPath = path.join(FOLDER_PATH, file);

        const buffer = await sharp(inputPath)
          .resize(600)
          .webp({ quality: 70 })
          .toBuffer();

        const command = new PutObjectCommand({
          Bucket: process.env.R2_BUCKET,
          Key: `voters/${voterId}.webp`,
          Body: buffer,
          ContentType: "image/webp",
        });

        await r2.send(command);

        uploaded++;
        console.log("✅ Uploaded:", voterId);
      } catch (err) {
        failed++;
        console.error("❌ Failed:", file, err.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Bulk upload completed",
      uploaded,
      failed,
      total: files.length,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Bulk upload failed",
      error: error.message,
    });
  }
};


====================================



const express = require('express');
const router = express.Router();
const {
  getFinalVoters,
  getFinalvoterReceipt,previewFinalVoterReceipt,bulkImageUpload,debugR2,testR2Upload
 
} = require('../controller/finalvoter');
router.get("/getFinalVoters", getFinalVoters);
router.get("/getFinalvoterReceipt/:voterId",getFinalvoterReceipt);


router.get(
  "/previewFinalVoterReceipt/:voterId",
  previewFinalVoterReceipt
);


router.post(
  "/bulkImageUpload",
  bulkImageUpload
);

router.get(
  "/debugR2",
  debugR2
)

router.get("/testR2Upload", testR2Upload);

module.exports = router;



