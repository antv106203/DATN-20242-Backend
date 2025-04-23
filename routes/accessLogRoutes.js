const accessLogController = require("../controllers/accessLogController");
const express = require('express');
const isAuth = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/listAccessLog.json", isAuth(["ADMIN", "GAURD"]), accessLogController.getListAccessLog);
router.post("/createAccessLog.json", accessLogController.createAccessLog);

module.exports = router;