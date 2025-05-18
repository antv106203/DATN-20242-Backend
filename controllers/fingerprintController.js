const client = require("../config/mqttConnect");
const fingerprintService = require("../services/fingerprintService");
const Device = require("../models/device.model");
const topicCreateFingerprint = "/create_fingerprint";
exports.getListFingerprints = async (req, res) =>{
    try {
        const {page, limit, search,  order , status, user_id , device_id } = req.body;

        const result = await fingerprintService.getListFingerprint(page, limit, search, order, status, user_id, device_id);

        if(result.success){
            return res.status(200).json({
                status_code: 200,
                message: result.message,
                data: result.list_fingerprint,
                pagination: result.pagination
            });
        }
        else{
            return res.status(400).json({
                status_code: 400,
                message: result.message,

            });
        }
    } catch (error) {
        return res.status(500).json({
            status_code: 500,
            message: `Internal server error ${error}`
        });
    }
}

exports.disableFingerprint = async (req, res) =>{
    try {
        const {id_fingerprint} = req.query;
        const result = await fingerprintService.disableFingerprint(id_fingerprint);
        if(result.success){
            return res.status(200).json({
                status_code: 200,
                message: result.message
            })
        }
        else{
            return res.status(400).json({
                status_code: 400,
                message: result.message
            })
        }
    } catch (error) {
        return res.status(500).json({
            status_code: 500,
            message: `Internal server error ${error}`
        });
    }
}

exports.enableFingerprint = async (req, res) =>{
    try{
        const {id_fingerprint} = req.query;
        const {expiry_at} = req.body;

        const result = await fingerprintService.enableFingerprint(id_fingerprint, expiry_at);
        if(result.success){
            return res.status(200).json({
                status_code: 200,
                message: result.message
            })
        }
        else{
            return res.status(400).json({
                status_code: 400,
                message: result.message
            })
        }
    } catch (error) {
        return res.status(500).json({
            status_code: 500,
            message: `Internal server error ${error}`
        });
    }

}

exports.requestCreateFingerprint = async (req, res) =>{
    try {
        const {mac_address} = req.body;
        if(!mac_address){
            return res.status(200).json({
                status_code: 400,
                message: "Chưa chọn phòng ban"
            })
        }

        const device = await Device.findOne({ mac_address }).populate('department_id');
        if (!device) {
            return res.status(200).json({
                status_code: 404,
                message: 'Không tìm thấy thiết bị với địa chỉ MAC đã cung cấp',
            });
        }
        const dataToSend = { mac_address };

        client.publish(topicCreateFingerprint, JSON.stringify(dataToSend), (error) => {
            if (error) {
                console.error('[MQTT] Lỗi khi gửi dữ liệu:', error);
                return res.status(200).json({
                    status_code: 500,
                    message: `Lỗi khi gửi dữ liệu đến MQTT: ${error.message}`,
                });
            }
            console.log('[MQTT] Đã gửi dữ liệu đến', topicCreateFingerprint);
            return res.status(200).json({
                status_code: 200,
                message: 'Yêu cầu thêm vân tay được tạo thành công. Thực hiện thêm vân tay trên thiết bị tại phòng ban: ' + device.department_id.department_name,
            });
        });
    } catch (error) {
        console.error('[Controller] Lỗi server:', error);
        return res.status(200).json({
            status_code: 500,
            message: `Lỗi server: ${error.message}`,
        });
    }
}
exports.createFingerprint = async (req, res) =>{
    try {
        const { fingerprint_id, fingerprint_name, expiry_at, user_id, device_id } = req.body;
        const result = await fingerprintService.createFingerprint(fingerprint_id, fingerprint_name, expiry_at, user_id, device_id);
        if(result.success){
            return res.status(201).json({
                status_code: 201,
                message: result.message,
                data: result.data
            })
        }
        else{
            return res.status(201).json({
                status_code: 400,
                message: result.message
            })
        }
    } catch (error) {
        return res.status(201).json({
            status_code: 500,
            message: `Internal server error ${error}`
        });
    }
}
