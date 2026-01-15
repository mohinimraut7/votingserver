const express = require('express');
const router = express.Router();
const {
  getFinalVoters,
  getFinalvoterReceipt,previewFinalVoterReceipt,bulkImageUpload,markTwiceVoters,getByVisitorAndUpdate
 
} = require('../controller/finalvoter');
router.get("/getFinalVoters", getFinalVoters);
router.get("/getFinalvoterReceipt/:voterId",getFinalvoterReceipt);


router.get(
  "/previewFinalVoterReceipt/:voterId",
  previewFinalVoterReceipt
);

router.put(
  "/getByVisitorAndUpdate/:voterId",
  getByVisitorAndUpdate
);







router.post(
  "/bulkImageUpload",
  bulkImageUpload
);

// routes/voterRoutes.js
router.put("/mark-twice-voters",markTwiceVoters);

module.exports = router;
