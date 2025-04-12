const userService = require("../services/userService")

exports.createNewUser = async (req, res) => {
    try {
        const user = req.body;
        const avatar = req.file ? req.fileURL : "";
        const result = await userService.createNewuser(user, avatar);

        if(result.success){
            return res.status(201).json({
                status_code: 201,
                message: result.message,
                data: result.data
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
            message: error,
        });
    }
}

exports.deleteUserPre = async(req, res) =>{
    try {
        
        const {_idUser} = req.body;
        const result = await userService.deleteUserPre(_idUser);
        if(result.success){
            return res.status(200).json({
                status_code: 200,
                message: result.message, 
            })
        }
        else{
            return res.status(400).json({
                status_code: 400,
                message: result.message, 
            })
        }
    } catch (error) {
        return res.status(500).json({
            status_code: 500,
            message: `Internal server error: ${error}`
        })
    }
}

exports.deleteUserFromList = async (req, res) =>{
    try {
        
        const {_idUser} = req.body;
        const result = await userService.deleteUserFromList(_idUser);
        if(result.success){
            return res.status(200).json({
                status_code: 200,
                message: result.message, 
            })
        }
        else{
            return res.status(400).json({
                status_code: 400,
                message: result.message, 
            })
        }
    } catch (error) {
        return res.status(500).json({
            status_code: 500,
            message: `Internal server error: ${error}`
        })
    }
}

exports.getListUser = async (req, res) =>{
    try {
        const {id_department, page, limit, user_code, full_name, order, status} = req.body;

        const result = await userService.getListUser(id_department,page, limit,full_name, user_code, order, status);
        if(result.success){
            return res.status(200).json({
                status_code: 200,
                message: result.message,
                data: result.list_user,
                pagination: result.pagination
            });
        }
        else {
            return res.status(400).json({
                status_code: 400,
                message: result.message
            });
        }
    } catch (error) {
        return res.status(500).json({
            status_code: 500,
            message: `Internal server error ${error}`
        });
    }
}

exports.UpdateInfomationOfUser = async(req, res) =>{
    try {
        const {_idUser} = req.query;
        const {infoUser} = req.body;
        const result = await userService.UpdateInfomationOfUser(_idUser, infoUser);
        if(result.success){
            return res.status(200).json({
                status_code: 200,
                message: result.message, 
                newInfomationOfUser: result.updatedUser
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

exports.getDetailUser = async (req, res) =>{
    try {
        const {_idUser} = req.body;
        const result = await userService.getDetailUser(_idUser);
        if(result.success){
            return res.status(200).json({
                status_code: 200,
                message: result.message,
                informationOfUser: result.data
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
            message: "Internal server error"
        });
    }
}

exports.restoreUser = async(req, res) =>{
    try {
        
        const {_idUser} = req.body;
        const result = await userService.restoreUser(_idUser);
        if(result.success){
            return res.status(200).json({
                status_code: 200,
                message: result.message, 
            })
        }
        else{
            return res.status(400).json({
                status_code: 400,
                message: result.message, 
            })
        }
    } catch (error) {
        return res.status(500).json({
            status_code: 500,
            message: `Internal server error: ${error}`
        })
    }
}