const Device = require("../models/device.model");
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

        // ❗ Kiểm tra phòng ban đã được kết nối thiết bị nào chưa
        const departmentUsed = await Device.findOne({ department_id });
        if (departmentUsed) {
            return {
                success: false,
                message: "Phòng này đã được kết nối với thiết bị khác",
                data: null,
            };
        }

        // ✅ Tạo thiết bị mới
        const newDevice = new Device({ device_name, mac_address, department_id });
        await newDevice.save();

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
        // Chuyển đổi dữ liệu
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        // Bộ lọc tìm kiếm theo tên hoặc mã
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
            filter.department_id = new mongoose.Types.ObjectId(department_id);
        }
        
        // Xử lý sắp xếp theo `department_name`
        const sortOrder = order === "asc" ? 1 : -1;
        let sortOptions = { device_name: sortOrder };

        // Lấy danh sách phòng ban
        const devices = await Device.find(filter)
            .populate("department_id") // Tham chiếu đến bảng `Department`
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
        // cmt
        console.error("Error getting device list:", error);
        return { success: false, message: `Failed to fetch device list: ${error}`};
    }
}

exports.updateDevice = async(_id , update_device) =>{
    try {
        const {device_name, department_id} = update_device;
        if(!device_name || !department_id){
            return {
                success: false,
                message: "name and department are required"
            }
        }

        const existingDevice = await Device.findById(_id);
        console.log(existingDevice)
        if (!existingDevice) {
            return {
                success: false,
                message: "Device not found"
            }
        }

        if (existingDevice.device_name === device_name && existingDevice.department_id.toString() === department_id) {
            return {
                success: false,
                message: "No changes detected"
            }
        }

        const updatedDevice = await Device.findByIdAndUpdate(
            _id,
            { device_name, department_id },
            { new: true } // Trả về thiết bị đã cập nhật
        );

        return {
            success: true,
            message: "Device updated successfully",
            data: updatedDevice
        }

    } catch (error) {
        return { 
            success: false, 
            message: `Failed to update device: ${error}`
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
