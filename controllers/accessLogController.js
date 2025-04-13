const accessLogService = require("../services/accessLogService")

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

exports.createAccessLog = async (req, res) =>{
    try {
        const {fingerprint_id, device_id, result} = req.body;

        const rs = await accessLogService.createAcessLog(fingerprint_id, device_id, result);
        if(rs.success){
            return res.status(201).json({
                status_code: 201,
                message: rs.message,
                accessLog: rs.accessLog
            })
        }
        else{
            return res.status(200).json({
                status_code: 400,
                message: rs.message
            })
        }
    } catch (error) {
        return res.status(200).json({
            status_code: 500,
            message: `Internal server error ${error}`
        });
    }
}