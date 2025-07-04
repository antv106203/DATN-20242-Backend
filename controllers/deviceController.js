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
        const {device_name, mac_address, department_id} = req.body;
        const result = await deviceService.createNewDevice(device_name, mac_address, department_id);
        if(result.success){
            return res.status(201).json({
                status_code: 201,
                message: result.message,
                data: result.data
            });
        }
        else{
            return res.status(201).json({
                status_code: 400,
                message: result.message,
            });
        }
    } catch (error) {
        return res.status(201).json({
            status_code: 500,
            message: error,
        });
    }
}

exports.updateDevice = async(req, res) =>{
    try {
        const {_id} = req.query;
        const {device_name} = req.body;

        const result = await deviceService.updateDevice(_id, device_name);
        if(result.success){
            return res.status(200).json({
                status_code: 200,
                message: result.message,
                data: result.data
            });
        }
        else{
            return res.status(200).json({
                status_code: 400,
                message: result.message
            });
        }
    } catch (error) {
        return res.status(200).json({
            status_code: 500,
            message: error,
        });    
    }
}


exports.getUnregisteredDevices = async (req, res) => {
    try {
        const result = await deviceService.findAvailableDevices();
        if (!result.success) {
            return res.status(200).json({
                status_code: 400,
                message: result.message,
            });
        }
        else {
            return res.status(200).json({
                status_code: 200,
                message: result.message,
                data: result.new_devices
            });
        }
    } catch (error) {
        return res.status(200).json({
            status_code: 500,
            message: error
        });
    }
};

exports.getDetailDevice = async (req, res) => {
    const { _id } = req.body;
    try {
        const result = await deviceService.getDetailDevice(_id);
        if(result.success){
            return res.status(200).json({
                status_code: 200,
                message: result.message,
                data: result.data
            });
        }
        else{
            return res.status(200).json({
                status_code: 404,
                message: result.message
            });
        }
    } catch (error) {
        return res.status(200).json({
            status_code: 500,
            message: `Internal server error ${error}`
        });
    }
}

exports.deleteDevice = async (req, res) => {
    const {_id} = req.body;

    try {
        const result = await deviceService.deleteDevice(_id);
        if(result.success){
            return res.status(200).json({
                status_code: 200,
                message: result.message,
                data: result.data
            });
        }
        else {
            return res.status(200).json({
                status_code: 400,
                message: result.message
            });
        }
    } catch (error) {
        return res.status(200).json({
            status_code: 500,
            message: `Internal server error ${error}`
        });
    }
}