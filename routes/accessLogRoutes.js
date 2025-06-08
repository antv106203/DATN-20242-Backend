const accessLogController = require("../controllers/accessLogController");
const express = require('express');
const isAuth = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/listAccessLog.json", isAuth(["ADMIN", "GAURD"]), accessLogController.getListAccessLog);
router.post("/deleteAccesslog.json", isAuth(["ADMIN"]), accessLogController.deleteAccesslog);
module.exports = router;