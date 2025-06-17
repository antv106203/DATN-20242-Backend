const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const AccessLogSchema = mongoose.Schema({
    access_time: {
        type: Date,
        required: true,
        default: Date.now
    },
    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    log_id: {
        type: Number
    },
    result: {
        type: String,
        enum: ["success", "failed"]
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
        ref: 'Department'  // 👈 phải trùng tên với model phòng ban
    },
}, {timestamps: true});

AccessLogSchema.plugin(AutoIncrement, { inc_field: "log_id", start_seq: 1 })

const AccessLog  = mongoose.models.AccessLog || mongoose.model("AccessLog", AccessLogSchema);
module.exports = AccessLog;