const jwt = require('jsonwebtoken');
require('dotenv').config();
const Account = require('../models/accounts.model');

module.exports = (allowedRoles) => {
    return async (request, response, next) => {
        try {
            const token = request.headers.authorization?.split(" ")[1];

            if (!token) {
                return response.status(401).json({
                    status_code: 401,
                    message: "Không có token, truy cập bị từ chối"
                });
            }

            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            const user = decodedToken;

            const account = await Account.findById(user._id);
            if (!account) {
                return response.status(401).json({
                    status_code: 401,
                    message: "Tài khoản không tồn tại"
                });
            }

            if (account.status === "INACTIVE") {
                return response.status(401).json({
                    status_code: 401,
                    message: "Tài khoản đã bị khóa"
                });
            }

            if (!allowedRoles.includes(account.role)) {
                return response.status(403).json({
                    status_code: 403,
                    message: "Quyền truy cập bị từ chối: không đủ quyền và vai trò"
                });
            }

            request.user = account;
            next();

        } catch (error) {
            return response.status(401).json({
                status_code: 401,
                message: `Token không hợp lệ hoặc lỗi xác thực: ${error.message}`
            });
        }
    };
};
