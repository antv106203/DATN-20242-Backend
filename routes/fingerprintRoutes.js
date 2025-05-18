const express = require('express');
const fingerprintController = require("../controllers/fingerprintController");
const isAuth = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/listFingerprint.json", isAuth(["ADMIN", "GAURD"]) ,fingerprintController.getListFingerprints);
router.post("/disableFingerprint.json", fingerprintController.disableFingerprint);
router.post("/enableFingerprint.json", fingerprintController.enableFingerprint);
router.post("/requestCreateFingerprint.json", fingerprintController.requestCreateFingerprint);
router.post("/createFingerprint.json", fingerprintController.createFingerprint);

module.exports = router;