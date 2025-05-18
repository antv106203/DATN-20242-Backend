const AccessLog = require("../models/accessLog.model");
const Device = require("../models/device.model");
const Fingerprint = require("../models/fingerprint.model")
const User = require("../models/user.model")
exports.getListAccessLog = async (page, limit, order = "asc", department_id = null, result, fromDate = null, toDate = null) => {
    try {
        // Chuyển đổi dữ liệu
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        const sortOrder = order === "asc" ? 1 : -1;
        let sortOptions = { access_time: sortOrder };

        let filter = {};

        // Lọc theo trạng thái kết quả (SUCCESS/FAILURE)
        if (result) {
            filter.result = result;
        }

        // Lọc theo khoảng thời gian
        if (fromDate || toDate) {
            filter.access_time = {};
            if (fromDate) {
                filter.access_time.$gte = new Date(fromDate); // từ ngày
            }
            if (toDate) {
                // toDate đến cuối ngày (23:59:59.999)
                const toDateObj = new Date(toDate);
                toDateObj.setHours(23, 59, 59, 999);
                filter.access_time.$lte = toDateObj; // đến ngày
            }
        }

        // Lọc theo phòng ban
        if (department_id) {
            const users = await User.find({ department_id }, "_id");
            const userIds = users.map(u => u._id);
            filter.user_id = { $in: userIds };
        }

        const accessLogs = await AccessLog.find(filter)
            .populate({
                path: "user_id",
                select: "full_name user_code avatar",
                populate: {
                    path: "department_id",
                    select: "department_name department_code"
                }
            })
            .skip(skip)
            .limit(limit)
            .sort(sortOptions);

        const total = await AccessLog.countDocuments(filter);

        return {
            success: true,
            message: "AccessLogs list fetched successfully",
            list_accessLog: accessLogs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        return {
            success: false,
            message: `Failed to fetch accessLogs list: ${error}`
        };
    }
};

exports.createAcessLog = async (fingerprint_id, mac_address, result) =>{
    try {

        const device = await Device.findOne({
            mac_address: mac_address
        });

        if (!device) {
            return {
                success: false,
                message: "Không tìm thấy thiết bị"
            };
        }
        const device_id = device._id;
        // Tìm fingerprint_id trong bảng Fingerprint
        // Nếu không tìm thấy thì trả về lỗi        
        const fingerprint = await Fingerprint.findOne({
            fingerprint_id: fingerprint_id,
            device_id: device_id
        })

        const user_id = fingerprint ? fingerprint.user_id : null;

        const newLog = new AccessLog({
            user_id: user_id,
            result: result
        })

        await newLog.save();
        return{
            success: true,
            message: "Có lượt truy cập mới",
            accessLog: newLog
        }
    } catch (error) {
        return { success: false, message: `Failed to create accessLog: ${error}`};
    }
}