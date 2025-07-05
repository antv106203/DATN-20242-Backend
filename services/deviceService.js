const Device = require("../models/device.model");
const Fingerprint = require("../models/fingerprint.model")
let foundMACs = new Set();
const mqttClient = require("../config/mqttConnect");

exports.createNewDevice = async (device_name, mac_address, department_id) => {
    try {
        if (!device_name || !mac_address || !department_id) {
            return {
                success: false,
                message: "Chưa điền đủ thông tin",
                data: null,
            };
        }

        const existingDevice = await Device.findOne({ mac_address });
        if (existingDevice) {
            return {
                success: false,
                message: "Thiết bị đã tồn tại",
                data: null,
            };
        }

        const departmentUsed = await Device.findOne({ department_id });
        if (departmentUsed) {
            return {
                success: false,
                message: "Phòng này đã được kết nối với thiết bị khác",
                data: null,
            };
        }

        const newDevice = new Device({ device_name, mac_address, department_id });
        await newDevice.save();

        const payload = JSON.stringify({ mac_address });
        mqttClient.publish("/status/request", payload);
        console.log(`📡 Đã gửi yêu cầu xác nhận trạng thái tới /status/request: ${payload}`);

        return {
            success: true,
            message: "Thiết bị đã được tạo thành công",
            data: newDevice,
        };
    } catch (error) {
        return {
            success: false,
            message: `Lỗi máy chủ nội bộ: ${error.message}`,
            data: null,
        };
    }
};


exports.getListDevice = async(page = 1, limit = 10, search = "", order = "asc", department_id = null) =>{
    try {

        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        let filter = {};
        if (search) {
            filter = {
                $or: [
                    { device_name: { $regex: search, $options: "i" } },
                    { mac_address: { $regex: search, $options: "i" } }
                ]
            };
        }

        if (department_id) {
            filter.department_id = department_id
        }
        
        const sortOrder = order === "asc" ? 1 : -1;
        let sortOptions = { device_id: sortOrder };

        // Lấy danh sách phòng ban
        const devices = await Device.find(filter)
            .populate("department_id")
            .skip(skip)
            .limit(limit)
            .sort(sortOptions);

        // Đếm tổng số bản ghi thỏa mãn điều kiện
        const total = await Device.countDocuments(filter);

        return {
            success: true,
            message: "Device list fetched successfully",
            list_device: devices,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            },
            sort: { sortBy: "device_name", order }
        };
    } catch (error) {
        return { success: false, message: `Failed to fetch device list: ${error}`};
    }
}

exports.updateDevice = async(_id , device_name) =>{
    try {
        if(!device_name){
            return {
                success: false,
                message: "Tên không hợp lệ"
            }
        }

        const existingDevice = await Device.findById(_id);
        if (!existingDevice) {
            return {
                success: false,
                message: "Device not found"
            }
        }

        if (existingDevice.device_name === device_name) {
            return {
                success: false,
                message: "Không có thay đổi nào được thực hiện"
            }
        }

        const updatedDevice = await Device.findByIdAndUpdate(
            _id,
            { device_name},
            { new: true } // Trả về thiết bị đã cập nhật
        );

        return {
            success: true,
            message: "Cập nhật thiết bị thành công",
            data: updatedDevice
        }

    } catch (error) {
        return { 
            success: false, 
            message: `Lỗi khi cập nhật thiết bị: ${error}`
        };
    }
}

// Thu thập MAC từ ESP phản hồi
mqttClient.on("message", (topic, message) => {
    if (topic === "/findDevice/response") {
        const mac = message.toString().trim().toLowerCase();
        if (mac) foundMACs.add(mac);
    }
});

exports.findAvailableDevices = async () => {
    try {
        foundMACs.clear();

        // Gửi tin nhắn đến tất cả các ESP
        mqttClient.publish("/findDevice", JSON.stringify({ ping: true }));

        // Đợi phản hồi trong 5 giây
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Lấy danh sách thiết bị đã tồn tại
        const existingDevices = await Device.find({}, "mac_address");
        console.log(existingDevices)
        const existingMACs = new Set(
            existingDevices.map(d => d.mac_address.trim().toUpperCase())
        );

        // Chuẩn hóa MAC nhận từ ESP thành viết hoa
        const normalizedFoundMACs = Array.from(foundMACs).map(mac =>
            mac.trim().toUpperCase()
        );

        // Lọc các MAC chưa có trong hệ thống
        const newDevices = normalizedFoundMACs.filter(
            mac => !existingMACs.has(mac)
        );

        return {
            success: true,
            new_devices: newDevices.map(mac => ({ mac_address: mac }))
        };
    } catch (error) {
        return {
            success: false,
            message: "Lỗi khi tìm thiết bị mới",
            error: error.message
        };
    }
};

exports.getDetailDevice = async(_id) =>{
    try {
        const device = await Device.findById(_id)
        .populate("department_id");

        if (!device) {
            return { 
                success: false, 
                message: "Không tìm thấy thiết bị" 
            };
        }
        return { 
            success: true, 
            message: "Lấy thông tin thiết bị thành công", 
            data: device 
        };
    }
    catch (error) {
        return { 
            success: false, 
            message: `Lỗi khi lấy thông tin thiết bị: ${error}` 
        };
    }
}

exports.deleteDevice = async (id) => {
    try {
        const device = await Device.findById(id);
        if (!device) {
            return { 
                success: false, 
                message: "Không tìm thấy thiết bị" 
            };
        }

        // Kiểm tra nếu còn vân tay liên kết với thiết bị
        const fingerprintCount = await Fingerprint.countDocuments({ device_id: id });
        if (fingerprintCount > 0) {
            return {
                success: false,
                message: "Không thể xóa thiết bị vì vẫn còn vân tay được lưu trong thiết bị"
            };
        }

        await Device.findByIdAndDelete(id);

        return {
            success: true,
            message: "Xóa thiết bị thành công"
        };
    } catch (error) {
        return {
            success: false,
            message: "Lỗi hệ thống, không thể xóa thiết bị"
        };
    }
}

exports.updateStatusDevice = async () => {
    mqttClient.on("message", async (topic, messageBuffer) => {
        if (topic === '/status/response') {
            try {
                const message = JSON.parse(messageBuffer.toString());
                const { mac_address, status } = message;

                if (!mac_address || !status) {
                    console.warn('Invalid status message:', message);
                    return;
                }

                const device = await Device.findOne({ mac_address });
                if (!device) {
                    console.log(`Device with MAC ${mac_address} not found, skipping update`);
                    return;
                }

                device.status = status.toUpperCase();
                await device.save();

                console.log(`Updated device ${mac_address} status to ${status}`);

                // Emit socket event đề React reload danh sách thiết bị
                if (global.io) {
                    global.io.emit("device-status-updated", {
                        mac_address,
                        status: device.status
                    });
                }

            } catch (error) {
                console.error('Failed to process status message:', error);
            }
        }
    });
};
