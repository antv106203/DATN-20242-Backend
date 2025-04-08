const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const DepartmentSchema = new mongoose.Schema({
    department_id: {
        type: Number,
        unique: true
    },
    department_name: {
        type: String,
        required: [true, "Department name is required"],
        trim: true
    },
    total_member: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    department_code: {
        type: String,
        required: [true, "Department code is required"],
        unique: true,
        trim: true
    },
    status : {
        type: String,
        enum: ["ACTIVE", "INACTIVE"],
        default: "ACTIVE"
    },
    floor : {
        type: String,
        required: [true, "Floor is required"],
    }

}, {timestamps: true})

// Tự động tăng giá trị department_id từ 1
DepartmentSchema.plugin(AutoIncrement, { inc_field: "department_id", start_seq: 1 });

const Department  = mongoose.models.Department || mongoose.model("Department", DepartmentSchema);
module.exports = Department;