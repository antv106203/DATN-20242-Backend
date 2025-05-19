const { set } = require("mongoose");
const Fingerprint = require("../models/fingerprint.model")
const mqttClient = require("../config/mqttConnect");
const Device = require("../models/device.model");


const normalizeFingerprintName = (name) => {
    return name.trim().replace(/\s+/g, ' ').toLowerCase();
};

exports.createFingerprint = async (fingerprint_id, fingerprint_name, expiry_at, user_id, device_id) => {
    try {
        if (!fingerprint_id || !fingerprint_name || !expiry_at || !user_id || !device_id) {
            return { success: false, message: "Không được bỏ trống thông tin" };
        }

        // Kiểm tra trùng fingerprint_id trong cùng device
        const existingFingerprint = await Fingerprint.findOne({ fingerprint_id, device_id });
        if (existingFingerprint) {
            return { success: false, message: "ID vân tay đã tồn tại trong thiết bị" };
        }

        // Chuẩn hóa tên vân tay để kiểm tra trùng tên
        const normalizedName = normalizeFingerprintName(fingerprint_name);

        const existingByName = await Fingerprint.findOne({
            user_id,
            $expr: {
                $eq: [
                    { $toLower: { $trim: { input: "$fingerprint_name" } } },
                    normalizedName
                ]
            }
        });

        if (existingByName) {
            return { success: false, message: "Tên vân tay đã tồn tại cho nhân viên này" };
        }

        const newFingerprint = new Fingerprint({
            fingerprint_id,
            fingerprint_name: fingerprint_name.trim().replace(/\s+/g, ' '),
            expiry_at,
            user_id,
            device_id,
            status: "ACTIVE"
        });

        await newFingerprint.save();

        return {
            success: true,
            message: "Thêm mới dấu vân tay thành công",
            data: newFingerprint
        };
    } catch (error) {
        return {
            success: false,
            message: `Lỗi server: ${error}`
        };
    }
};

exports.getListFingerprint = async(page, limit, search,  order = "desc", status = null, user_id = null, device_id = null) =>{
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

        const sortOrder = order === "desc" ? 1 : -1;
        let sortOptions = { updatedAt: sortOrder };

        const fingerprints = await Fingerprint.find(filter)
                    .populate("user_id")
                    .populate({
                        path: "device_id",
                        populate: {
                            path: "department_id"
                        }
                    })
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
            return { success: false, message: "Không tìm thấy dấu vân tay" };
        }

        else {
            await Fingerprint.findByIdAndUpdate(id_fingerprint, {status: "INACTIVE", expiry_at: null}, {new: true});
            return { success: true, message: "Vô hiệu hóa dấu vân tay thành công" };
        }

    } catch (error) {
        return { success: false, message: `Lỗi khi vô hiệu hóa vân tay: ${error}`};
    }
}

exports.enableFingerprint = async (id_fingerprint, expiry_at) => {
    try {
        const fingerprint_existing = await Fingerprint.findById(id_fingerprint);

        if(!fingerprint_existing){
            return { success: false, message: "Không tìm thấy dấu vân tay" };
        }

        else {
            await Fingerprint.findByIdAndUpdate(id_fingerprint, {status: "ACTIVE", expiry_at: expiry_at}, {new: true});
            return { success: true, message: "Kích hoạt dấu vân tay thành công" };
        }

    } catch (error) {
        return { success: false, message: `Lỗi khi kích hoạt dấu vân tay: ${error}`};
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

        // 2. Lấy danh sách INACTIVE, và populate device để lấy mac_address
        const inactiveFingerprints = await Fingerprint.find({ status: "INACTIVE" })
            .populate("device_id");

        console.log("a",inactiveFingerprints)

        // 3. Gom nhóm theo mac_address
        const groupedByMac = {};

        inactiveFingerprints.forEach(fp => {
            const device = fp.device_id;
            if (!device || !device.mac_address) return; // bỏ qua nếu device không tồn tại

            const mac = device.mac_address;

            if (!groupedByMac[mac]) {
                groupedByMac[mac] = [];
            }

            groupedByMac[mac].push(
                fp.fingerprint_id,
            );
        });


        // 4. Gửi đến từng thiết bị
        for (const mac in groupedByMac) {
            const topic = `/auto/expired_fingerprints/`;
            const payload = JSON.stringify({
                mac_address: mac,
                expired_fingerprints: groupedByMac[mac]
            });

            mqttClient.publish(topic, payload, {}, (err) => {
                if (err) {
                    console.error(`Lỗi khi gửi đến ${topic}:`, err);
                } else {
                    console.log(`Đã gửi expired fingerprints đến thiết bị ${mac}`);
                }
            });
        }

        return {
            success: true,
            message: `Đã cập nhật ${result.modifiedCount} fingerprint(s) và gửi đến thiết bị tương ứng`
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

exports.getDetailFingerprint = async (_id) => {
    try {

        const fingerprint = await Fingerprint.findById(_id)
            .populate("user_id")
            .populate({
                path: "device_id",
                populate: {
                    path: "department_id"
                }
            })
        
        if (!fingerprint) {
            return { success: false, message: "Không tìm thấy dấu vân tay" };
        }

        return {
            success: true,
            message: "Lấy thông tin dấu vân tay thành công",
            data: fingerprint
        };

        
    }
    catch (error) {
        return { success: false, message: `Failed to fetch fingerprint detail: ${error}`};
    }
}

exports.updateFingerprint = async (id_fingerprint, fingerprint_name, expiry_at) => {
    try {
        const fingerprint_existing = await Fingerprint.findById(id_fingerprint);

        if(!fingerprint_existing){
            return { success: false, message: "Không tìm thấy dấu vân tay" };
        }

        else {
            const updatedFingerprint = await Fingerprint.findByIdAndUpdate(id_fingerprint, {fingerprint_name, expiry_at}, {new: true});
            return { success: true, message: "Cập nhật dấu vân tay thành công", data: updatedFingerprint };
        }

    } catch (error) {
        return { success: false, message: `Failed to update fingerprint: ${error}`};
    }
}


exports.deleteFingerprint = async (fingerprint_id, mac_address, _id) => {
    const topicRequest = "/delete";
    const topicResponse = "/delete/response";

    const payload = JSON.stringify({ fingerprint_id, mac_address });

    return new Promise((resolve, reject) => {
        const onMessage = async (topic, message) => {
            if (topic !== topicResponse) return;

            let response;
            try {
                response = JSON.parse(message.toString());
            } catch (err) {
                mqttClient.removeListener("message", onMessage);
                return reject({ success: false, message: "Phản hồi không hợp lệ", error: err });
            }

            if (response.mac_address === mac_address && response.fingerprint_id === fingerprint_id) {
                mqttClient.removeListener("message", onMessage);
                if(response.status === "success"){
                    try {

                        const device = await Device.findOne({ mac_address });
                        if (!device) {
                            return reject({ success: false, message: "Không tìm thấy thiết bị với mac_address này" });
                        }

                        const deleteResult = await Fingerprint.findByIdAndDelete(_id);
                            if (deleteResult) {
                                return resolve({
                                    success: true,
                                    message: "Xóa vân tay thành công trên cả thiết bị và server",
                                    data: response
                                });
                            } else {
                                return reject({
                                    success: false,
                                    message: "Không tìm thấy vân tay trong database để xóa"
                                });
                            }
                    } catch (dbError) {
                        return reject({
                            success: false,
                            message: "Thiết bị xóa thành công nhưng lỗi khi xóa trong database",
                            error: dbError
                        });
                    }
                }   
                else {
                    return resolve({
                        success: false,
                        message: "Xóa vân tay thất bại trên thiết bị",
                        data: response
                    });
                }
            }
        };
        mqttClient.on("message", onMessage);

        mqttClient.publish(topicRequest, payload, (err) => {
            if (err) {
                mqttClient.removeListener("message", onMessage);
                return reject({ success: false, message: "Lỗi khi gửi lệnh xóa đến thiết bị", error: err });
            }
        });

    });
}









