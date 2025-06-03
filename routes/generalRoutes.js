const express = require('express');
const isAuth = require("../middlewares/authMiddleware");
const router = express.Router();
const generalController = require("../controllers/generalController");

router.post("/generalInfomation.json", isAuth(["ADMIN", "GAURD"]) ,generalController.getGeneralDashboardData);
router.post("/recentHistoryAccess.json", isAuth(["ADMIN", "GAURD"]) ,generalController.getRecentHistoryAccess);
router.post("/accessChartData.json", isAuth(["ADMIN", "GAURD"]) ,generalController.getAccessChartData);

module.exports = router;