const AccessLog = require("../models/accessLog.model");
const Device = require("../models/device.model");
const Fingerprint = require("../models/fingerprint.model")
const User = require("../models/user.model")
exports.getListAccessLog = async (page, limit, order = "desc", department_id = null, result, fromDate = null, toDate = null) => {
    try {
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        const sortOrder = order === "desc" ? -1 : 1;
        const sortOptions = { access_time: sortOrder };

        let filter = {};

        // Lọc theo trạng thái (success/failed)
        if (result) {
            filter.result = result;
        }

        // Lọc theo khoảng thời gian: từ 00:00:00 đến 23:59:59.999
        if (fromDate || toDate) {
            filter.access_time = {};

            if (fromDate) {
                const from = new Date(fromDate);
                from.setHours(0, 0, 0, 0);
                filter.access_time.$gte = from;
            }

            if (toDate) {
                const to = new Date(toDate);
                to.setHours(23, 59, 59, 999);
                filter.access_time.$lte = to;
            }
        }

        // Lọc theo phòng ban
        if (department_id) {
            const users = await User.find({ department_id }, "_id");
            const userIds = users.map(u => u._id);
            filter.user_id = { $in: userIds };
        }

        // Debug filter nếu cần
        // console.log("FILTER:", filter);

        const accessLogs = await AccessLog.find(filter)
            .populate({
                path: "user_id",
                select: "full_name user_code avatar",
                populate: {
                    path: "department_id",
                    select: "department_name department_code"
                }
            })
            .populate({
                path: "department_id",
                select: "department_name department_code"
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



exports.createAcessLog = async (fingerprint_id, mac_address, result) => {
    try {
        const device = await Device.findOne({ mac_address });

        if (!device) {
            return {
                success: false,
                message: "Không tìm thấy thiết bị"
            };
        }

        const device_id = device._id;
        const department_id = device.department_id;

        const fingerprint = await Fingerprint.findOne({
            fingerprint_id,
            device_id
        });

        const user_id = fingerprint ? fingerprint.user_id : null;

        const newLog = new AccessLog({
            user_id,
            result,
            department_id
        });

        await newLog.save();

        if (global.io) {
            global.io.emit("access-log-updated");
        }

        return {
            success: true,
            message: "Có lượt truy cập mới",
            accessLog: newLog
        };
    } catch (error) {
        return {
            success: false,
            message: `Failed to create accessLog: ${error}`
        };
    }
};

exports.deleteAccessLog = async (id) => {
    try {
        const log = await AccessLog.findById(id);
        if (!log) {
            return {
                success: false,
                message: "Không tìm thấy lịch sử truy cập"
            };
        }

        await AccessLog.findByIdAndDelete(id);

        return {
            success: true,
            message: "Xóa lịch sử truy cập thành công"
        };
    } catch (error) {
        return {
            success: false,
            message: `Lỗi khi xóa lịch sử truy cập: ${error}`
        };
    }
};