const express = require('express');
const deviceController = require("../controllers/deviceController");
const isAuth = require("../middlewares/authMiddleware")
const router = express.Router();
router.post("/ListDevice.json", isAuth(["ADMIN", "GAURD"]),deviceController.getListDevice);
router.post("/createNewDevice.json", isAuth(["ADMIN", "GAURD"]),deviceController.createNewDevice);
router.put("/updateDevice.json",isAuth(["ADMIN", "GAURD"]) ,deviceController.updateDevice);
router.get("/getUnregisteredDevices.json",isAuth(["ADMIN", "GAURD"]) ,deviceController.getUnregisteredDevices);
router.post("/detailDevice.json",isAuth(["ADMIN", "GAURD"]) ,deviceController.getDetailDevice);
router.post("/deleteDevice.json",isAuth(["ADMIN"]), deviceController.deleteDevice);

module.exports = router;