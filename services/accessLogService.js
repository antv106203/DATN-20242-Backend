const AccessLog = require("../models/accessLog.model");
const Fingerprint = require("../models/fingerprint.model")

exports.getListAccessLog = async(page, limit, order = "asc", user_id = null, result) =>{
    try {
        // Chuyển đổi dữ liệu
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        let filter = {};

        if(user_id) {
            filter.user_id = user_id
        }

        if(result){
            filter.result = result
        }

        const sortOrder = order === "asc" ? 1 : -1;
        let sortOptions = { access_time: sortOrder };

        const accessLogs = await AccessLog.find(filter)
                    .populate({
                        path: "user_id", 
                        select: "full_name user_code avatar" ,
                        populate: {
                            path: "department_id",
                            select: "department_name department_code"
                        }
                    })
                    .skip(skip)
                    .limit(limit)
                    .sort(sortOptions)
        
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
        return { success: false, message: `Failed to fetch accessLogs list: ${error}`};
    }
}

exports.createAcessLog = async (fingerprint_id, device_id, result) =>{
    try {
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
            message: "Someone is coming",
            accessLog: newLog
        }
    } catch (error) {
        return { success: false, message: `Failed to create accessLog: ${error}`};
    }
}