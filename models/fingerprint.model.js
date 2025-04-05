const mongoose = require("mongoose");

const FingerprintSchema = new mongoose.Schema({

    fingerprint_id: {
        type : Number,
        required: true
    },
    fingerprint_name: {
        type: String,
        require: true
    },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE"],
        default: "ACTIVE"
    },
    expiry_at: {
        type: Date,
        required: true
    },
    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    device_id: {
        type: mongoose.Schema.ObjectId,
        ref: "Device",
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
}, {timestamps: true})

const Fingerprint  = mongoose.models.Fingerprint || mongoose.model("Fingerprint", FingerprintSchema);
module.exports = Fingerprint;
