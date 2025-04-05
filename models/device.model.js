const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const DeviceSchema = new mongoose.Schema({
    device_id: {
        type: Number,
        required: true
    },
    device_name: {
        type: String,
        required: true
    },
    mac_address: {
        type: String,
        required: true,
        unique: true
    },
    department_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Department',
        required: true
    }
})

DeviceSchema.plugin(AutoIncrement, { inc_field: "device_id", start_seq: 1 });

const Device  = mongoose.models.Device || mongoose.model("Device", DeviceSchema);
module.exports = Device;