export const validateUserInput = (user) => {
    const errors = [];

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
            errors.push(`${field.label} là thông tin bắt buộc phải điền`);
        }
    }

    // 2. Kiểm tra định dạng email nếu đã nhập
    if (user.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user.email)) {
            errors.push('Email không hợp lệ');
        }
    }

    // 3. Nếu có số điện thoại thì kiểm tra định dạng
    if (user.phone_number) {
        const phoneRegex = /^\+?\d{10,15}$/;
        if (!phoneRegex.test(user.phone_number)) {
            errors.push('Số điện thoại không hợp lệ');
        }
    }

    // Trả kết quả
    if (errors.length > 0) {
        return {
            success: false,
            message: errors.join('\n'), // hoặc return cả mảng nếu cần hiển thị từng dòng riêng
            errors: errors,             // để dùng nếu muốn hiển thị từng dòng
        };
    }

    return { success: true, message: 'Thông tin hợp lệ' };
};
