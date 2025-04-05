const Account = require("../models/accounts.model")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
exports.loginAccount = async(email, password) =>{
    try {
        
        // Kiểm tra định dạng email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { success: false, message: "Invalid email format"};
        }

        // Kiểm tra xem email có tồn tại không
        const account = await Account.findOne({email})
        if (!account) {
            return { success: false, message: "Email does not exist"};
        }

        // Kiểm tra mật khẩu
        const passwordCheck = await bcrypt.compare(password, account.password);
        if (!passwordCheck) {
            return { success: false, message: "Wrong password"};
        };
        

        const token = jwt.sign(
            {Email: account.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Trả về user và token
        return { success: true, message: "Login successful", data : {account: account, token: token}};
    }   
    catch (error) {
        return { success: false, message: `Failed to login: ${error}` };
    }
}

exports.registerAccount = async (email, password, role) => {

    try{
        // Kiểm tra định dạng email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { success: false, message: "Invalid email format" };
            // throw new Error("Invalid email format");
        }

        // Kiểm tra độ mạnh của mật khẩu
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            // throw new Error("Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character");
            return { success: false, message: "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character" };
        }

        // Kiểm tra email đã tồn tại chưa
        const existingAccount = await Account.findOne({ email });
        if (existingAccount) {
            // throw new Error("Email already exists");
            return { success: false, message: "Email already exists" };
        }

        // Mã hóa mật khẩu trước khi lưu vào database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo tài khoản mới
        const newAccount = new Account({
            email,
            password: hashedPassword,
            role: role
        });

        // Lưu vào database
        await newAccount.save();

        // Tạo token cho người dùng sau khi đăng ký
        const token = jwt.sign(
            { email: newAccount.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return { success: true, message: "Account registered successfully", data: {account: newAccount, token: token }};
    }
    catch(error){
        return { success: false, message: `Failed to register account: ${error}` };
    }
};