const express = require('express');
const userController = require("../controllers/userController");
const { upload, uploadAvatarHandler } = require('../middlewares/imageCloudinaryUpload');

const router = express.Router();
router.post("/createNewUser.json", upload,uploadAvatarHandler,userController.createNewUser)
router.post("/deletePre.json", userController.deleteUserPre)
router.delete("/delereSec.json", userController.deleteUserFromList)
router.post("/listUser.json", userController.getListUser)
router.put("/updateUser.json", userController.UpdateInfomationOfUser)
router.post("/detailUser.json", userController.getDetailUser)
router.post("/restoreUser.json", userController.restoreUser)

module.exports = router;