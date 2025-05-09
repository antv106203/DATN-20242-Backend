const express = require('express');
const accountController = require("../controllers/accountController")
const isAuth = require("../middlewares/authMiddleware")

const router = express.Router();
router.post('/login', accountController.login);
router.post("/register", isAuth(["ADMIN"]), accountController.register);
router.post("/listAccount.json", isAuth(["ADMIN"]), accountController.getAllAccounts);
router.post("/blockAccount.json", isAuth(["ADMIN"]), accountController.blockAccount);
router.post("/unblockAccount.json", isAuth(["ADMIN"]), accountController.unBlockAccount);
router.post("/deleteAccount.json", isAuth(["ADMIN"]), accountController.deleteAccount);
router.post("/resetPasswordByAdmin.json", isAuth(["ADMIN"]), accountController.resetPasswordByAdmin);
router.post("/getAccountByEmail.json", isAuth(["ADMIN"]), accountController.getAccountByEmail);
router.post("/reqquestChangePassword.json", isAuth(["ADMIN", "GAURD"]),accountController.requestPasswordChange);
router.post("/changePassword.json", isAuth(["ADMIN", "GAURD"]), accountController.changePasswordWithOTP);

module.exports = router;
