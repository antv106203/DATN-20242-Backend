const express = require('express');
require('dotenv').config();
const cors = require('cors');
const accountRoutes = require("./routes/accountRoutes")
const departmentRoutes = require("./routes/departmentRoutes")
const deviceRoutes = require("./routes/deviceRoutes")
const userRoutes = require("./routes/userRoutes");
const fingerprintRoutes = require("./routes/fingerprintRoutes");
const accessLogRoutes = require("./routes/accessLogRoutes");
const dbConnect = require('./config/dbConnect');
const { startExpiredCheck } = require('./services/fingerprintService');

const app = express();

// Kết nối đến database
dbConnect();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cors({
    origin: "http://localhost:5173", // Cho phép React truy cập API
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true // Cho phép gửi cookie, token
  }));
// Routes
app.use('/api/account', accountRoutes);
app.use('/api/department', departmentRoutes);
app.use('/api/device', deviceRoutes);
app.use('/api/user',userRoutes );
app.use('/api/fingerprint', fingerprintRoutes);
app.use("/api/accessLog", accessLogRoutes);

startExpiredCheck();

module.exports = app;
