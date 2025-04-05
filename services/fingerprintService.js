const { set } = require("mongoose");
const Fingerprint = require("../models/fingerprint.model")

exports.createFingerprint = async (fingerprint) =>{
    try {
        const {fingerprint_id, fingerprint_name, expiry_at, user_id, device_id} = fingerprint;

        if(!fingerprint_id || !fingerprint_name || !expiry_at || !user_id || !device_id ){
            return { success: false, message: "fingerprint_id, fingerprint_name, expiry_at, user_id and device_id are required" };
        }

        const existingFingerprint = await Fingerprint.findOne({fingerprint_id, device_id})

        if(existingFingerprint){
            return { success: false, message: "Fingerprint already exists" };
        }

        const newFingerprint = new Fingerprint({
            fingerprint_id,
            fingerprint_name,
            expiry_at,
            user_id,
            device_id
        })

        await newFingerprint.save();
        
        return { success: true, message: "Fingerprint created successfully", data: newFingerprint};
    } catch (error) {
        return { success: false, message: `Internal server error: ${error}`};
    }
}

exports.getListFingerprint = async(page, limit, search,  order = "asc", status = null, user_id = null, device_id = null) =>{
    try {
        // Chuyển đổi dữ liệu
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        let filter = {};

        if(user_id){
            filter.user_id = user_id;
        }

        if(device_id){
            filter.device_id = device_id
        }

        if(status){
            filter.status = status
        }

        if (search) {
            filter.fingerprint_name = { $regex: search, $options: "i" };
        }

        const sortOrder = order === "asc" ? 1 : -1;
        let sortOptions = { expiry_at: sortOrder };

        const fingerprints = await Fingerprint.find(filter)
                    .skip(skip)
                    .limit(limit)
                    .sort(sortOptions)
        
        const total = await Fingerprint.countDocuments(filter);
        return {
            success: true,
            message: "Fingerprints list fetched successfully",
            list_fingerprint: fingerprints,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };

    } catch (error) {
        return { success: false, message: `Failed to fetch fingerprint list: ${error}`};
    }
}

exports.disableFingerprint = async (id_fingerprint) => {
    try {
        const fingerprint_existing = await Fingerprint.findById(id_fingerprint);

        if(!fingerprint_existing){
            return { success: false, message: "Fingerprint not found!" };
        }

        else {
            await Fingerprint.findByIdAndUpdate(id_fingerprint, {status: "INACTIVE", expiry_at: null}, {new: true});
            return { success: true, message: "Disable fingerprint successfully" };
        }

    } catch (error) {
        return { success: false, message: `Failed to disable fingerprint: ${error}`};
    }
}

exports.enableFingerprint = async (id_fingerprint, expiry_at) => {
    try {
        const fingerprint_existing = await Fingerprint.findById(id_fingerprint);

        if(!fingerprint_existing){
            return { success: false, message: "Fingerprint not found!" };
        }

        else {
            await Fingerprint.findByIdAndUpdate(id_fingerprint, {status: "ACTIVE", expiry_at: expiry_at}, {new: true});
            return { success: true, message: "Enable fingerprint successfully" };
        }

    } catch (error) {
        return { success: false, message: `Failed to Enable fingerprint: ${error}`};
    }
}

const AutomaticDisableFingerprint = async () =>{
    try {
        const currentTime = new Date();

        const result = await Fingerprint.updateMany(
            {
                status: "ACTIVE",
                expiry_at: { $lt: currentTime }
            },
            {
                $set: {
                    status: "INACTIVE",
                    expiry_at: null
                }
            }
        );

        return {
            success: true,
            message: `Updated ${result.modifiedCount} fingerprint(s) to INACTIVE`
        };
    } catch (error) {
        return {
            success: false,
            message: `Failed to automatic disable fingerprint: ${error}`
        };
    }
}

exports.startExpiredCheck = () =>{
    setInterval(async () => {
        try {
            const result = await AutomaticDisableFingerprint();

            console.log(result.message)
        } catch (error) {
            console.error('Lỗi trong quá trình kiểm tra dấu vân tay hết hạn:', error);
        }
    }, 120000); // Kiểm tra mỗi 2 phút
}

// exports.getDetailFingerprin






