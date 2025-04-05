const accountService = require("../services/accountService")

exports.login = async (req, res) =>{
    try {
        const result = await accountService.loginAccount(req.body.email, req.body.password)

        if(result.success){
            res.status(200).json({ status_code: 200, message: result.message, data: {email: result.data.account.email, role: result.data.account.role, token: result.data.token }});
        }
        else{
            res.status(400).json({ status_code: 400, message: result.message });
        }
    } catch (error) {
        res.status(400).json({ status_code: 400, message: `Internal server: ${error}`});
    }

}

exports.register = async (req, res) =>{
    try {
        const result = await accountService.registerAccount(req.body.email, req.body.password, req.body.role)
        
        if(result.success){
            res.status(201).json({status_code: 201, message: result.message });
        }
        else{
            res.status(400).json({status_code: 400, message: result.message });
        }
    } catch (error) {
        res.status(400).json({ status_code: 400, message: `Internal server: ${error}` });
    }
}