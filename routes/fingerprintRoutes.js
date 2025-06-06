const express = require('express');
const fingerprintController = require("../controllers/fingerprintController");
const isAuth = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/listFingerprint.json", isAuth(["ADMIN", "GAURD"]) ,fingerprintController.getListFingerprints);
router.post("/disableFingerprint.json",isAuth(["ADMIN", "GAURD"]), fingerprintController.disableFingerprint);
router.put("/enableFingerprint.json", isAuth(["ADMIN", "GAURD"]),fingerprintController.enableFingerprint);
router.post("/requestCreateFingerprint.json", isAuth(["ADMIN", "GAURD"]),fingerprintController.requestCreateFingerprint);
router.post("/createFingerprint.json",isAuth(["ADMIN", "GAURD"]) ,fingerprintController.createFingerprint);
router.post("/getDetailFingerprint.json", isAuth(["ADMIN", "GAURD"]),isAuth(["ADMIN", "GAURD"]),fingerprintController.getDetailFingerprint);
router.put("/updateFingerprint.json", isAuth(["ADMIN", "GAURD"]),fingerprintController.updateFingerprint);
router.post("/deleteFingerprint.json", isAuth(["ADMIN", "GAURD"]),fingerprintController.deleteFingerprint);


module.exports = router;