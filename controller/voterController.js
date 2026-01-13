const Voter = require('../models/voter');
const pdf = require("pdf-poppler");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const Tesseract = require("tesseract.js");


exports.addVoter = async (req, res) => {
  try {
    const {
      mahanagarpalika,
      wardNumber,
      boothNumber,
      unuKramank,
      untimAnuKrmank,
      name,
      relativeName,
      lastName,
      firstName,
      middleName,
      gender,
      age,
      voterId,
      vidhanSabhaKramank,
      village,
      colorCode,
      address,
      homeNumber,

      // ✅ MARATHI FIELDS
      nameMarathi,
      relativeNameMarathi,
      lastNameMarathi,
      firstNameMarathi,
      middleNameMarathi,
      villageMarathi,
      addressMarathi,
    } = req.body;

    const newVoter = new Voter({
      mahanagarpalika,
      wardNumber,
      boothNumber,
      unuKramank,
      untimAnuKrmank,
      name,
      relativeName,
      lastName,
      firstName,
      middleName,
      gender,
      age,
      voterId,
      vidhanSabhaKramank,
      village,
      colorCode,
      address,
      homeNumber,

      // ✅ SAVE MARATHI DATA
      nameMarathi,
      relativeNameMarathi,
      lastNameMarathi,
      firstNameMarathi,
      middleNameMarathi,
      villageMarathi,
      addressMarathi,
    });

    await newVoter.save();

    res.status(201).json({
      message: 'Voter added successfully',
      voter: newVoter,
    });
  } catch (error) {
    console.error('Error adding voter:', error);
    res.status(500).json({
      message: 'Error adding voter',
      error: error.message,
    });
  }
};




exports.getVoters = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const { voterId, name,searchHouseNumber } = req.query;

    let searchQuery = {};

    // 🔍 SEARCH QUERY (ALL DATA)
    if (voterId) {
      searchQuery.voterId = { $regex: voterId, $options: 'i' };
    } 
    else if (name) {
      searchQuery.$or = [
        { name: { $regex: name, $options: 'i' } },
        { nameMarathi: { $regex: name, $options: 'i' } },
      ];
    }
     else if (searchHouseNumber) {
      searchQuery.$or = [
        { homeNumber: { $regex: searchHouseNumber, $options: 'i' } },
        
      ];
    }
    // else if (searchHouseNumber) {
    //   searchQuery.searchHouseNumber = { $regex: voterId, $options: 'i' };
    // } 

    // ✅ STEP 1: SEARCH FULL DATASET
    const totalVoters = await Voter.countDocuments(searchQuery);

    // ✅ STEP 2: APPLY PAGINATION ONLY FOR DISPLAY
    const voters = await Voter.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(totalVoters / limit);

    res.status(200).json({
      voters,
      pagination: {
        currentPage: page,
        totalPages,
        totalVoters,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching voters:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



/**
 * DELETE VOTER
 */
exports.deleteVoter = async (req, res) => {
  const { voter_id } = req.params;
  try {
    const deletedVoter = await Voter.findByIdAndDelete(voter_id);

    if (!deletedVoter) {
      return res.status(404).json({ message: 'Voter not found' });
    }

    res.status(200).json({
      message: 'Voter deleted successfully',
      voter: deletedVoter,
    });
  } catch (error) {
    console.error('Error deleting voter:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * EDIT VOTER
 * (English + Marathi both supported automatically)
 */
exports.editVoter = async (req, res) => {
  const { voter_id } = req.params;
  try {
    const updatedVoter = await Voter.findByIdAndUpdate(
      voter_id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedVoter) {
      return res.status(404).json({ message: 'Voter not found' });
    }

    res.status(200).json({
      message: 'Voter updated successfully',
      voter: updatedVoter,
    });
  } catch (error) {
    console.error('Error updating voter:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * IMPORT EXCEL (Bulk Upsert by voterId)
 * ✔ English + Marathi columns auto saved
 */
exports.importExcel = async (req, res) => {
  try {
    const voters = req.body;

    if (!Array.isArray(voters) || voters.length === 0) {
      return res.status(400).json({
        message: 'Invalid data. Please provide an array of voters.',
      });
    }

    let insertedCount = 0;
    let updatedCount = 0;

    for (const voterData of voters) {
      const { voterId } = voterData;
      if (!voterId) continue;

      const existingVoter = await Voter.findOne({ voterId });

      if (existingVoter) {
        await Voter.updateOne(
          { voterId },
          { $set: voterData }
        );
        updatedCount++;
      } else {
        await Voter.create(voterData);
        insertedCount++;
      }
    }

    res.status(201).json({
      message: 'Voter Excel import completed',
      insertedCount,
      updatedCount,
    });
  } catch (error) {
    console.error('Error importing voter data:', error);
    res.status(500).json({
      message: 'Error importing voter data',
      error: error.message,
    });
  }
};

/**
 * DELETE ALL VOTERS
 */
exports.deleteAll = async (req, res) => {
  try {
    const result = await Voter.deleteMany({});

    if (result.deletedCount > 0) {
      res.status(200).json({
        message: 'All voters deleted successfully',
        deletedCount: result.deletedCount,
      });
    } else {
      res.status(404).json({
        message: 'No voters found to delete',
      });
    }
  } catch (error) {
    console.error('Error deleting voters:', error);
    res.status(500).json({
      message: 'Error deleting voters',
      error: error.message,
    });
  }
};


// exports.getCommonVotersCount = async (req, res) => {
//   try {
//     // 1️⃣ Get all records
//     const voters = await Voter.find({
//       firstNameMarathi: { $exists: true },
//       middleNameMarathi: { $exists: true },
//       lastNameMarathi: { $exists: true },
//     });

//     const voter20k = await VoterTwentyThousand.find({
//       name: { $exists: true }
//     });

//     // 2️⃣ Prepare voter map
//     const voterMap = new Map();

//     voters.forEach(v => {
//       const parts = [
//         v.firstNameMarathi,
//         v.middleNameMarathi,
//         v.lastNameMarathi,
//       ]
//         .map(s => s?.replace(/[/,]/g, '').trim())
//         .sort()
//         .join('|');

//       voterMap.set(parts, v);
//     });

//     // 3️⃣ Match from voterstwentythousand
//     const matched = [];

//     voter20k.forEach(v20 => {
//       const parts = v20.name
//         .replace(/[/,]/g, '')
//         .split(' ')
//         .map(s => s.trim())
//         .filter(Boolean)
//         .sort()
//         .join('|');

//       if (voterMap.has(parts)) {
//         matched.push({
//           voterstwentythousand: v20,
//           voters: voterMap.get(parts),
//         });
//       }
//     });

//     // 4️⃣ RESPONSE
//     res.status(200).json({
//       totalVoters: voters.length,
//       totalVoterTwentyThousand: voter20k.length,
//       commonCount: matched.length,
//       commonRecords: matched, // remove if only count needed
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: 'Error finding common voters',
//       error: error.message,
//     });
//   }
// };



// ==============================

// exports.getCommonVotersCount = async (req, res) => {
//   try {
//     // total counts
//     const totalVoters = await Voter.countDocuments();
//     const totalVoterTwentyThousand = await VoterTwentyThousand.countDocuments();

//     /**
//      * STEP 1:
//      * voters collection मधून Marathi नावाचे 3 parts घे
//      * आणि एक normalized array तयार कर
//      */
//     const voters = await Voter.aggregate([
//       {
//         $project: {
//           _id: 0,
//           voterId: 1,
//           nameParts: {
//             $filter: {
//               input: [
//                 "$firstNameMarathi",
//                 "$middleNameMarathi",
//                 "$lastNameMarathi"
//               ],
//               as: "part",
//               cond: { $ne: ["$$part", ""] }
//             }
//           }
//         }
//       }
//     ]);

//     /**
//      * STEP 2:
//      * voterstwentythousand मधील नाव split करून normalize कर
//      */
//     const voterTwenty = await VoterTwentyThousand.aggregate([
//       {
//         $project: {
//           _id: 1,
//           originalName: "$name",
//           nameParts: {
//             $split: ["$name", " "]
//           }
//         }
//       }
//     ]);

//     /**
//      * STEP 3:
//      * Compare logic (JS side – fastest & safest)
//      */
//     let commonRecords = [];

//     voterTwenty.forEach(vt => {
//       const vtSorted = vt.nameParts
//         .map(n => n.trim())
//         .filter(Boolean)
//         .sort()
//         .join(" ");

//       voters.forEach(v => {
//         const vSorted = v.nameParts
//           .map(n => n.trim())
//           .filter(Boolean)
//           .sort()
//           .join(" ");

//         if (vtSorted && vSorted && vtSorted === vSorted) {
//           commonRecords.push({
//             voterstwentythousandName: vt.originalName,
//             votersNameParts: v.nameParts
//           });
//         }
//       });
//     });

//     res.status(200).json({
//       totalVoters,
//       totalVoterTwentyThousand,
//       commonCount: commonRecords.length,
//       commonRecords
//     });

//   } catch (error) {
//     console.error("COMMON VOTER ERROR:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };





// 🔹 Marathi name normalize helper
// const normalizeMarathi = (str = '') => {
//   return str
//     .replace(/[\/,]/g, '')   // / , काढ
//     .replace(/\s+/g, ' ')    // extra spaces
//     .trim()
//     .split(' ')
//     .filter(Boolean)
//     .sort()                  // order ignore
//     .join('|');
// };

// exports.getCommonVotersCount = async (req, res) => {
//   try {
//     // ✅ total counts
//     const totalVoters = await Voter.countDocuments();
//     const totalVoterTwentyThousand = await VoterTwenty.countDocuments();

//     // ✅ voters collection (Marathi parts)
//     const voters = await Voter.find(
//       {
//         firstNameMarathi: { $exists: true },
//         middleNameMarathi: { $exists: true },
//         lastNameMarathi: { $exists: true },
//       },
//       {
//         firstNameMarathi: 1,
//         middleNameMarathi: 1,
//         lastNameMarathi: 1,
//       }
//     );

//     // ✅ map तयार कर (fast lookup)
//     const voterMap = new Map();

//     voters.forEach(v => {
//       const key = normalizeMarathi(
//         `${v.firstNameMarathi} ${v.middleNameMarathi} ${v.lastNameMarathi}`
//       );
//       voterMap.set(key, v);
//     });

//     // ✅ voterstwentys collection
//     const twentyList = await VoterTwenty.find(
//       { voterName: { $exists: true } },
//       { voterName: 1, voterAddress: 1 }
//     );

//     const commonRecords = [];

//     twentyList.forEach(tw => {
//       const key = normalizeMarathi(tw.voterName);

//       if (voterMap.has(key)) {
//         commonRecords.push({
//           voterstwentysName: tw.voterName,
//           votersMarathiName: voterMap.get(key),
//         });
//       }
//     });

//     // ✅ RESPONSE
//     res.status(200).json({
//       totalVoters,
//       totalVoterTwentyThousand,
//       commonCount: commonRecords.length,
//       commonRecords, // गरज नसेल तर काढ
//     });

//   } catch (error) {
//     console.error('COMMON MATCH ERROR:', error);
//     res.status(500).json({
//       message: 'Error finding common voters',
//       error: error.message,
//     });
//   }
// };







// const Voter = require('../models/voter');
// const VoterTwenty = require('../models/voterstwenty');

/**
 * 🔹 Marathi normalize helper
 */
const normalizeMarathiWords = (str = '') => {
  return str
    .replace(/[\/,]/g, '')     // / , काढ
    .replace(/\s+/g, ' ')      // extra spaces
    .trim()
    .split(' ')
    .filter(Boolean);
};

/**
 * ✅ ANY 2 WORD MATCH
 * voters: first/middle/last + nameMarathi + relativeNameMarathi
 * voterstwentys: voterName
 */
// exports.getCommonVotersCount = async (req, res) => {
//   try {
//     const totalVoters = await Voter.countDocuments();
//     const totalVoterTwentyThousand = await VoterTwenty.countDocuments();

//     // 1️⃣ voters collection (ALL Marathi sources)
//     const voters = await Voter.find(
//       {
//         $or: [
//           { firstNameMarathi: { $exists: true } },
//           { nameMarathi: { $exists: true } },
//           { relativeNameMarathi: { $exists: true } },
//         ],
//       },
//       {
//         firstNameMarathi: 1,
//         middleNameMarathi: 1,
//         lastNameMarathi: 1,
//         nameMarathi: 1,
//         relativeNameMarathi: 1,
//       }
//     );

//     // voters → word sets
//     const voterWordSets = voters.map(v => {
//       const combinedText = `
//         ${v.firstNameMarathi || ''}
//         ${v.middleNameMarathi || ''}
//         ${v.lastNameMarathi || ''}
//         ${v.nameMarathi || ''}
//         ${v.relativeNameMarathi || ''}
//       `;

//       return {
//         words: normalizeMarathiWords(combinedText),
//         voter: v,
//       };
//     });

//     // 2️⃣ voterstwentys
//     const twentyList = await VoterTwenty.find(
//       { voterName: { $exists: true } },
//       { voterName: 1, voterAddress: 1 }
//     );

//     const commonRecords = [];

//     // 3️⃣ MATCH LOGIC → ANY 2 WORDS
//     twentyList.forEach(tw => {
//       const twentyWords = normalizeMarathiWords(tw.voterName);

//       voterWordSets.forEach(vw => {
//         const matchedWords = twentyWords.filter(w =>
//           vw.words.includes(w)
//         );

//         if (matchedWords.length >= 2) {
//           commonRecords.push({
//             voterstwentysName: tw.voterName,
//             matchedWords,
//             votersMatchedFrom: vw.voter.nameMarathi || '',
//           });
//         }
//       });
//     });

//     res.status(200).json({
//       totalVoters,
//       totalVoterTwentyThousand,
//       commonCount: commonRecords.length,
//       commonRecords,
//     });

//   } catch (error) {
//     console.error('COMMON MATCH ERROR:', error);
//     res.status(500).json({
//       message: 'Error finding common voters',
//       error: error.message,
//     });
//   }
// };



// const Voter = require('../models/voter');
// const VoterTwenty = require('../models/voterstwenty');

// ==================================================
// const normalize = (str = '') => {
//   return str
//     .replace(/[\/,]/g, '')   // / , remove
//     .replace(/\s+/g, ' ')    // extra spaces
//     .trim()
//     .split(' ')
//     .filter(Boolean);
// };


// exports.getCommonVotersCount = async (req, res) => {
//   try {
//     const totalVoters = await Voter.countDocuments();
//     const totalVoterTwentyThousand = await VoterTwenty.countDocuments();

//     // 1️⃣ voters → only Marathi names
//     const voters = await Voter.find(
//       {
//         $or: [
//           { nameMarathi: { $exists: true } },
//           // { relativeNameMarathi: { $exists: true } },
//         ],
//       },
//       {
//         nameMarathi: 1,
//         // relativeNameMarathi: 1,
//       }
//     );

//     // voters → word sets
//     const voterSets = voters.map(v => ({
//       nameWords: normalizeWords(v.nameMarathi || ''),
//       // relativeWords: normalizeWords(v.relativeNameMarathi || ''),
//       voter: v,
//     }));

//     // 2️⃣ voterstwentys
//     const twentyList = await VoterTwenty.find(
//       { voterName: { $exists: true } },
//       { voterName: 1, voterAddress: 1 }
//     );

//     const commonRecords = [];

//     // 3️⃣ MATCH: ANY 2 WORDS
//     twentyList.forEach(tw => {
//       const twentyWords = normalizeWords(tw.voterName);

//       voterSets.forEach(vs => {
//         // match with nameMarathi
//         const nameMatchCount = twentyWords.filter(w =>
//           vs.nameWords.includes(w)
//         ).length;

//         // match with relativeNameMarathi
//         // const relativeMatchCount = twentyWords.filter(w =>
//         //   vs.relativeWords.includes(w)
//         // ).length;

//         if (nameMatchCount >= 2) {
//           commonRecords.push({
//             voterstwentyName: tw.voterName,
//             matchedWith: nameMatchCount >= 2 ? 'nameMarathi' : 'relativeNameMarathi',
//             matchedWords:
//               nameMatchCount >= 2
//                 ? twentyWords.filter(w => vs.nameWords.includes(w))
//                 : twentyWords.filter(w => vs.nameWords.includes(w)),
//           });
//         }
//       });
//     });

//     res.status(200).json({
//       totalVoters,
//       totalVoterTwentyThousand,
//       commonCount: commonRecords.length,
//       commonRecords,
//     });

//   } catch (error) {
//     console.error('COMMON MATCH ERROR:', error);
//     res.status(500).json({
//       message: 'Error finding common voters',
//       error: error.message,
//     });
//   }
// };





// exports.getCommonVotersCount = async (req, res) => {
//   try {

//     // voters -> first + middle + last
//     const voters = await Voter.find(
//       {},
//       {
//         firstNameMarathi: 1,
//         middleNameMarathi: 1,
//         lastNameMarathi: 1,
//         nameMarathi: 1
//       }
//     );

//     // pre-tokenize for speed
//     const voterTokens = voters.map(v => {
//       const words = normalize(`
//         ${v.firstNameMarathi || ""}
//         ${v.middleNameMarathi || ""}
//         ${v.lastNameMarathi || ""}
//       `);

//       return { words, v };
//     });

//     const twentys = await VoterTwenty.find(
//       {},
//       { voterName: 1, voterAddress: 1 }
//     );

//     const matches = [];

//     for (const t of twentys) {

//       // 👉 now FULL NAME words (NO slice)
//       const tWords = normalize(t.voterName);

//       for (const vw of voterTokens) {

//         const common = tWords.filter(w => vw.words.includes(w));

//         // 👉 RULE — at least 2 words must match
//         if (common.length >= 2) {
//           matches.push({
//             voterstwentyName: t.voterName,
//             matchedName: vw.v.nameMarathi || "",
//             commonWords: common
//           });
//         }
//       }
//     }

//     res.json({
//       totalMatches: matches.length,
//       matches
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };


// const normalize = (str = "") =>
//   str
//     .replace(/[\/,]/g, "")
//     .replace(/\s+/g, " ")
//     .trim()
//     .split(" ")
//     .filter(Boolean);


// exports.getCommonVotersCount = async (req, res) => {
//   try {

//     // 1️⃣ voters → only Marathi name parts
//     const voters = await Voter.find(
//       {},
//       {
//         firstNameMarathi: 1,
//         middleNameMarathi: 1,
//         lastNameMarathi: 1,
//         nameMarathi: 1
//       }
//     );

//     // pre-tokenize voters (fast lookup)
//     const voterTokens = voters.map(v => {
//       const words = normalize(`
//         ${v.firstNameMarathi || ""}
//         ${v.middleNameMarathi || ""}
//         ${v.lastNameMarathi || ""}
//       `);

//       return { set: new Set(words), words, v };
//     });

//     // 2️⃣ voterstwenty
//     const twenty = await VoterTwenty.find(
//       {},
//       { voterName: 1, voterAddress: 1 }
//     );

//     const results = [];

//     for (const t of twenty) {

//       // 👉 first 3 words only
//       const tWords = normalize(t.voterName).slice(0, 3);

//       let matchedOnce = false;   // ⚡ avoid duplicate matches

//       for (const vw of voterTokens) {

//         let count = 0;
//         const common = [];

//         for (const w of tWords) {
//           if (vw.set.has(w)) {
//             count++;
//             common.push(w);

//             if (count === 2) break; // stop early after 2 matches
//           }
//         }

//         if (count >= 2) {
//           // ❗ Only ONE match per voterName
//           results.push({
//             voterName: t.voterName,
//             matchedName: vw.v.nameMarathi || "",
//             commonWords: common
//           });

//           matchedOnce = true;
//           break; // stop scanning other voters for this name
//         }
//       }
//     }

//     res.json({
//       totalMatches: results.length,
//       matches: results
//     });

//   } catch (err) {
//     console.error("MATCH ERROR", err);
//     res.status(500).json({ error: err.message });
//   }
// };



// const normalizeMarathi = (str = "") => {
//   return str
//     .normalize("NFD")
//     .replace(/[\u093C\u094D\u200D]/g, "")
//     .replace(/[\/,\.]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim()
//     .split(" ")
//     .filter(Boolean);
// };

// const splitVoterNames = (name = "") => {
//   return name
//     .replace(/व\s+इतर/g, "")     // "व इतर" remove (base name keep)
//     .split(/[\/]| व /)           // "/" OR " व " split
//     .map(n => n.trim())
//     .filter(Boolean);
// };



// // // 🔹 FAST : voterName (first 3 words) vs nameMarathi — 2-word match
// // exports.getCommonVotersCount = async (req, res) => {
// //   try {
// //     // voters → only nameMarathi
// //     const voters = await Voter.find({}, { nameMarathi: 1 });

// //     // voterstwentys → voterName
// //     const twList = await VoterTwenty.find({}, { voterName: 1 });

// //     // ⚡ build lookup (fast comparison)
// //     const voterIndex = voters.map(v => ({
// //       id: v._id,
// //       name: v.nameMarathi,
// //       words: new Set(normalizeMarathi(v.nameMarathi || ""))
// //     }));

// //     const results = [];

// //     for (const t of twList) {
// //       const first3 = normalizeMarathi(t.voterName).slice(0, 3);
// //       if (!first3.length) continue;

// //       for (const v of voterIndex) {
// //         const common = first3.filter(w => v.words.has(w));

// //         // 🔥 2 शब्द जुळले = MATCH
// //         if (common.length >= 2) {
// //           results.push({
// //             voterName: t.voterName,
// //             matchedWith: v.name,
// //             matchedWords: common
// //           });
// //           break; // same voterName → only one match
// //         }
// //       }
// //     }

// //     res.json({
// //       totalTwenty: twList.length,
// //       totalVoters: voters.length,
// //       matchCount: results.length,
// //       matches: results
// //     });

// //   } catch (err) {
// //     console.error("MATCH ERROR:", err);
// //     res.status(500).json({ error: "Match failed" });
// //   }
// // };


// exports.getCommonVotersCount = async (req, res) => {
//   try {
//     const voters = await Voter.find({}, { nameMarathi: 1 });
//     const twList = await VoterTwenty.find({}, { voterName: 1 });

//     // 🔹 voters index
//     const voterIndex = voters.map(v => ({
//       id: v._id,
//       nameMarathi: v.nameMarathi,
//       words: new Set(normalizeMarathi(v.nameMarathi || ""))
//     }));

//     const results = [];
//     const matchedBaseNames = new Set(); // 🔐 duplicate prevent

//     for (const t of twList) {
//       if (!t.voterName) continue;

//       // 🔹 split voterName into logical names
//       const nameParts = splitVoterNames(t.voterName);

//       for (const part of nameParts) {
//         const normalized = normalizeMarathi(part).slice(0, 3);
//         if (!normalized.length) continue;

//         const baseKey = normalized.join(" ");
//         if (matchedBaseNames.has(baseKey)) continue; // 🔥 repeat avoid

//         for (const v of voterIndex) {
//           const common = normalized.filter(w => v.words.has(w));

//           // 🔥 2+ word Marathi match
//           if (common.length >= 2) {
//             matchedBaseNames.add(baseKey);

//             results.push({
//               originalVoterName: t.voterName,
//               checkedPart: part,
//               matchedWith: v.nameMarathi,
//               matchedWords: common
//             });
//             break;
//           }
//         }
//       }
//     }

//     res.json({
//       totalTwenty: twList.length,
//       totalVoters: voters.length,
//       matchCount: results.length,
//       matches: results
//     });

//   } catch (err) {
//     console.error("MATCH ERROR:", err);
//     res.status(500).json({ error: "Match failed" });
//   }
// };
// =======================
// mobile matched

// const normalizeMarathi = (str = "") => {
//   return str
//     .normalize("NFD")
//     .replace(/[\u093C\u094D\u200D]/g, "")
//     .replace(/[\/,\.]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim()
//     .split(" ")
//     .filter(Boolean);
// };

// const splitVoterNames = (name = "") => {
//   return name
//     .replace(/व\s+इतर/g, "")
//     .split(/[\/]| व /)
//     .map(n => n.trim())
//     .filter(Boolean);
// };

// // 🔹 mobile normalize (NEW)
// const normalizeMobile = (m = "") =>
//   String(m).replace(/\D/g, "").slice(-10);

// exports.getCommonVotersCount = async (req, res) => {
//   try {
//     const voters = await Voter.find({}, {
//       nameMarathi: 1,
//       mobileNumberOne: 1,
//       mobileNumberTwo: 1
//     });

//     const twList = await VoterTwenty.find({}, {
//       voterName: 1,
//       mobileNumber: 1
//     });

//     // 🔹 voters index
//     const voterIndex = voters.map(v => ({
//       id: v._id,
//       nameMarathi: v.nameMarathi,
//       words: new Set(normalizeMarathi(v.nameMarathi || "")),
//       m1: normalizeMobile(v.mobileNumberOne),
//       m2: normalizeMobile(v.mobileNumberTwo)
//     }));

//     const results = [];
//     const matchedKeys = new Set(); // 🔐 duplicate avoid

//     for (const t of twList) {
//       const twMobile = normalizeMobile(t.mobileNumber || "");

//       // 🔹 NAME BASED MATCH (AS-IS)
//       if (t.voterName) {
//         const nameParts = splitVoterNames(t.voterName);

//         for (const part of nameParts) {
//           const normalized = normalizeMarathi(part).slice(0, 3);
//           if (!normalized.length) continue;

//           const key = normalized.join(" ");
//           if (matchedKeys.has(key)) continue;

//           for (const v of voterIndex) {
//             const common = normalized.filter(w => v.words.has(w));

//             if (common.length >= 2) {
//               matchedKeys.add(key);

//               results.push({
//                 originalVoterName: t.voterName,
//                 checkedPart: part,
//                 matchedWith: v.nameMarathi,
//                 matchedWords: common,
//                 mobileMatched: false
//               });
//               break;
//             }
//           }
//         }
//       }

//       // 🔹 MOBILE BASED MATCH (NEW – COUNT BOOSTER)
//       if (twMobile) {
//         for (const v of voterIndex) {
//           if (twMobile === v.m1 || twMobile === v.m2) {
//             const mKey = `MOBILE_${twMobile}`;
//             if (matchedKeys.has(mKey)) break;

//             matchedKeys.add(mKey);

//             results.push({
//               originalVoterName: t.voterName || null,
//               checkedPart: null,
//               matchedWith: v.nameMarathi,
//               matchedWords: [],
//               mobileMatched: true,
//               matchedMobile: twMobile
//             });
//             break;
//           }
//         }
//       }
//     }

//     res.json({
//       totalTwenty: twList.length,
//       totalVoters: voters.length,
//       matchCount: results.length,
//       matches: results
//     });

//   } catch (err) {
//     console.error("MATCH ERROR:", err);
//     res.status(500).json({ error: "Match failed" });
//   }
// };


// ========================================


// const normalizeMarathi = (str = "") => {
//   return str
//     .normalize("NFD")
//     .replace(/[\u093C\u094D\u200D]/g, "")
//     .replace(/[\/,\.]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim()
//     .split(" ")
//     .filter(Boolean);
// };

// const splitVoterNames = (name = "") => {
//   return name
//     .replace(/व\s+इतर/g, "")
//     .split(/[\/]| व /)
//     .map(n => n.trim())
//     .filter(Boolean);
// };

// // 🔹 MOBILE NORMALIZE (NUMBER → STRING FIX HERE)
// const normalizeMobile = (m) => {
//   if (m === null || m === undefined) return null;

//   // number / string काहीही असो → string मध्ये
//   const s = String(m).replace(/\D/g, "");
//   return s.length === 10 ? s : null;
// };

// exports.getCommonVotersCount = async (req, res) => {
//   try {
//     const voters = await Voter.find({}, {
//       nameMarathi: 1,
//       mobileNumberOne: 1,
//       mobileNumberTwo: 1
//     });

//     const twList = await VoterTwenty.find({}, {
//       voterName: 1,
//       mobileNumber: 1
//     });

//     // 🔹 voters index
//     const voterIndex = voters.map(v => ({
//       id: v._id,
//       nameMarathi: v.nameMarathi,
//       words: new Set(normalizeMarathi(v.nameMarathi || "")),
//       m1: normalizeMobile(v.mobileNumberOne),
//       m2: normalizeMobile(v.mobileNumberTwo)
//     }));

//     const results = [];
//     const matchedKeys = new Set(); // 🔐 duplicate avoid

//     for (const t of twList) {
//       const twMobile = normalizeMobile(t.mobileNumber);

//       /* ================= NAME BASED MATCH (UNCHANGED) ================= */
//       if (t.voterName) {
//         const nameParts = splitVoterNames(t.voterName);

//         for (const part of nameParts) {
//           const normalized = normalizeMarathi(part).slice(0, 3);
//           if (!normalized.length) continue;

//           const key = normalized.join(" ");
//           if (matchedKeys.has(key)) continue;

//           for (const v of voterIndex) {
//             const common = normalized.filter(w => v.words.has(w));

//             if (common.length >= 2) {
//               matchedKeys.add(key);

//               results.push({
//                 originalVoterName: t.voterName,
//                 checkedPart: part,
//                 matchedWith: v.nameMarathi,
//                 matchedWords: common,
//                 mobileMatched: false
//               });
//               break;
//             }
//           }
//         }
//       }

//       /* ================= MOBILE BASED MATCH (STRING SAFE) ================= */
//       if (twMobile) {
//         for (const v of voterIndex) {
//           if (
//             (v.m1 && String(twMobile) === String(v.m1)) ||
//             (v.m2 && String(twMobile) === String(v.m2))
//           ) {
//             const mKey = `MOBILE_${twMobile}`;
//             if (matchedKeys.has(mKey)) break;

//             matchedKeys.add(mKey);

//             results.push({
//               originalVoterName: t.voterName || null,
//               checkedPart: null,
//               matchedWith: v.nameMarathi,
//               matchedWords: [],
//               mobileMatched: true,
//               matchedMobile: twMobile
//             });
//             break;
//           }
//         }
//       }
//     }

//     res.json({
//       totalTwenty: twList.length,
//       totalVoters: voters.length,
//       matchCount: results.length,
//       matches: results
//     });

//   } catch (err) {
//     console.error("MATCH ERROR:", err);
//     res.status(500).json({ error: "Match failed" });
//   }
// };

// =========================================================
/* =======================
   MARATHI NORMALIZER
======================= */
// const normalizeMarathi = (str = "") => {
//   return str
//     .normalize("NFD")
//     .replace(/[\u093C\u094D\u200D]/g, "")
//     .replace(/[\/,\.]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim()
//     .split(" ")
//     .filter(Boolean);
// };

// /* =======================
//    WORDS TO IGNORE (USELESS PREFIX)
// ======================= */
// const IGNORE_WORDS = [
//   "तर्फे", "भागीदार",
//   "डेव्हलपर्स", "डेव्हलपर",
//   "प्रा", "प्रा."
// ];

// /* =======================
//    CLEAN NAME (REMOVE PREFIX)
// ======================= */
// const cleanName = (name = "") => {
//   let cleaned = name;
//   IGNORE_WORDS.forEach(w => {
//     const re = new RegExp(`\\b${w}\\b`, "g");
//     cleaned = cleaned.replace(re, "");
//   });
//   return cleaned.replace(/\s+/g, " ").trim();
// };

// /* =======================
//    SPLIT MULTIPLE NAMES
//    /  and  व
// ======================= */
// const splitVoterNames = (name = "") => {
//   return name
//     .split(/[\/]/)                         // "/" वर split
//     .flatMap(p => p.split(/\s+व\s+/))      // " व " वर split
//     .map(n => cleanName(n))                // useless prefix काढ
//     .filter(Boolean);
// };

// /* =======================
//    MOBILE NORMALIZE
// ======================= */
// const normalizeMobile = (m) => {
//   if (m === null || m === undefined) return null;
//   const s = String(m).replace(/\D/g, "");
//   return s.length === 10 ? s : null;
// };

// /* =======================
//    MAIN API
// ======================= */
// exports.getCommonVotersCount = async (req, res) => {
//   try {
//     const voters = await Voter.find({}, {
//       nameMarathi: 1,
//       mobileNumberOne: 1,
//       mobileNumberTwo: 1
//     });

//     const twList = await VoterTwenty.find({}, {
//       voterName: 1,
//       mobileNumber: 1
//     });

//     /* -------- build voter index -------- */
//     const voterIndex = voters.map(v => ({
//       nameMarathi: v.nameMarathi,
//       words: new Set(normalizeMarathi(v.nameMarathi || "")),
//       m1: normalizeMobile(v.mobileNumberOne),
//       m2: normalizeMobile(v.mobileNumberTwo)
//     }));

//     const results = [];
//     const matchedKeys = new Set(); // duplicate avoid

//     for (const t of twList) {
//       const twMobile = normalizeMobile(t.mobileNumber);

//       /* ========= NAME BASED MATCH (AS IT IS) ========= */
//       if (t.voterName) {
//         const nameParts = splitVoterNames(t.voterName);

//         for (const part of nameParts) {
//           const normalized = normalizeMarathi(part).slice(0, 3);
//           if (!normalized.length) continue;

//           const key = normalized.join(" ");
//           if (matchedKeys.has(key)) continue;

//           for (const v of voterIndex) {
//             const common = normalized.filter(w => v.words.has(w));

//             // 🔥 2 WORD MATCH
//             if (common.length >= 2) {
//               matchedKeys.add(key);
//               results.push({
//                 originalVoterName: t.voterName,
//                 checkedPart: part,
//                 matchedWith: v.nameMarathi,
//                 matchedWords: common,
//                 mobileMatched: false
//               });
//               break;
//             }
//           }
//         }
//       }

//       /* ========= MOBILE MATCH (UNCHANGED) ========= */
//       if (twMobile) {
//         for (const v of voterIndex) {
//           if (
//             (v.m1 && String(twMobile) === String(v.m1)) ||
//             (v.m2 && String(twMobile) === String(v.m2))
//           ) {
//             const mKey = `MOBILE_${twMobile}`;
//             if (matchedKeys.has(mKey)) break;

//             matchedKeys.add(mKey);
//             results.push({
//               originalVoterName: t.voterName || null,
//               checkedPart: null,
//               matchedWith: v.nameMarathi,
//               matchedWords: [],
//               mobileMatched: true,
//               matchedMobile: twMobile
//             });
//             break;
//           }
//         }
//       }
//     }

//     res.json({
//       totalTwenty: twList.length,
//       totalVoters: voters.length,
//       matchCount: results.length,
//       matches: results
//     });

//   } catch (err) {
//     console.error("MATCH ERROR:", err);
//     res.status(500).json({ error: "Match failed" });
//   }
// };



// ===============================

/* =======================
   MARATHI NORMALIZER
======================= */
// const normalizeMarathi = (str = "") => {
//   return str
//     .normalize("NFD")
//     .replace(/[\u093C\u094D\u200D]/g, "") // nukta, halant
//     .replace(/[\/,\.]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim()
//     .split(" ")
//     .filter(Boolean);
// };

// /* =======================
//    WORDS TO IGNORE
// ======================= */
// const IGNORE_WORDS = [
//   "तर्फे", "भागीदार",
//   "डेव्हलपर्स", "डेव्हलपर",
//   "प्रा", "प्रा."
// ];

// /* =======================
//    CLEAN NAME
// ======================= */
// const cleanName = (name = "") => {
//   let cleaned = name;
//   IGNORE_WORDS.forEach(w => {
//     const re = new RegExp(`\\b${w}\\b`, "g");
//     cleaned = cleaned.replace(re, "");
//   });
//   return cleaned.replace(/\s+/g, " ").trim();
// };

// /* =======================
//    SPLIT MULTIPLE NAMES
// ======================= */
// const splitVoterNames = (name = "") => {
//   return name
//     .split(/[\/]/)
//     .flatMap(p => p.split(/\s+व\s+/))
//     .map(n => cleanName(n))
//     .filter(Boolean);
// };

// /* =======================
//    MOBILE NORMALIZE
// ======================= */
// const normalizeMobile = (m) => {
//   if (m === null || m === undefined) return null;
//   const s = String(m).replace(/\D/g, "");
//   return s.length === 10 ? s : null;
// };

// /* =======================
//    2-WORD ORDER-INDEPENDENT MATCH
//    (पाल प्रमिला ↔ प्रमिला पाल)
// ======================= */
// const twoWordLooseMatch = (a = [], b = []) => {
//   if (a.length !== 2 || b.length < 2) return false;
//   return (
//     (a[0] === b[0] && a[1] === b[1]) ||
//     (a[0] === b[1] && a[1] === b[0])
//   );
// };

// /* =======================
//    MAIN API
// ======================= */
// exports.getCommonVotersCount = async (req, res) => {
//   try {
//     const voters = await Voter.find({}, {
//       nameMarathi: 1,
//       mobileNumberOne: 1,
//       mobileNumberTwo: 1
//     });

//     const twList = await VoterTwenty.find({}, {
//       voterName: 1,
//       mobileNumber: 1
//     });

//     /* -------- build voter index -------- */
//     const voterIndex = voters.map(v => ({
//       nameMarathi: v.nameMarathi,
//       wordsArr: normalizeMarathi(v.nameMarathi || ""),
//       wordsSet: new Set(normalizeMarathi(v.nameMarathi || "")),
//       m1: normalizeMobile(v.mobileNumberOne),
//       m2: normalizeMobile(v.mobileNumberTwo)
//     }));

//     const results = [];
//     const matchedKeys = new Set(); // duplicate avoid

//     for (const t of twList) {
//       const twMobile = normalizeMobile(t.mobileNumber);

//       /* ========= NAME BASED MATCH ========= */
//       if (t.voterName) {
//         const nameParts = splitVoterNames(t.voterName);

//         for (const part of nameParts) {
//           const normalized = normalizeMarathi(part).slice(0, 3);
//           if (!normalized.length) continue;

//           const key = normalized.join(" ");
//           if (matchedKeys.has(key)) continue;

//           for (const v of voterIndex) {
//             const common = normalized.filter(w => v.wordsSet.has(w));

//             const normalMatch = common.length >= 2;
//             const looseTwoWord =
//               normalized.length === 2 &&
//               twoWordLooseMatch(normalized, v.wordsArr.slice(0, 2));

//             if (normalMatch || looseTwoWord) {
//               matchedKeys.add(key);
//               results.push({
//                 originalVoterName: t.voterName,
//                 checkedPart: part,
//                 matchedWith: v.nameMarathi,
//                 matchedWords: common.length ? common : normalized,
//                 mobileMatched: false
//               });
//               break;
//             }
//           }
//         }
//       }

//       /* ========= MOBILE MATCH (UNCHANGED) ========= */
//       if (twMobile) {
//         for (const v of voterIndex) {
//           if (
//             (v.m1 && String(twMobile) === String(v.m1)) ||
//             (v.m2 && String(twMobile) === String(v.m2))
//           ) {
//             const mKey = `MOBILE_${twMobile}`;
//             if (matchedKeys.has(mKey)) break;

//             matchedKeys.add(mKey);
//             results.push({
//               originalVoterName: t.voterName || null,
//               checkedPart: null,
//               matchedWith: v.nameMarathi,
//               matchedWords: [],
//               mobileMatched: true,
//               matchedMobile: twMobile
//             });
//             break;
//           }
//         }
//       }
//     }

//     res.json({
//       totalTwenty: twList.length,
//       totalVoters: voters.length,
//       matchCount: results.length,
//       matches: results
//     });

//   } catch (err) {
//     console.error("MATCH ERROR:", err);
//     res.status(500).json({ error: "Match failed" });
//   }
// };


// ===================================================
/* =======================
   MARATHI NORMALIZER
   (19–20 level fuzzy)
======================= */
// const normalizeMarathi = (str = "") => {
//   return str
//     .normalize("NFD")

//     // 🔹 nukta, halant, ZWJ काढ (जोडाक्षर soft)
//     .replace(/[\u093C\u094D\u200D]/g, "")

//     // 🔹 अनुस्वार (ं) ignore
//     .replace(/\u0902/g, "")

//     // 🔹 वेळांटी mismatch चालेल (ि / ी)
//     .replace(/[इई]/g, "इ")

//     // 🔹 उकार mismatch चालेल (ु / ू)
//     .replace(/[उऊ]/g, "उ")

//     // 🔹 ए / ऐ mismatch
//     .replace(/[एऐ]/g, "ए")

//     // 🔹 ओ / औ mismatch
//     .replace(/[ओऔ]/g, "ओ")

//     // 🔹 जोडाक्षर soft (कर्नाटक मराठी real cases)
//     .replace(/र्न/g, "न")   // कर्नाटक → कनाटक
//     .replace(/व्य/g, "व")   // व्यवसाय → वसाय
//     .replace(/त्र/g, "त")   // मित्र → मितर

//     // punctuation + space cleanup
//     .replace(/[\/,\.]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim()
//     .split(" ")
//     .filter(Boolean);
// };

// /* =======================
//    WORDS TO IGNORE
// ======================= */
// const IGNORE_WORDS = [
//   "तर्फे", "भागीदार",
//   "डेव्हलपर्स", "डेव्हलपर"
// ];

// /* =======================
//    CLEAN NAME
// ======================= */
// const cleanName = (name = "") => {
//   let cleaned = name;
//   IGNORE_WORDS.forEach(w => {
//     const re = new RegExp(`\\b${w}\\b`, "g");
//     cleaned = cleaned.replace(re, "");
//   });
//   return cleaned.replace(/\s+/g, " ").trim();
// };

// /* =======================
//    SPLIT MULTIPLE NAMES
// ======================= */
// const splitVoterNames = (name = "") => {
//   return name
//     .split(/[\/]/)
//     .flatMap(p => p.split(/\s+व\s+/))
//     .map(n => cleanName(n))
//     .filter(Boolean);
// };

// /* =======================
//    MOBILE NORMALIZE
// ======================= */
// const normalizeMobile = (m) => {
//   if (m === null || m === undefined) return null;
//   const s = String(m).replace(/\D/g, "");
//   return s.length === 10 ? s : null;
// };

// /* =======================
//    2-WORD ORDER-INDEPENDENT MATCH
// ======================= */
// const twoWordLooseMatch = (a = [], b = []) => {
//   if (a.length !== 2 || b.length < 2) return false;
//   return (
//     (a[0] === b[0] && a[1] === b[1]) ||
//     (a[0] === b[1] && a[1] === b[0])
//   );
// };

// /* =======================
//    MAIN API
// ======================= */
// exports.getCommonVotersCount = async (req, res) => {
//   try {
//     const voters = await Voter.find({}, {
//       nameMarathi: 1,
//       mobileNumberOne: 1,
//       mobileNumberTwo: 1
//     });

//     const twList = await VoterTwenty.find({}, {
//       voterName: 1,
//       mobileNumber: 1
//     });

//     /* -------- build voter index -------- */
//     const voterIndex = voters.map(v => ({
//       nameMarathi: v.nameMarathi,
//       wordsArr: normalizeMarathi(v.nameMarathi || ""),
//       wordsSet: new Set(normalizeMarathi(v.nameMarathi || "")),
//       m1: normalizeMobile(v.mobileNumberOne),
//       m2: normalizeMobile(v.mobileNumberTwo)
//     }));

//     const results = [];
//     const matchedKeys = new Set(); // duplicate avoid

//     for (const t of twList) {
//       const twMobile = normalizeMobile(t.mobileNumber);

//       /* ========= NAME BASED MATCH ========= */
//       if (t.voterName) {
//         const nameParts = splitVoterNames(t.voterName);

//         for (const part of nameParts) {
//           const normalized = normalizeMarathi(part).slice(0, 3);
//           if (!normalized.length) continue;

//           const key = normalized.join(" ");
//           if (matchedKeys.has(key)) continue;

//           for (const v of voterIndex) {
//             const common = normalized.filter(w => v.wordsSet.has(w));

//             const normalMatch = common.length >= 2;
//             const looseTwoWord =
//               normalized.length === 2 &&
//               twoWordLooseMatch(normalized, v.wordsArr.slice(0, 2));

//             if (normalMatch || looseTwoWord) {
//               matchedKeys.add(key);
//               results.push({
//                 originalVoterName: t.voterName,
//                 checkedPart: part,
//                 matchedWith: v.nameMarathi,
//                 matchedWords: common.length ? common : normalized,
//                 mobileMatched: false
//               });
//               break;
//             }
//           }
//         }
//       }

//       /* ========= MOBILE MATCH (UNCHANGED) ========= */
//       if (twMobile) {
//         for (const v of voterIndex) {
//           if (
//             (v.m1 && String(twMobile) === String(v.m1)) ||
//             (v.m2 && String(twMobile) === String(v.m2))
//           ) {
//             const mKey = `MOBILE_${twMobile}`;
//             if (matchedKeys.has(mKey)) break;

//             matchedKeys.add(mKey);
//             results.push({
//               originalVoterName: t.voterName || null,
//               checkedPart: null,
//               matchedWith: v.nameMarathi,
//               matchedWords: [],
//               mobileMatched: true,
//               matchedMobile: twMobile
//             });
//             break;
//           }
//         }
//       }
//     }

//     res.json({
//       totalTwenty: twList.length,
//       totalVoters: voters.length,
//       matchCount: results.length,
//       matches: results
//     });

//   } catch (err) {
//     console.error("MATCH ERROR:", err);
//     res.status(500).json({ error: "Match failed" });
//   }
// };
// ==============================================







// const normalizeMarathi = (str = "") => {
//   return str
//     .normalize("NFD")

//     // 🔹 nukta, halant, ZWJ काढ (जोडाक्षर soft)
//     .replace(/[\u093C\u094D\u200D]/g, "")

//     // 🔹 अनुस्वार (ं) ignore
//     .replace(/\u0902/g, "")

//     // 🔹 चंद्रबिंदू (ँ) ignore
//     .replace(/\u0901/g, "")

//     // 🔹 विसर्ग (ः) ignore
//     .replace(/\u0903/g, "")

//     // 🔹 वेळांटी mismatch चालेल (ि / ी)
//     .replace(/[इई]/g, "इ")

//     // 🔹 उकार mismatch चालेल (ु / ू)
//     .replace(/[उऊ]/g, "उ")

//     // 🔹 ए / ऐ mismatch
//     .replace(/[एऐ]/g, "ए")

//     // 🔹 ओ / औ mismatch
//     .replace(/[ओऔ]/g, "ओ")

//     // 🔹 जोडाक्षर soft (real Marathi cases)
//     .replace(/र्न/g, "न")   // कर्नाटक → कनाटक
//     .replace(/व्य/g, "व")   // व्यवसाय → वसाय
//     .replace(/त्र/g, "त")   // मित्र → मितर
//     .replace(/द्र/g, "द")   // द्राक्ष → दाक्ष

//     // 🔹 punctuation + dot cleanup
//     .replace(/[\/,\.·]/g, " ")

//     // 🔹 extra spaces ignore
//     .replace(/\s+/g, " ")
//     .trim()
//     .split(" ")
//     .filter(Boolean);
// };

// /* =======================
//    WORDS TO IGNORE
// ======================= */
// const IGNORE_WORDS = [
//   "तर्फे", "भागीदार",
//   "डेव्हलपर्स", "डेव्हलपर"
// ];

// /* =======================
//    CLEAN NAME
// ======================= */
// const cleanName = (name = "") => {
//   let cleaned = name;
//   IGNORE_WORDS.forEach(w => {
//     const re = new RegExp(`\\b${w}\\b`, "g");
//     cleaned = cleaned.replace(re, "");
//   });
//   return cleaned.replace(/\s+/g, " ").trim();
// };

// /* =======================
//    SPLIT MULTIPLE NAMES
// ======================= */
// const splitVoterNames = (name = "") => {
//   return name
//     .split(/[\/]/)
//     .flatMap(p => p.split(/\s+व\s+/))
//     .map(n => cleanName(n))
//     .filter(Boolean);
// };

// /* =======================
//    MOBILE NORMALIZE
// ======================= */
// const normalizeMobile = (m) => {
//   if (m === null || m === undefined) return null;
//   const s = String(m).replace(/\D/g, "");
//   return s.length === 10 ? s : null;
// };

// /* =======================
//    2-WORD ORDER-INDEPENDENT MATCH
//    (extra spaces ignored)
// ======================= */
// const twoWordLooseMatch = (a = [], b = []) => {
//   const cleanA = a.map(w => w.trim()).filter(Boolean);
//   const cleanB = b.map(w => w.trim()).filter(Boolean);

//   if (cleanA.length !== 2 || cleanB.length < 2) return false;

//   return (
//     (cleanA[0] === cleanB[0] && cleanA[1] === cleanB[1]) ||
//     (cleanA[0] === cleanB[1] && cleanA[1] === cleanB[0])
//   );
// };

// /* =======================
//    MAIN API
// ======================= */
// exports.getCommonVotersCount = async (req, res) => {
//   try {
//     const voters = await Voter.find({}, {
//       nameMarathi: 1,
//       mobileNumberOne: 1,
//       mobileNumberTwo: 1
//     });

//     const twList = await VoterTwenty.find({}, {
//       voterName: 1,
//       mobileNumber: 1
//     });

//     /* -------- build voter index -------- */
//     const voterIndex = voters.map(v => ({
//       nameMarathi: v.nameMarathi,
//       wordsArr: normalizeMarathi(v.nameMarathi || ""),
//       wordsSet: new Set(normalizeMarathi(v.nameMarathi || "")),
//       m1: normalizeMobile(v.mobileNumberOne),
//       m2: normalizeMobile(v.mobileNumberTwo)
//     }));

//     const results = [];
//     const matchedKeys = new Set(); // duplicate avoid

//     for (const t of twList) {
//       const twMobile = normalizeMobile(t.mobileNumber);

//       /* ========= NAME BASED MATCH ========= */
//       if (t.voterName) {
//         const nameParts = splitVoterNames(t.voterName);

//         for (const part of nameParts) {
//           const normalized = normalizeMarathi(part).slice(0, 3);
//           if (!normalized.length) continue;

//           const key = normalized.join(" ");
//           if (matchedKeys.has(key)) continue;

//           for (const v of voterIndex) {
//             const common = normalized.filter(w => v.wordsSet.has(w));

//             const normalMatch = common.length >= 2;
//             const looseTwoWord =
//               normalized.length === 2 &&
//               twoWordLooseMatch(normalized, v.wordsArr.slice(0, 2));

//             if (normalMatch || looseTwoWord) {
//               matchedKeys.add(key);
//               results.push({
//                 originalVoterName: t.voterName,
//                 checkedPart: part,
//                 matchedWith: v.nameMarathi,
//                 matchedWords: common.length ? common : normalized,
//                 mobileMatched: false
//               });
//               break;
//             }
//           }
//         }
//       }

//       /* ========= MOBILE MATCH (UNCHANGED) ========= */
//       if (twMobile) {
//         for (const v of voterIndex) {
//           if (
//             (v.m1 && String(twMobile) === String(v.m1)) ||
//             (v.m2 && String(twMobile) === String(v.m2))
//           ) {
//             const mKey = `MOBILE_${twMobile}`;
//             if (matchedKeys.has(mKey)) break;

//             matchedKeys.add(mKey);
//             results.push({
//               originalVoterName: t.voterName || null,
//               checkedPart: null,
//               matchedWith: v.nameMarathi,
//               matchedWords: [],
//               mobileMatched: true,
//               matchedMobile: twMobile
//             });
//             break;
//           }
//         }
//       }
//     }

//     res.json({
//       totalTwenty: twList.length,
//       totalVoters: voters.length,
//       matchCount: results.length,
//       matches: results
//     });

//   } catch (err) {
//     console.error("MATCH ERROR:", err);
//     res.status(500).json({ error: "Match failed" });
//   }
// };



// ==============================================

// const normalizeMarathi = (str = "") => {
//   return str
//     .normalize("NFD")
//     .replace(/[\u093C\u094D\u200D]/g, "")
//     .replace(/\u0902/g, "")
//     .replace(/[इई]/g, "इ")
//     .replace(/[उऊ]/g, "उ")
//     .replace(/[एऐ]/g, "ए")
//     .replace(/[ओऔ]/g, "ओ")
//     .replace(/र्न/g, "न")
//     .replace(/व्य/g, "व")
//     .replace(/त्र/g, "त")
//     .replace(/[\/,\.]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim()
//     .split(" ")
//     .filter(Boolean);
// };

// /* =======================
//    WORDS TO IGNORE
// ======================= */
// const IGNORE_WORDS = ["तर्फे", "भागीदार", "डेव्हलपर्स", "डेव्हलपर"];

// /* =======================
//    CLEAN NAME
// ======================= */
// const cleanName = (name = "") => {
//   let cleaned = name;
//   IGNORE_WORDS.forEach(w => {
//     const re = new RegExp(`\\b${w}\\b`, "g");
//     cleaned = cleaned.replace(re, "");
//   });
//   return cleaned.replace(/\s+/g, " ").trim();
// };

// /* =======================
//    SPLIT MULTIPLE NAMES
// ======================= */
// const splitVoterNames = (name = "") => {
//   return name
//     .split(/[\/]/)
//     .flatMap(p => p.split(/\s+व\s+/))
//     .map(n => cleanName(n))
//     .filter(Boolean);
// };

// /* =======================
//    MOBILE NORMALIZE
// ======================= */
// const normalizeMobile = (m) => {
//   if (m === null || m === undefined) return null;
//   const s = String(m).replace(/\D/g, "");
//   return s.length === 10 ? s : null;
// };

// /* =======================
//    2-WORD ORDER-INDEPENDENT MATCH
// ======================= */
// const twoWordLooseMatch = (a = [], b = []) => {
//   if (a.length !== 2 || b.length < 2) return false;
//   return (
//     (a[0] === b[0] && a[1] === b[1]) ||
//     (a[0] === b[1] && a[1] === b[0])
//   );
// };

// /* =======================
//    MAIN API
// ======================= */
// exports.getCommonVotersCount = async (req, res) => {
//   try {
//     // 🔥 FULL voter objects fetch (nothing lost)
//     const voters = await Voter.find({});

//     const twList = await VoterTwenty.find({}, {
//       voterName: 1,
//       mobileNumber: 1
//     });

//     /* -------- build voter index -------- */
//     const voterIndex = voters.map(v => ({
//       voter: v, // 👈 FULL ROW STORED
//       nameMarathi: v.nameMarathi,
//       wordsArr: normalizeMarathi(v.nameMarathi || ""),
//       wordsSet: new Set(normalizeMarathi(v.nameMarathi || "")),
//       m1: normalizeMobile(v.mobileNumberOne),
//       m2: normalizeMobile(v.mobileNumberTwo)
//     }));

//     const results = [];
//     const matchedKeys = new Set();

//     for (const t of twList) {
//       const twMobile = normalizeMobile(t.mobileNumber);

//       /* ========= NAME BASED MATCH ========= */
//       if (t.voterName) {
//         const nameParts = splitVoterNames(t.voterName);

//         for (const part of nameParts) {
//           const normalized = normalizeMarathi(part).slice(0, 3);
//           if (!normalized.length) continue;

//           const key = normalized.join(" ");
//           if (matchedKeys.has(key)) continue;

//           for (const v of voterIndex) {
//             const common = normalized.filter(w => v.wordsSet.has(w));

//             const normalMatch = common.length >= 2;
//             const looseTwoWord =
//               normalized.length === 2 &&
//               twoWordLooseMatch(normalized, v.wordsArr.slice(0, 2));

//             if (normalMatch || looseTwoWord) {
//               matchedKeys.add(key);

//               results.push({
//                 originalVoterName: t.voterName,
//                 checkedPart: part,
//                 matchedWords: common.length ? common : normalized,
//                 mobileMatched: false,

//                 // 🔥 voters मधला FULL OBJECT (row)
//                 ...v.voter.toObject()
//               });
//               break;
//             }
//           }
//         }
//       }

//       /* ========= MOBILE MATCH ========= */
//       if (twMobile) {
//         for (const v of voterIndex) {
//           if (
//             (v.m1 && String(twMobile) === String(v.m1)) ||
//             (v.m2 && String(twMobile) === String(v.m2))
//           ) {
//             const mKey = `MOBILE_${twMobile}`;
//             if (matchedKeys.has(mKey)) break;

//             matchedKeys.add(mKey);

//             results.push({
//               originalVoterName: t.voterName || null,
//               checkedPart: null,
//               matchedWords: [],
//               mobileMatched: true,
//               matchedMobile: twMobile,

//               // 🔥 FULL voter row
//               ...v.voter.toObject()
//             });
//             break;
//           }
//         }
//       }
//     }

//     res.json({
//       totalTwenty: twList.length,
//       totalVoters: voters.length,
//       matchCount: results.length,
//       matches: results,
//       backgroundColor:'#50C878'
//     });

//   } catch (err) {
//     console.error("MATCH ERROR:", err);
//     res.status(500).json({ error: "Match failed" });
//   }
// };

// =========================================
const normalizeMarathi = (str = "") => {
  return str
    .normalize("NFD")
    .replace(/[\u093C\u094D\u200D]/g, "")
    .replace(/\u0902/g, "")
    .replace(/[इई]/g, "इ")
    .replace(/[उऊ]/g, "उ")
    .replace(/[एऐ]/g, "ए")
    .replace(/[ओऔ]/g, "ओ")
    .replace(/र्न/g, "न")
    .replace(/व्य/g, "व")
    .replace(/त्र/g, "त")
    .replace(/[\/,\.]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
};

/* =======================
   WORDS TO IGNORE
======================= */
const IGNORE_WORDS = [
  "तर्फे",
  "भागीदार",
  "डेव्हलपर्स",
  "डेव्हलपर"
];

/* =======================
   CLEAN NAME
======================= */
const cleanName = (name = "") => {
  let cleaned = name;
  IGNORE_WORDS.forEach(w => {
    const re = new RegExp(`\\b${w}\\b`, "g");
    cleaned = cleaned.replace(re, "");
  });
  return cleaned.replace(/\s+/g, " ").trim();
};

/* =======================
   SPLIT MULTIPLE NAMES
======================= */
const splitVoterNames = (name = "") => {
  return name
    .split(/[\/]/)
    .flatMap(p => p.split(/\s+व\s+/))
    .map(n => cleanName(n))
    .filter(Boolean);
};

/* =======================
   MOBILE NORMALIZE
======================= */
const normalizeMobile = (m) => {
  if (m === null || m === undefined) return null;
  const s = String(m).replace(/\D/g, "");
  return s.length === 10 ? s : null;
};

/* =======================
   2-WORD ORDER-INDEPENDENT MATCH
======================= */
const twoWordLooseMatch = (a = [], b = []) => {
  if (a.length !== 2 || b.length < 2) return false;
  return (
    (a[0] === b[0] && a[1] === b[1]) ||
    (a[0] === b[1] && a[1] === b[0])
  );
};

/* =======================
   MAIN API
======================= */
exports.getCommonVotersCount = async (req, res) => {
  try {
    // 🔥 FULL voters (nothing lost)
    const voters = await Voter.find({});

    // 🔥 VoterTwenty with address
    const twList = await VoterTwenty.find({}, {
      voterName: 1,
      mobileNumber: 1,
      voterAddress: 1 // 👈 IMPORTANT (VoterTwenty address)
    });

    /* -------- build voter index -------- */
    const voterIndex = voters.map(v => ({
      voter: v, // FULL voter row
      nameMarathi: v.nameMarathi,
      wordsArr: normalizeMarathi(v.nameMarathi || ""),
      wordsSet: new Set(normalizeMarathi(v.nameMarathi || "")),
      m1: normalizeMobile(v.mobileNumberOne),
      m2: normalizeMobile(v.mobileNumberTwo)
    }));

    const results = [];
    const matchedKeys = new Set();

    for (const t of twList) {
      const twMobile = normalizeMobile(t.mobileNumber);

      /* ========= NAME BASED MATCH ========= */
      if (t.voterName) {
        const nameParts = splitVoterNames(t.voterName);

        for (const part of nameParts) {
          const normalized = normalizeMarathi(part).slice(0, 3);
          if (!normalized.length) continue;

          const key = normalized.join(" ");
          if (matchedKeys.has(key)) continue;

          for (const v of voterIndex) {
            const common = normalized.filter(w => v.wordsSet.has(w));

            const normalMatch = common.length >= 2;
            const looseTwoWord =
              normalized.length === 2 &&
              twoWordLooseMatch(normalized, v.wordsArr.slice(0, 2));

            if (normalMatch || looseTwoWord) {
              matchedKeys.add(key);

              results.push({
                originalVoterName: t.voterName,
                checkedPart: part,
                matchedWords: common.length ? common : normalized,
                mobileMatched: false,

                // ✅ VoterTwenty address extra
                voterTwentyAddress: t.voterAddress || null,

                // ✅ FULL voter row
                ...v.voter.toObject()
              });
              break;
            }
          }
        }
      }

      /* ========= MOBILE MATCH ========= */
      if (twMobile) {
        for (const v of voterIndex) {
          if (
            (v.m1 && String(twMobile) === String(v.m1)) ||
            (v.m2 && String(twMobile) === String(v.m2))
          ) {
            const mKey = `MOBILE_${twMobile}`;
            if (matchedKeys.has(mKey)) break;

            matchedKeys.add(mKey);

            results.push({
              originalVoterName: t.voterName || null,
              checkedPart: null,
              matchedWords: [],
              mobileMatched: true,
              matchedMobile: twMobile,

              // ✅ VoterTwenty address
              voterTwentyAddress: t.voterAddress || null,

              // ✅ FULL voter row
              ...v.voter.toObject()
            });
            break;
          }
        }
      }
    }

    res.json({
      totalTwenty: twList.length,
      totalVoters: voters.length,
      matchCount: results.length,
      matches: results,
      backgroundColor: "#50C878"
    });

  } catch (err) {
    console.error("MATCH ERROR:", err);
    res.status(500).json({ error: "Match failed" });
  }
};

// ==============================================================
// const uri = "mongodb://127.0.0.1:27017";
// const client = new MongoClient(uri);

// // 🔹 order-independent + case-insensitive normalize
// const normalizeWordshun = (str = "") =>
//   String(str)
//     .toLowerCase()
//     .replace(/[\/,\.]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim()
//     .split(" ")
//     .filter(Boolean);

// // 🔥 Both sides words must match (order ignore)
// const nameEqualhun = (a = "", b = "") => {
//   const A = new Set(normalizeWordshun(a));
//   const B = new Set(normalizeWordshun(b));

//   if (!A.size || !B.size) return false;

//   for (const w of A) {
//     if (!B.has(w)) return false;
//   }
//   return true;
// };

// exports.propertyNineHundredsMatch = async (req, res) => {
//   try {
//     await client.connect();
//     const db = client.db("votingDB");

//     // native collection (NO model)
//     const nineCol = db.collection("fourteenkeighthundreadvoteids");
//     const nineList = await nineCol.find({}).toArray();

//     // mongoose collection
//     const propertyList = await Propertytaxenglish.find({});

//     const results = [];
//     const matched = new Set();

//     for (const p of propertyList) {
//       if (!p.namePropertyTaxEnglish) continue;

//       for (const n of nineList) {
//         if (!n.nname) continue;

//         // 🔥 CASE-INSENSITIVE + ULTA-PULTA WORD MATCH
//         if (!nameEqualhun(p.namePropertyTaxEnglish, n.nname)) continue;

//         const key = `${p._id}_${n._id}`;
//         if (matched.has(key)) break;

//         matched.add(key);

//         results.push({
//           // propertytaxenglishs full record
//           propertyId: p._id,
//           namePropertyTaxEnglish: p.namePropertyTaxEnglish,
//           namePropertyTaxMarathi: p.namePropertyTaxMarathi,
//           addressPropertyTaxtMarathi: p.addressPropertyTaxtMarathi,
//           mobileNumberPropertyTax: p.mobileNumberPropertyTax,

//           // ninehundreads full record
//           nineId: n._id,
//           nname: n.nname,
//           wardNumber: n.wardNumber,
//           corporation: n.corporation,
//           voterId: n.voterId,
//         });

//         break; // 🔹 match मिळाल्यानंतर पुढचा record
//       }
//     }

//     res.json({
//       totalProperty: propertyList.length,
//       totalNineRecords: nineList.length,
//       matchCount: results.length,
//       matches: results,
//     });

//   } catch (err) {
//     console.error("MATCH ERROR:", err);
//     res.status(500).json({ error: "Matching failed" });
//   } finally {
//     await client.close();
//   }
// };






const { MongoClient } = require("mongodb");
// const Voter = require("../models/voter");

const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

exports.fourteenkeightVoterID = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("votingDB");

    // native collection
    const idsCol = db.collection("fourteenkeighthundreadvoteids");

    // get all voterIds from the table
    const idsList = await idsCol.find({}, { projection: { voterId: 1 } }).toArray();

    const voterIds = idsList.map(x => x.voterId).filter(Boolean);

    console.log("TOTAL IDS:", voterIds.length);

    // fetch matching voters
    const matchedVoters = await Voter.find({
      voterId: { $in: voterIds }
    }).lean();

    // map ids -> full id record
    const idMap = new Map();
    idsList.forEach(i => idMap.set(i.voterId, i));

    const results = matchedVoters.map(v => ({
      voterTable: v,
      fourteenEightHundredTable: idMap.get(v.voterId) || null
    }));

    res.json({
      totalFourteenEightIds: voterIds.length,
      totalVotersFound: matchedVoters.length,
      matches: results
    });

  } catch (err) {
    console.error("MATCH ERROR:", err);
    res.status(500).json({ error: "Matching failed" });
  } finally {
    await client.close();
  }
};





// exports.fourteenkeightVotersAll = async (req, res) => {
//   try {
//     await client.connect();
//     const db = client.db("votingDB");

//     // native collection
//     const idsCol = db.collection("fourteenkeightVoters");

//     // get all voterIds from the table
//     const idsList = await idsCol.find({}, { projection: { voterId: 1 } }).toArray();

//     const voterIds = idsList.map(x => x.voterId).filter(Boolean);

//     console.log("TOTAL IDS:", voterIds.length);

//     // fetch matching voters
//     const matchedVoters = await Voter.find({
//       voterId: { $in: voterIds }
//     }).lean();

//     // map ids -> full id record
//     const idMap = new Map();
//     idsList.forEach(i => idMap.set(i.voterId, i));

//     const results = matchedVoters.map(v => ({
//       voterTable: v,
//       fourteenEightHundredTable: idMap.get(v.voterId) || null
//     }));

//     res.json({
//       totalFourteenEightIds: voterIds.length,
//       totalVotersFound: matchedVoters.length,
//       matches: results
//     });

//   } catch (err) {
//     console.error("MATCH ERROR:", err);
//     res.status(500).json({ error: "Matching failed" });
//   } finally {
//     await client.close();
//   }
// };


// =======================================================

// // 14k data math with 38k =>respose 7527
// exports.fourteenkeightVotersAll = async (req, res) => {
//   try {
//     await client.connect();
//     const db = client.db("votingDB");

//     // table : fourteenkeightVoters
//     const idsCol = db.collection("fourteenkeightVoters");

//     // get all voterId + full record
//     const idsList = await idsCol.find({}).toArray();

//     const voterIds = idsList.map(x => x.voterId).filter(Boolean);

//     console.log("TOTAL IDS:", voterIds.length);

//     // fetch voters table records
//     const matchedVoters = await Voter.find({
//       voterId: { $in: voterIds }
//     }).lean();

//     // map voterId -> fourteenkeight record
//     const idMap = new Map();
//     idsList.forEach(r => idMap.set(r.voterId, r));

//     const results = matchedVoters.map(v => {
//       const extra = idMap.get(v.voterId) || {};

//       // ⭐ merge both FULL records (no field lost)
//       return {
//         ...v,      // voters table full record
//         ...extra,  // fourteenkeightVoters full record
//         homeNumberMarathiResult:
//           v?.homeNumberMarathi?.result ?? null
 
//       };
//     });

//     res.json({
//       totalFourteenEightIds: voterIds.length,
//       totalVotersFound: matchedVoters.length,
//       matchCount: results.length,
//       matches: results
//     });

//   } catch (err) {
//     console.error("MATCH ERROR:", err);
//     res.status(500).json({ error: "Matching failed" });
//   } finally {
//     await client.close();
//   }
// };

// ----------------------
// 14k data match with 38k => response ~7527 but json yeil to buildingName sort karun aahe
exports.fourteenkeightVotersAll = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("votingDB");

    // table : fourteenkeightVoters
    const idsCol = db.collection("fourteenkeightVoters");

    // get all voterId + full record
    const idsList = await idsCol.find({}).toArray();

    const voterIds = idsList.map(x => x.voterId).filter(Boolean);

    console.log("TOTAL IDS:", voterIds.length);

    // fetch voters table records
    const matchedVoters = await Voter.find({
      voterId: { $in: voterIds }
    }).lean();

    // map voterId -> fourteenkeight record
    const idMap = new Map();
    idsList.forEach(r => idMap.set(r.voterId, r));

    let results = matchedVoters.map(v => {
      const extra = idMap.get(v.voterId) || {};

      return {
        ...v,        // voters table full record
        ...extra,    // fourteenkeightVoters full record
        homeNumberMarathiResult:
          v?.homeNumberMarathi?.result ?? null
      };
    });

    // ✅ 🔥 SORT BY buildingName (Alphabetical)
    results.sort((a, b) => {
      const nameA = (a.buildingName || "").toLowerCase().trim();
      const nameB = (b.buildingName || "").toLowerCase().trim();
      return nameA.localeCompare(nameB, "en", { sensitivity: "base" });
    });

    res.json({
      totalFourteenEightIds: voterIds.length,
      totalVotersFound: matchedVoters.length,
      matchCount: results.length,
      matches: results
    });

  } catch (err) {
    console.error("MATCH ERROR:", err);
    res.status(500).json({ error: "Matching failed" });
  } finally {
    await client.close();
  }
};




// =======================================================

// 7527 data match with voters te sodun rahilele records pahijet

// exports.sevenkUnMatchThirtyEightk = async (req, res) => {
//   try {
//     await client.connect();
//     const db = client.db("votingDB");

//     // table : fourteenkeightVoters
//     const idsCol = db.collection("finalsevenkVoterIdMobileAddress");

//     // get all voterId + full record
//     const idsList = await idsCol.find({}).toArray();

//     const voterIds = idsList.map(x => x.voterId).filter(Boolean);

//     console.log("TOTAL IDS:", voterIds.length);

//     // fetch voters table records
//     const matchedVoters = await Voter.find({
//       voterId: { $in: voterIds }
//     }).lean();

//     // map voterId -> fourteenkeight record
//     const idMap = new Map();
//     idsList.forEach(r => idMap.set(r.voterId, r));

//     const results = matchedVoters.map(v => {
//       const extra = idMap.get(v.voterId) || {};

//       // ⭐ merge both FULL records (no field lost)
//       return {
//         ...v,      // voters table full record
//         ...extra   // fourteenkeightVoters full record
//       };
//     });

//     res.json({
//       totalFourteenEightIds: voterIds.length,
//       totalVotersFound: matchedVoters.length,
//       matchCount: results.length,
//       matches: results
//     });

//   } catch (err) {
//     console.error("MATCH ERROR:", err);
//     res.status(500).json({ error: "Matching failed" });
//   } finally {
//     await client.close();
//   }
// };

exports.sevenkUnMatchThirtyEightk = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("votingDB");

    const idsCol = db.collection("finalsevenkVoterIdMobileAddress");

    // 7K table full records
    const idsList = await idsCol.find({}).toArray();
    const voterIds = idsList.map(x => x.voterId).filter(Boolean);

    // voters table matched records
    const matchedVoters = await Voter.find({
      voterId: { $in: voterIds }
    }).lean();

    // map voterId -> 7k record
    const idMap = new Map();
    idsList.forEach(r => idMap.set(r.voterId, r));

    // remove matched => remaining = un-matched 7k
    matchedVoters.forEach(v => idMap.delete(v.voterId));

    // ❌ only in 7K table
    const onlySevenK = Array.from(idMap.values());

    // ❌ only in voters table
    const onlyVoters = await Voter.find({
      voterId: { $nin: voterIds }
    }).lean();

    // 🎯 FINAL UNMATCH LIST
    const unMatched = [
      ...onlySevenK,
      ...onlyVoters
    ];

    res.json({
      unMatchedCount: unMatched.length,  // ⭐ ONLY UNMATCH COUNT
      matches: unMatched                 // ⭐ ONLY UNMATCH DATA
    });

  } catch (err) {
    console.error("UNMATCH ERROR:", err);
    res.status(500).json({ error: "Unmatched processing failed" });
  } finally {
    await client.close();
  }
};

// ============================================================

// pdf crop many pages
// controllers/pdfCropController.js


exports.uploadPdfCrop = async (req, res) => {
  try {
    const pdfPath = req.file.path;

    const pagesDir = "uploads/pages";
    const votersDir = "uploads/voters";

    fs.mkdirSync(pagesDir, { recursive: true });
    fs.mkdirSync(votersDir, { recursive: true });

    // 1️⃣ PDF → PNG pages
    await pdf.convert(pdfPath, {
      format: "png",
      out_dir: pagesDir,
      out_prefix: "page",
      dpi: 300,
    });

    const pages = fs.readdirSync(pagesDir);

    let croppedImages = [];
    let voterCount = 0;

    for (const page of pages) {
      const pagePath = path.join(pagesDir, page);
      const pageResults = await cropVotersFromPage(pagePath, votersDir);
      croppedImages.push(...pageResults);
      voterCount += pageResults.length;
    }

    res.json({
      totalVotersDetected: voterCount,
      images: croppedImages,
    });

  } catch (err) {
    console.error("PDF CROP ERROR:", err);
    res.status(500).json({ error: "PDF crop failed" });
  }
};


// async function cropVotersFromPage(pagePath, votersDir) {
//   const img = sharp(pagePath);
//   const meta = await img.metadata();

//   const pageWidth = meta.width;
//   const pageHeight = meta.height;

//   // 🔧 layout tuning (as per Election PDF)
//   const columns = 3;
//   const voterHeight = 430;
//   const voterWidth = Math.floor(pageWidth / columns);
//   const rows = Math.floor(pageHeight / voterHeight);

//   let results = [];
//   let count = 0;

//   for (let r = 0; r < rows; r++) {
//     for (let c = 0; c < columns; c++) {
//       const left = c * voterWidth;
//       const top = r * voterHeight;

//       if (top + voterHeight > pageHeight) continue;

//       const outFile = `${path.basename(pagePath, ".png")}_voter_${++count}.png`;
//       const outPath = path.join(votersDir, outFile);

//       await img
//         .extract({
//           left,
//           top,
//           width: voterWidth,
//           height: voterHeight,
//         })
//         .toFile(outPath);

//       results.push(outPath);
//     }
//   }

//   return results;
// }

// -------------------------------------

async function cropVotersFromPage(pagePath, votersDir) {
  const img = sharp(pagePath);
  const meta = await img.metadata();

  const pageWidth = meta.width;
  const pageHeight = meta.height;

  console.log("📄 PAGE SIZE:", pageWidth, pageHeight);

  // 🔧 layout tuning (Election PDF)
  const columns = 3;
  const voterHeight = 430;
  const voterWidth = Math.floor(pageWidth / columns);
  const rows = Math.floor(pageHeight / voterHeight);

  let results = [];
  let count = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      let left = c * voterWidth;
      let top = r * voterHeight;

      // ✅ SAFE BOUNDS CHECK
      let safeWidth = Math.min(voterWidth, pageWidth - left);
      let safeHeight = Math.min(voterHeight, pageHeight - top);

      if (safeWidth <= 0 || safeHeight <= 0) {
        console.log("⛔ Skipped invalid crop:", { left, top });
        continue;
      }

      const outFile = `${path.basename(pagePath, ".png")}_voter_${++count}.png`;
      const outPath = path.join(votersDir, outFile);

      try {
        await sharp(pagePath)
          .extract({
            left: Math.max(0, left),
            top: Math.max(0, top),
            width: safeWidth,
            height: safeHeight,
          })
          .toFile(outPath);

        results.push(outPath);
      } catch (err) {
        console.error("❌ Crop failed:", err.message);
      }
    }
  }

  console.log("✅ TOTAL CROPPED:", results.length);
  return results;
}


// exports.uploadPdfCrop = async (req, res) => {
//   try {
//     const croppedImages = await cropVotersFromPage(pageImg, tempDir);

//     for (const imgPath of croppedImages) {
//       const { data } = await Tesseract.recognize(imgPath, "eng");
//       const voterId = extractVoterId(data.text);

//       if (!voterId) {
//         fs.unlinkSync(imgPath);
//         continue;
//       }

//       const voter = await Voter.findOne({ voterId });
//       if (!voter) {
//         fs.unlinkSync(imgPath);
//         continue;
//       }

//       const finalPath = path.join(
//         "uploads/voters",
//         `${voterId}_${Date.now()}.png`
//       );

//       fs.renameSync(imgPath, finalPath);
//     }

//     res.json({ success: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "PDF crop failed" });
//   }
// };


// const Tesseract = require("tesseract.js");
// const fs = require("fs");
// const path = require("path");
// const Voter = require("../models/Voter"); // adjust path

exports.ocrAndMatchVoters = async (req, res) => {
  try {
    const votersDir = path.join(__dirname, "..", "uploads", "voters");
    const files = fs.readdirSync(votersDir).filter(f => f.endsWith(".png"));

    const matches = [];

    for (const file of files) {
      const imgPath = path.join(votersDir, file);

      const { data } = await Tesseract.recognize(
        imgPath,
        "eng",
        {
          tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/",
        }
      );

      const text = data.text || "";

      // 🔎 EPIC / VoterId regex (tune if needed)
      const m = text.match(/\b(MRL|RBG|FXG|EPIC)[A-Z0-9]{5,}\b/);
      if (!m) continue;

      const voterId = m[0];

      const voter = await Voter.findOne({ voterId }).lean();
      if (!voter) continue;

      matches.push({
        voterId,
        imagePath: `uploads/voters/${file}`,
        voter
      });
    }

    res.json({
      totalMatched: matches.length,
      matches
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "OCR match failed" });
  }
};


// ============================

/**
 * GET SINGLE VOTER BY voterId  (for Voter Slip Link)
 */
exports.getVoterById = async (req, res) => {
  try {
    const { voterId } = req.params;

    if (!voterId) {
      return res.status(400).json({ message: "voterId is required" });
    }

    const voter = await Voter.findOne({ voterId }).lean();

    if (!voter) {
      return res.status(404).json({ message: "Voter not found" });
    }

    res.status(200).json({
      message: "Voter fetched successfully",
      voter
    });

  } catch (error) {
    console.error("Get Voter Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
