const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const UserSchema = new mongoose.Schema({
    
    user_id: {
        type: Number,
    },
    full_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
    },
    phone_number: {
        type: String,
        trim: true,
        match: [/^\d{9,15}$/, "Invalid phone number format"]
    },
    status : {
        type: String,
        required: true,
        enum: ["ACTIVE", "DELETED"],
        default: "ACTIVE"
    },
    date_of_birth : {
        type: Date
    },

    user_code : {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    avatar: {
        type: String,
    },

    sex: {
        type: String,
        enum: ["NAM", "NỮ"],
    },

    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },

    department_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Department',
        required: true
    }

},{timestamps: true})

UserSchema.plugin(AutoIncrement, { inc_field: "user_id", start_seq: 1 })

const User  = mongoose.models.User || mongoose.model("User", UserSchema);
module.exports = User;