// use for create user
export const validateUserInput = (user) => {
    // 1. Kiểm tra các trường bắt buộc
    const requiredFields = [
        { key: 'full_name', label: 'Họ và tên' },
        { key: 'email', label: 'Email' },
        { key: 'department_id', label: 'Phòng ban' },
        { key: 'user_code', label: 'Mã nhân viên' },
        { key: 'sex', label: 'Giới tính' },
    ];

    for (const field of requiredFields) {
        if (!user[field.key]) {
            return { success: false, message: `${field.label} là  thông tin bắt buộc phải điền` };
        }
    }

    // 2. Kiểm tra định dạng email
    if (user.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user.email)) {
            return { success: false, message: 'Email không hợp lệ' };
        }
    }

    // 3. Nếu có số điện thoại thì kiểm tra định dạng
    if (user.phone) {
        const phoneRegex = /^\+?\d{10,15}$/; // Hỗ trợ +84 hoặc 10-15 số
        if (!phoneRegex.test(user.phone)) {
            return { success: false, message: 'Số điện thoại không hợp lệ' };
        }
    }

    return { success: true, message: 'Thông tin hợp lệ' };
};
