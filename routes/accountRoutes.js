const express = require('express');
const accountController = require("../controllers/accountController")
const isAuth = require("../middlewares/authMiddleware")

const router = express.Router();
router.post('/login', accountController.login);
router.post("/register", isAuth(["ADMIN"]), accountController.register);

module.exports = router;
