const express = require('express');
const departmentController = require("../controllers/departmentController");
const isAuth = require("../middlewares/authMiddleware");

const router = express.Router();
router.post("/ListDepartment.json", isAuth(["ADMIN", "GAURD"]), departmentController.getListDepartment)
router.post("/createNewDepartment.json", isAuth(["ADMIN", "GAURD"]), departmentController.createNewDepartment)
router.post("/detailDepartment.json", isAuth(["ADMIN", "GAURD"]), departmentController.getDetailDepartment)
router.put("/updateDepartment.json", isAuth(["ADMIN", "GAURD"]),departmentController.updateDepartment)

module.exports = router;