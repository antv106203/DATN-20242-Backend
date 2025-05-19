const express = require('express');
const fingerprintController = require("../controllers/fingerprintController");
const isAuth = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/listFingerprint.json", isAuth(["ADMIN", "GAURD"]) ,fingerprintController.getListFingerprints);
router.post("/disableFingerprint.json", fingerprintController.disableFingerprint);
router.put("/enableFingerprint.json", fingerprintController.enableFingerprint);
router.post("/requestCreateFingerprint.json", fingerprintController.requestCreateFingerprint);
router.post("/createFingerprint.json", fingerprintController.createFingerprint);
router.post("/getDetailFingerprint.json", fingerprintController.getDetailFingerprint);
router.put("/updateFingerprint.json", fingerprintController.updateFingerprint);
router.post("/deleteFingerprint.json", fingerprintController.deleteFingerprint);


module.exports = router;