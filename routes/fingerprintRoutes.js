const express = require('express');
const fingerprintController = require("../controllers/fingerprintController");

const router = express.Router();

router.post("/listFingerprint.json", fingerprintController.getListFingerprints);
router.post("/disableFingerprint.json", fingerprintController.disableFingerprint);
router.post("/enableFingerprint.json", fingerprintController.enableFingerprint);

module.exports = router;