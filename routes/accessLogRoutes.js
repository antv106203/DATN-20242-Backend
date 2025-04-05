const accessLogController = require("../controllers/accessLogController");
const express = require('express');

const router = express.Router();

router.post("/listAccessLog.json", accessLogController.getListAccessLog);
router.post("/createAccessLog.json", accessLogController.createAccessLog);

module.exports = router;