const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
            "Please provide a valid email address"
        ]
    },
    password: {
        type: String,
        required: [true, "password is required"],
        trim: true,
    },
    role : {
        type: String,
        required: true,
        enum: ["ADMIN", "GAURD"],
    },
    otp: { 
        type: String 
    },  // OTP
    
    otpExpiration: { 
        type: Date 
    },  // Thời gian hết hạn OTP

    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE"],
        default: "ACTIVE",
    }
    
}, {timestamps: true});

const Account = mongoose.models.Account || mongoose.model("Account", AccountSchema);
module.exports = Account;