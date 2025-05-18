const express = require('express');
const deviceController = require("../controllers/deviceController");

const router = express.Router();
router.post("/ListDevice.json", deviceController.getListDevice);
router.post("/createNewDevice.json", deviceController.createNewDevice);
router.put("/updateDevice.json", deviceController.updateDevice);
router.get("/getUnregisteredDevices.json", deviceController.getUnregisteredDevices);

module.exports = router;