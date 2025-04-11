const departmentService = require("../services/departmentService")

exports.getListDepartment = async (req, res) =>{
    try {
        const {search, order, floor } = req.body;
        const result = await departmentService.getListDepartment(search, order, floor)
        if(result.success){
            return res.status(200).json({
                status_code: 200,
                message: result.message,
                data: result.list_department,
                total: result.total
            });
        }
        else{
            return res.status(200).json({
                status_code: 400,
                message: result.message
            });
        }

    } catch (error) {
        console.error("Error fetching department list:", error);
        return res.status(200).json({
            status_code: 500,
            message: "Internal server error"
        });
    }
}

exports.createNewDepartment = async (req, res) =>{
    try {
        const department = req.body;
        const result = await departmentService.createNewDepartment(department);
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
                message: result.message,
            })
        }
    } catch (error) {
        return res.status(500).json({
            status_code: 500,
            message: error,
        })
    }
}

exports.getDetailDepartment = async (req, res) =>{
    try {
        const {_id} = req.body;
        const result = await departmentService.getDetailDepartment(_id);
        
        if(result.success){
            return res.status(200).json({
                status_code: 200,
                message: result.message,
                data: result.data
            });
        }
        else {
            return res.status(404).json({
                status_code: 404,
                message: result.message
            });
        }

    } catch (error) {
        return res.status(500).json({
            status_code: 500,
            message: `Internal server error: ${error}`
        });
    }
}
exports.updateDepartment = async (req, res) => {
    try {
        const {department_id_mongodb } = req.query;
        
        const result = await departmentService.updateDepartment(department_id_mongodb, req.body);

        if(result.success){
            return res.status(200).json({
                status_code: 200,
                message: result.message, 
                newDepartment: result.data
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
            message: `Internal server error: ${error}`
        })
    }
}