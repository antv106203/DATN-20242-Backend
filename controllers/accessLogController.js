const accessLogService = require("../services/accessLogService")
const mqttClient = require("../config/mqttConnect");
exports.getListAccessLog = async (req, res) =>{
    try {
        const {page, limit, order , department_id , result, fromDate, toDate} = req.body;

        const resultAccess = await accessLogService.getListAccessLog(page, limit, order, department_id, result, fromDate, toDate);

        if(resultAccess.success){
            return res.status(200).json({
                status_code: 200,
                message: resultAccess.message,
                data: resultAccess.list_accessLog,
                pagination: resultAccess.pagination
            })
        }
        else{
            return res.status(200).json({
                status_code: 400,
                message: resultAccess.message
            })
        }
    } catch (error) {
        return res.status(200).json({
            status_code: 500,
            message: `Internal server error ${error}`
        });
    }
}

exports.createAccessLog = async () =>{
    mqttClient.on("message", async (topic, messageBuffer) => {
        if (topic === "/fingerprint") {
            try {
                const payload = JSON.parse(messageBuffer.toString());
                await accessLogService.createAcessLog(payload.fingerprint_id, payload.mac_address, payload.message);
            } catch (err) {
                console.error("Lỗi khi xử lý message từ /fingerprint:", err);
            }
        }
    });
}