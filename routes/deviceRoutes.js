const express = require('express');
const deviceController = require("../controllers/deviceController");
const isAuth = require("../middlewares/authMiddleware")
const router = express.Router();
router.post("/ListDevice.json", deviceController.getListDevice);
router.post("/createNewDevice.json", deviceController.createNewDevice);
router.put("/updateDevice.json", deviceController.updateDevice);
router.get("/getUnregisteredDevices.json", deviceController.getUnregisteredDevices);
router.post("/detailDevice.json", deviceController.getDetailDevice);
router.post("/deleteDevice.json",isAuth(["GAURD"]), deviceController.deleteDevice);

module.exports = router;