const express = require('express');
const router = express.Router();
const {
  getFinalVoters,
  getFinalvoterReceipt,previewFinalVoterReceipt,bulkImageUpload
 
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


module.exports = router;
