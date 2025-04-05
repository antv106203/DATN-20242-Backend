const Device = require("../models/device.model");

exports.createNewDevice = async(device) =>{
    try {
        const {device_name, mac_address, department_id} = device;
        if(!device_name || !mac_address || !department_id){
            return {success: false, message: "Device name and Mac address and Deparrment ID are required", data: null}
        }
        const existingDevice = await Device.findOne({mac_address});
        if (existingDevice) {
            return { success: false, message: "Device already exists", data: null };
        }

        // Thêm thiết bị mới
        const newDevice = new Device({device_name, mac_address, department_id})
        await newDevice.save();
        return { success: true, message: "Device created successfully", data: newDevice };
    } catch (error) {
        return { success: false, message: `Internal server error : ${error}`, data: null };
    }
}

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