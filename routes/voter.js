const express = require('express');
const router = express.Router();

const {
  addVoter,
  getVoters,
  deleteVoter,
  editVoter,
  importExcel,
  deleteAll,
 
  getCommonVotersCount,
  fourteenkeightVoterID,
fourteenkeightVotersAll,
sevenkUnMatchThirtyEightk,
uploadPdfCrop,ocrAndMatchVoters,getVoterById
} = require('../controller/voterController');

// --------------------
// VOTER ROUTES
// --------------------

// Add single voter
router.post('/addVoter', addVoter);

// Get voters (pagination + search)
router.get('/getVoters', getVoters);

// Edit voter
router.post('/editVoter/:voter_id', editVoter);

// Delete voter
router.delete('/deleteVoter/:voter_id', deleteVoter);

// Import Excel (bulk upsert by voterId)
router.post('/import-voters-excel', importExcel);

// Delete all voters
router.delete('/deleteAllVoters', deleteAll);
// router.get('/common-voters-count', getCommonVotersCount);
router.get('/common-voters-count', getCommonVotersCount);

router.get('/fourteenkeightVoterID', fourteenkeightVoterID);
// router.get('/fourteenkeightVotersALL',fourteenkeightVotersALL);
router.get('/fourteenkeightVotersAll',fourteenkeightVotersAll);

router.get('/sevenkUnMatchThirtyEightk',sevenkUnMatchThirtyEightk);


const upload =require("../middleware/uploadPdf")


router.post("/upload-pdf-crop", upload.single("pdf"), uploadPdfCrop);

// routes/voter.js
router.get("/ocr-match-voters", ocrAndMatchVoters);
router.get("/getVoterById/:voterId", getVoterById);


module.exports = router;
