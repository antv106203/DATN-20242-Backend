const express = require('express');
const userController = require("../controllers/userController");
const { upload, uploadAvatarHandler } = require('../middlewares/imageCloudinaryUpload');
const isAuth = require("../middlewares/authMiddleware");

const router = express.Router();
router.post("/createNewUser.json", isAuth(["ADMIN", "GAURD"]), upload,uploadAvatarHandler, userController.createNewUser)
router.post("/deletePre.json", isAuth(["ADMIN", "GAURD"]), userController.deleteUserPre)
router.delete("/delereSec.json",isAuth(["ADMIN", "GAURD"]), userController.deleteUserFromList)
router.post("/listUser.json", userController.getListUser)
router.put("/updateUser.json", isAuth(["ADMIN", "GAURD"]), userController.UpdateInfomationOfUser)
router.post("/detailUser.json", isAuth(["ADMIN", "GAURD"]), userController.getDetailUser)
router.post("/restoreUser.json", isAuth(["ADMIN", "GAURD"]), userController.restoreUser)

module.exports = router;