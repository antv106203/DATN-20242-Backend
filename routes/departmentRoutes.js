const express = require('express');
const departmentController = require("../controllers/departmentController");

const router = express.Router();
router.post("/ListDepartment.json", departmentController.getListDepartment)
router.post("/createNewDepartment.json", departmentController.createNewDepartment)
router.post("/detailDepartment.json", departmentController.getDetailDepartment)
router.put("/updateDepartment.json", departmentController.updateDepartment)

module.exports = router;