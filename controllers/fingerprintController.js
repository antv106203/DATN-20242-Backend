const fingerprintService = require("../services/fingerprintService")

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