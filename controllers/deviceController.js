const deviceService = require("../services/deviceService");

exports.getListDevice = async (req, res) =>{
    try {
        const { page, limit, search, order, department_id } = req.body;
        const result = await deviceService.getListDevice(page, limit, search, order, department_id)
        if(result.success){
            return res.status(200).json({
                status_code: 200,
                message: result.message,
                data: result.list_device,
                pagination: result.pagination
            });
        }
        else {
            return res.status(400).json({
                status_code: 400,
                message: result.message,
            });
        }
    } catch (error) {
        return res.status(500).json({
            status_code: 500,
            message: error,
        });
    }
}

exports.createNewDevice = async(req, res) =>{
    try {
        const device = req.body;
        const result = await deviceService.createNewDevice(device);
        if(result.success){
            return res.status(201).json({
                status_code: 201,
                message: result.message,
                data: result.data
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
            message: error,
        });
    }
}

exports.updateDevice = async(req, res) =>{
    try {
        const {_id} = req.query;

        const result = await deviceService.updateDevice(_id, req.body);
        if(result.success){
            return res.status(200).json({
                status_code: 200,
                message: result.message,
                data: result.data
            });
        }
        else{
            return res.status(400).json({
                status_code: 400,
                message: result.message
            });
        }
    } catch (error) {
        return res.status(500).json({
            status_code: 500,
            message: error,
        });    
    }
}