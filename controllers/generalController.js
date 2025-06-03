const generalService = require("../services/generalService")

exports.getGeneralDashboardData = async(req, res) => {
    try {
        const result = await generalService.getGeneralDashboardData();

        if(result.success){
            return res.status(200).json({
                status_code: 200,
                message: result.message,
                data: result.data,
            });
        }
        else{
            return res.status(200).json({
                status_code: 400,
                message: result.message,
            });
        }   
    } catch (error) {
        return res.status(200).json({
            status_code: 500,
            message: `Internal server error ${error}`
        });
    }
}

exports.getRecentHistoryAccess = async (req, res) => {
    try {
        const result = await generalService.getRecentHistoryAccess();

        if(result.success){
            return res.status(200).json({
                status_code: 200,
                message: result.message,
                data: result.data,
            });
        }
        else{
            return res.status(200).json({
                status_code: 400,
                message: result.message,
            });
        }   
    } catch (error) {
        return res.status(200).json({
            status_code: 500,
            message: `Internal server error ${error}`
        });
    }
} 


exports.getAccessChartData = async (req, res) => {
    try {
        const {range} = req.body
        const result = await generalService.getAccessChartData(range);

        if(result.success){
            return res.status(200).json({
                status_code: 200,
                message: result.message,
                data: result.data,
            });
        }
        else{
            return res.status(200).json({
                status_code: 400,
                message: result.message,
            });
        }   
    } catch (error) {
        return res.status(200).json({
            status_code: 500,
            message: `Internal server error ${error}`
        });
    }
} 