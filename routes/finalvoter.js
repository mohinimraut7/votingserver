const express = require('express');
const router = express.Router();
const {
  getFinalVoters,
  getFinalvoterReceipt,previewFinalVoterReceipt
 
} = require('../controller/finalvoter');
router.get("/getFinalVoters", getFinalVoters);
router.get("/getFinalvoterReceipt/:voterId",getFinalvoterReceipt);


router.get(
  "/previewFinalVoterReceipt/:voterId",
  previewFinalVoterReceipt
);



module.exports = router;
