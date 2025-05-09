const Account = require("../models/accounts.model")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require('dotenv').config();
exports.loginAccount = async(email, password) =>{
    try {
        
        // Kiểm tra định dạng email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { success: false, message: "Không đúng định dạng email" };
        }

        // Kiểm tra xem email có tồn tại không
        const account = await Account.findOne({email})
        if (!account) {
            return { success: false, message: "Email không tồn tại" };
        }

        // Kiểm tra mật khẩu
        const passwordCheck = await bcrypt.compare(password, account.password);
        if (!passwordCheck) {
            return { success: false, message: "Mật khẩu không đúng" };
        };
        

        const token = jwt.sign(
            {Email: account.email, role: account.role},
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Trả về user và token
        return { success: true, message: "Đăng nhập thành công", data : {account: account, token: token}};
    }   
    catch (error) {
        return { success: false, message: `Lỗi khi đăng nhập: ${error}` };
    }
}

const sendPasswordToEmail = async (email, password) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.mailUser,
            pass: process.env.mailPass
        },
    });

    const mailOptions = {
        from: process.env.mailUser,
        to: email,
        subject: 'Mật khẩu tài khoản của bạn',
        html: 
            `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
                <h2 style="color: #4CAF50;">Chào mừng bạn đến với AT GROUP!</h2>
                <p>Xin chào <strong>${email}</strong>,</p>
                <p>Bạn đã được admin đăng ký tài khoản thành công. Đây là mật khẩu đăng nhập của bạn:</p>
                <div style="background-color: #f2f2f2; padding: 10px; margin: 20px 0; font-size: 18px; font-weight: bold; text-align: center;">
                    ${password}
                </div>
                <p style="color: red;">* Vui lòng đổi mật khẩu sau khi đăng nhập để đảm bảo an toàn cho tài khoản của bạn.</p>
                <div style="text-align: center; margin-top: 20px;">
                    <a href="https://your-login-page.com"
                        style="background-color: #4CAF50; color: white; padding: 10px 20px; 
                                text-decoration: none; display: inline-block; border-radius: 5px;">
                        Đăng nhập ngay
                    </a>
                </div>
                <p style="margin-top: 30px; font-size: 12px; color: #888;">
                    Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này.
                </p>
            </div>`,  
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true, message: "Gửi email thành công" };
    } catch (error) {
        console.error("Lỗi gửi email:", error);
        return { success: false, message: "Gửi email thất bại", error: error.message };
    }
}

exports.registerAccount = async (email, role) => {
    try {
        // Kiểm tra định dạng email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { success: false, message: "Không đúng định dạng email" };
        }

        // Kiểm tra email đã tồn tại chưa
        const existingAccount = await Account.findOne({ email });
        if (existingAccount) {
            return { success: false, message: "Email đã tồn tại" };
        }

        // Tạo mật khẩu ngẫu nhiên
        const randomPassword = crypto.randomBytes(4).toString('hex'); // 8 ký tự

        // Gửi mật khẩu qua email TRƯỚC
        const sendEmailResult = await sendPasswordToEmail(email, randomPassword);

        if (!sendEmailResult.success) {
            // Nếu gửi email thất bại => dừng luôn, KHÔNG lưu
            return { success: false, message: `Không thể gửi email: ${sendEmailResult.error || sendEmailResult.message}` };
        }

        // Nếu gửi email thành công => tiếp tục lưu tài khoản
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        const newAccount = new Account({
            email,
            password: hashedPassword,
            role: role
        });

        await newAccount.save();

        // Tạo token cho người dùng
        const token = jwt.sign(
            { email: newAccount.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return { success: true, message: "Đăng ký tài khoản thành công", data: { account: newAccount, token: token } };
    }
    catch (error) {
        return { success: false, message: `Lỗi khi đăng ký tài khoản: ${error.message}` };
    }
}

exports.getAllAccounts = async (page, limit, email, role, status) => {
    try {
        page = parseInt(page);
        limit = parseInt(limit);
        const skip = (page - 1) * limit;

        let filter = {};

        if(email) {
            filter.email = { $regex: email, $options: "i" };
        }
        if(role) {
            filter.role = role;
        }
        if(status) {
            filter.status = status;
        }

        const sortOptions = { updatedAt: -1 }; // Sắp xếp theo ngày tạo giảm dần

        const accounts = await Account.find(filter)
            .select('-password')
            .skip(skip)
            .limit(limit)
            .sort(sortOptions);

        const total = await Account.countDocuments(filter);

        return {
            success: true,
            message: "Lấy danh sách tài khoản thành công",
            data: accounts,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        return { success: false, message: `Lỗi khi lấy danh sách tài khoản: ${error.message}` };
    }
}


const sendOTPToEmail = async (email, otp) => {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.mailUser,
            pass: process.env.mailPass
        },
    });

    const mailOptions = {
        from: process.env.mailUser,
        to: email,
        subject: 'Mã OTP thay đổi mật khẩu',
        html: `
            <div>
                <p>Đây là mã OTP của bạn để thay đổi mật khẩu:</p>
                <h2>${otp}</h2>
                <p>Mã OTP có thời hạn trong 5 phút.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true, message: "Gửi OTP thành công" };
    } catch (error) {
        console.error("Lỗi gửi OTP:", error);
        return { success: false, message: "Gửi OTP thất bại", error: error.message };
    }
}

exports.requestPasswordChange = async (email, currentPassword) => {
    try {
        const account = await Account.findOne({ email });
        if (!account) {
            return { success: false, message: "Email không tồn tại" };
        }

        // Kiểm tra mật khẩu hiện tại
        const passwordMatch = await bcrypt.compare(currentPassword, account.password);
        if (!passwordMatch) {
            return { success: false, message: "Mật khẩu hiện tại không đúng" };
        }

        // Tạo OTP ngẫu nhiên
        const otp = crypto.randomBytes(3).toString('hex'); // 6 ký tự OTP

        // Lưu OTP và thời gian hết hạn (5 phút)
        const otpExpiration = new Date();
        otpExpiration.setMinutes(otpExpiration.getMinutes() + 5);

        account.otp = otp;
        account.otpExpiration = otpExpiration;

        await account.save();

        const sendEmailResult = await sendOTPToEmail(email, otp);
        if (!sendEmailResult.success) {
            return { success: false, message: `Không thể gửi OTP: ${sendEmailResult.message}` };
        }

        return { success: true, message: "Gửi OTP thành công" };

    } catch (error) {
        return { success: false, message: `Lỗi khi yêu cầu thay đổi mật khẩu: ${error.message}` };
    }
}

exports.changePasswordWithOTP  = async (email,newPassword, otpInput) => {
    try {
        const account = await Account.findOne({ email });
        if (!account) {
            return { success: false, message: "Email không tồn tại" };
        }

        // Kiểm tra OTP
        if (!account.otp || !account.otpExpiration || account.otpExpiration < new Date()) {
            return { success: false, message: "OTP đã hết hạn hoặc không tồn tại" };
        }

        if (otpInput !== account.otp) {
            return { success: false, message: "Mã OTP không đúng" };
        }

        // Mã hóa mật khẩu mới
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu mới và xóa OTP
        account.password = hashedNewPassword;
        account.otp = undefined;
        account.otpExpiration = undefined;

        await account.save();

        return { success: true, message: "Mật khẩu đã được thay đổi thành công" };

    } catch (error) {
        return { success: false, message: `Lỗi khi thay đổi mật khẩu: ${error.message}` };
    }
}

exports.blockAccount = async (email) => {
    try {
        const account = await Account.findOne({ email });
        if (!account) {
            return { success: false, message: "Email không tồn tại" };
        }

        // Kiểm tra trạng thái tài khoản
        if (account.status === "INACTIVE") {
            return { success: false, message: "Tài khoản đã bị khóa" };
        }
        // Cập nhật trạng thái tài khoản thành "Inactive"
        account.status = "INACTIVE";
        await account.save();
        return { success: true, message: "Đã khóa tài khoản thành công" };
    }
    catch (error) {
        return { success: false, message: `Lỗi khi khóa tài khoản: ${error.message}` };
    }    
}

exports.unblockAccount = async (email) => {
    try {
        const account = await Account.findOne({ email });
        if (!account) {
            return { success: false, message: "Email không tồn tại" };
        }
        // Kiểm tra trạng thái tài khoản
        if (account.status === "ACTIVE") {
            return { success: false, message: "Tài khoản đã được kích hoạt" };
        }

        // Cập nhật trạng thái tài khoản thành "Active"
        account.status = "ACTIVE";
        await account.save();
        return { success: true, message: "Đã kích hoạt tài khoản thành công" };
    }
    catch (error) {
        return { success: false, message: `Lỗi khi kích hoạt tài khoản: ${error.message}` };
    }
};

exports.deleteAccount = async (email) => {
    try {
        const account = await Account.findOne({email});
        if (!account) {
            return { success: false, message: "Email không tồn tại" };
        }

        await Account.deleteOne({email});
        return { success: true, message: "Xóa tài khoản thành công" };
    } catch (error) {
        return { success: false, message: `Lỗi khi xóa tài khoản: ${error.message}` };
    }
}


const sendNewPasswordToEmailByAdmin = async (email, newPassword) => {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.mailUser,
            pass: process.env.mailPass
        },
    });
    const mailOptions = {
        from: process.env.mailUser,
        to: email,
        subject: 'Mật khẩu tài khoản của bạn',
        html: 
            `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
                <h2 style="color: #4CAF50;">AT GROUP!</h2>
                <p>Xin chào <strong>${email}</strong>,</p>
                <p>Bạn đã được admin làm mới mật khẩu thành công. Đây là mật khẩu đăng nhập của bạn:</p>
                <div style="background-color: #f2f2f2; padding: 10px; margin: 20px 0; font-size: 18px; font-weight: bold; text-align: center;">
                    ${newPassword}
                </div>
                <p style="color: red;">* Vui lòng đổi mật khẩu sau khi đăng nhập để đảm bảo an toàn cho tài khoản của bạn.</p>
                <div style="text-align: center; margin-top: 20px;">
                    <a href="https://your-login-page.com"
                        style="background-color: #4CAF50; color: white; padding: 10px 20px; 
                                text-decoration: none; display: inline-block; border-radius: 5px;">
                        Đăng nhập ngay
                    </a>
                </div>
            </div>`,  
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true, message: "Gửi email thành công" };
    } catch (error) {
        console.error("Lỗi gửi email:", error);
        return { success: false, message: "Gửi email thất bại", error: error.message };
    }
}
exports.resetPasswordByAdmin = async (email) => {
    try {
        const account = await Account.findOne({ email });
        if (!account) {
            return { success: false, message: "Email không tồn tại" };
        }

        // Tạo mật khẩu ngẫu nhiên
        const randomPassword = crypto.randomBytes(4).toString('hex'); // 8 ký tự

        const sendEmailResult = await sendNewPasswordToEmailByAdmin(email, randomPassword);

        if (!sendEmailResult.success) {
            // Nếu gửi email thất bại => dừng luôn, KHÔNG lưu
            return { success: false, message: `Không thể gửi email: ${sendEmailResult.error || sendEmailResult.message}` };
        }

        // Nếu gửi email thành công => tiếp tục lưu tài khoản
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        account.password  = hashedPassword;
        await account.save();
        return { success: true, message: "Đặt lại mật khẩu thành công" };


    } catch (error) {
        return { success: false, message: `Lỗi khi đặt lại mật khẩu: ${error.message}` };
    }
}

exports.getAccountByEmail = async (email) => {
    try {
        const account = await Account.find  ({ email })
                              .select('-password');   ;         
        if (!account) {
            return { success: false, message: "Email không tồn tại" };
        }
        if (!account) {
            return { success: false, message: "Email không tồn tại" };
        }
        return { success: true, message: "Lấy tài khoản thành công", data: account };
    }   
    catch (error) {
        return { success: false, message: `Lỗi khi lấy tài khoản: ${error.message}` };
    }
}
