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

exports.deleteAccesslog = async (req, res) => {
    try {
        const {id} = req.body;
        const result = await accessLogService.deleteAccessLog(id);
        if(result.success){
            return res.status(200).json({
                status_code: 200,
                message: result.message
            })
        }
        else{
            return res.status(200).json({
                status_code: 400,
                message: result.message
            })
        }
    } catch (error) {
        return res.status(200).json({
            status_code: 500,
            message: `Internal server error ${error}`
        });
    }
}