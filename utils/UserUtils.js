// use for create user
export const validateUserInput = (user) => {
    // 1. Kiểm tra các trường bắt buộc
    const requiredFields = ['full_name', 'email', 'department_id', 'user_code'];
    for (const field of requiredFields) {
        if (!user[field]) {
            return { success: false, message: `${field} is required` };
        }
    }
    // 2. Kiểm tra định dạng email
    if (user.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user.email)) {
            return { success: false, message: 'Email is invalid' };
        }
    }
    // 3. Nếu có số điện thoại thì kiểm tra định dạng
    if (user.phone) {
        const phoneRegex = /^\+?\d{10,15}$/; // Hỗ trợ +84 hoặc 10-15 số
        if (!phoneRegex.test(user.phone)) {
            return { success: false, message: 'Phone number is invalid' };
        }
    }

    return { success: true, message: 'User input is valid' };
    
}
