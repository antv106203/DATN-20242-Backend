const express = require('express');
require('dotenv').config();
const cors = require('cors');
const accountRoutes = require("./routes/accountRoutes")
const departmentRoutes = require("./routes/departmentRoutes")
const deviceRoutes = require("./routes/deviceRoutes")
const userRoutes = require("./routes/userRoutes");
const fingerprintRoutes = require("./routes/fingerprintRoutes");
const accessLogRoutes = require("./routes/accessLogRoutes");
const generalRoutes = require("./routes/generalRoutes");
const dbConnect = require('./config/dbConnect');
const { startExpiredCheck } = require('./services/fingerprintService');
const client = require('./config/mqttConnect');
const { createAcessLog } = require('./services/accessLogService');
const deviceService = require("./services/deviceService");
const http = require('http');
const { Server } = require('socket.io')


const app = express();
const httpServer = http.createServer(app);

// Kết nối đến database
dbConnect();

// Tạo socket server
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Hoặc chỉ định domain
    methods: ['GET', 'POST']
  }
});

// Gắn global để dùng trong service
global.io = io;

io.on('connection', (socket) => {
  console.log('🔌 Client connected');

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected');
  });
});

client.on("message", async (topic, message) => {
    console.log("MQTT received topic:", topic.toString());
    try {
        if(topic.toString() === "/fingerprint"){
          const jsonMessage = JSON.parse(message.toString());
          const res = await createAcessLog(jsonMessage.fingerprint_id, jsonMessage.mac_address, jsonMessage.message);
          if(res.success){
              console.log("AccessLog created successfully:", res.accessLog);
          }
          else {
              console.log("Error creating AccessLog:", res.message);
          }
        }
    } catch (error) {
        console.log("Message (Raw):", message.toString());
        console.error("Error parsing message as JSON:", error);
    }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


deviceService.updateStatusDevice();
const allowedOrigins = [
  'http://localhost:5173',
  'https://datn-20242-frontend.onrender.com',
  'https://antuhust.id.vn'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
}));

// Routes
app.use('/api/account', accountRoutes);
app.use('/api/department', departmentRoutes);
app.use('/api/device', deviceRoutes);
app.use('/api/user',userRoutes );
app.use('/api/fingerprint', fingerprintRoutes);
app.use("/api/accessLog", accessLogRoutes);
app.use("/api/general", generalRoutes);

startExpiredCheck();

module.exports = httpServer;
