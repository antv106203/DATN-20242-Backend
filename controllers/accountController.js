const accountService = require("../services/accountService")
require('dotenv').config();
exports.login = async (req, res) =>{
    try {
        const result = await accountService.loginAccount(req.body.email, req.body.password)

        if(result.success){
            res.status(200).json({ status_code: 200, message: result.message, data: {email: result.data.account.email, role: result.data.account.role, token: result.data.token, refreshToken: result.data.refreshToken }});
        }
        else{
            res.status(400).json({ status_code: 400, message: result.message });
        }
    } catch (error) {
        res.status(500).json({ status_code: 500, message: `Internal server: ${error}`});
    }

}

exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const result = await accountService.doRefreshToken(refreshToken);

        if (result.success) {
            return res.status(200).json({
                token: result.token,
                message: result.message,
            });
        } else {
            // Trường hợp refreshToken không hợp lệ hoặc hết hạn
            return res.status(401).json({
                message: result.message || "Refresh token không hợp lệ",
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: `Lỗi server khi xử lý refreshToken: ${error.message}`,
        });
    }
};

exports.register = async (req, res) =>{
    try {
        const { email, role } = req.body;
        const result = await accountService.registerAccount(email, role);
        
        if(result.success){
            res.status(201).json({status_code: 201, message: result.message });
        }
        else{
            res.status(201).json({status_code: 400, message: result.message });
        }
    } catch (error) {
        res.status(201).json({ status_code: 400, message: `Internal server: ${error}` });
    }
}

exports.getAllAccounts = async (req, res) => {
    try {
        const { page, limit, email, role,status } = req.body;
        const result = await accountService.getAllAccounts(page, limit, email, role, status);

        if (result.success) {
            res.status(200).json({ status_code: 200, message: result.message, data: result.data, pagination: result.pagination });
        } else {
            res.status(200).json({ status_code: 400, message: result.message });
        }
    } catch (error) {
        res.status(200).json({ status_code: 400, message: `Internal server error: ${error}` });
    }
}

exports.blockAccount = async (req, res) => {
    const {email} = req.body;
    try {
        const result = await accountService.blockAccount(email);
        if (result.success) {
            res.status(200).json({ status_code: 200, message: result.message });
        } else {
            res.status(200).json({ status_code: 400, message: result.message });
        }
    } catch (error) {
        res.status(200).json({ status_code: 500, message: `Internal server error: ${error}` });
    }
}

exports.unBlockAccount = async (req, res) => {
    const {email} = req.body;
    try {
        const result = await accountService.unblockAccount(email);
        if (result.success) {
            res.status(200).json({ status_code: 200, message: result.message });
        } else {
            res.status(200).json({ status_code: 400, message: result.message });
        }
    } catch (error) {
        res.status(200).json({ status_code: 500, message: `Internal server error: ${error}` });
    }
}

exports.deleteAccount = async (req, res) => {
    const {email} = req.body;
    try {
        const result = await accountService.deleteAccount(email);
        if (result.success) {
            res.status(200).json({ status_code: 200, message: result.message });
        } else {
            res.status(200).json({ status_code: 400, message: result.message });
        }
    } catch (error) {
        res.status(200).json({ status_code: 500, message: `Internal server error: ${error}` });
    }
}

exports.resetPasswordByAdmin = async (req, res) => {
    const { email} = req.body;
    try {
        const result = await accountService.resetPasswordByAdmin(email);
        if (result.success) {
            res.status(200).json({ status_code: 200, message: result.message });
        } else {
            res.status(200).json({ status_code: 400, message: result.message });
        }
    } catch (error) {
        res.status(200).json({ status_code: 500, message: `Internal server error: ${error}` });
    }
}

exports.getAccountByEmail = async (req, res) => {
    const { email } = req.body;
    try {
        const result = await accountService.getAccountByEmail(email);
        if (result.success) {
            res.status(200).json({ status_code: 200, message: result.message, data: result.data });
        } else {
            res.status(200).json({ status_code: 400, message: result.message });
        }
    } catch (error) {
        res.status(200).json({ status_code: 500, message: `Internal server error: ${error}` });
    }
}

exports.requestPasswordChange = async (req, res) => {
    const { email, currentPassword } = req.body;
    try {
        const result = await accountService.requestPasswordChange(email, currentPassword);
        if (result.success) {
            res.status(200).json({ status_code: 200, message: result.message });
        } else {
            res.status(200).json({ status_code: 400, message: result.message });
        }
    } catch (error) {
        res.status(200).json({ status_code: 500, message: `Internal server error: ${error}` });
    }
} 

exports.changePasswordWithOTP = async (req, res) => {
    const { email, newPassword, otp } = req.body;
    try {
        const result = await accountService.changePasswordWithOTP(email, newPassword, otp);

        if (result.success) {
            res.status(200).json({ status_code: 200, message: result.message });
        } else {
            res.status(200).json({ status_code: 400, message: result.message });
        }
    } catch (error) {
        res.status(200).json({ status_code: 500, message: `Internal server error: ${error}` });
    }
}
