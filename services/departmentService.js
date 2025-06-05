const Department = require("../models/department.model");
const mongoose = require("mongoose");

exports.getListDepartment = async (search = "", order = "desc", floor = null) =>{
    try {
        // Chuyển đổi dữ liệu
        // page = parseInt(page) || 1;
        // limit = parseInt(limit) || 10;
        // const skip = (page - 1) * limit;

        // Bộ lọc tìm kiếm theo tên hoặc mã
        let filter = {};
        if (search) {
            filter = {
                $or: [
                    { department_name: { $regex: search, $options: "i" } },
                    { department_code: { $regex: search, $options: "i" } }
                ]
            };
        }

        if (floor !== null) {
            filter.floor = floor;
        }

        // Xử lý sắp xếp theo `department_name`
        const sortOrder = order === "desc" ? 1 : -1;
        let sortOptions = { updatedAt: -1 }; 

        // Lấy danh sách phòng ban
        const departments = await Department.find(filter)
            .sort(sortOptions);

        // Đếm tổng số bản ghi thỏa mãn điều kiện
        const total = await Department.countDocuments(filter);

        return {
            success: true,
            message: "Department list fetched successfully",
            list_department: departments,
            total: departments.length,
            sort: { sortBy: "department_name", order }
        };
    } catch (error) {
        // cmt
        console.error("Error getting department list:", error);
        return { success: false, message: `Failed to fetch department list: ${error}`};
    }
}

exports.createNewDepartment = async (department) => {
    try {
        const { department_name, department_code, floor } = department;
        if (!department_name || !department_code || !floor) {
            return { success: false, message: "Tên phòng, Mã phòng, Tầng không được để trống", data: null };
        }
        const existingDepartment = await Department.findOne({ department_code });
        if (existingDepartment) {
            return { success: false, message: "Phòng đã tồn tại", data: null };
        }
        // Tạo phòng ban mới
        const newDepartment = new Department({ department_name, department_code, floor });
        await newDepartment.save();
        return { success: true, message: "Tạo phòng mới thành công", data: newDepartment };
    } catch (error) {
        return { success: false, message: `Internal server error : ${error}`, data: null };
    }
}

exports.getDetailDepartment = async (_id) =>{
    try {
        const department = await Department.findById(_id);
        if (!department) {
            return { 
                success: false, 
                message: "Không tim thấy phòng ban"
            };
        }
        else{
            return { 
                success: true, 
                message: "Lấy thông tin phòng ban thành công", 
                data: department 
            };
        }
    } catch (error) {
        return { 
            success: false, 
            message: `Lỗi khi lấy thông tin phòng ban: ${error}`
        };
    }
}

exports.updateDepartment = async (department_id_mongodb, data_input) => {
    try {
        // Lấy dữ liệu phòng ban hiện tại
        const existingDepartment = await Department.findById(department_id_mongodb);
        if (!existingDepartment) {
            return { 
                success: false, 
                message: "Không tìm thấy phòng ban" 
            };
        }

        // Lấy dữ liệu đầu vào và trim
        const trimmedName = data_input.department_name?.trim();
        const trimmedCode = data_input.department_code?.trim();
        const trimmedFloor = data_input.floor?.trim();

        // Kiểm tra nếu có giá trị nào rỗng
        if (trimmedName === "") {
            return {
                success: false,
                message: "Tên phòng ban không được để trống"
            };
        }

        if (trimmedCode === "") {
            return {
                success: false,
                message: "Mã phòng ban không được để trống"
            };
        }

        if (trimmedFloor === "") {
            return {
                success: false,
                message: "Tầng không được để trống"
            };
        }

        // Nếu không có lỗi, tiến hành so sánh với dữ liệu cũ
        const updateData = {
            department_name: trimmedName ?? existingDepartment.department_name,
            department_code: trimmedCode ?? existingDepartment.department_code,
            floor: trimmedFloor ?? existingDepartment.floor
        };

        // Kiểm tra nếu không có gì thay đổi
        if (
            updateData.department_name === existingDepartment.department_name &&
            updateData.department_code === existingDepartment.department_code &&
            updateData.floor === existingDepartment.floor
        ) {
            return { 
                success: false, 
                message: "Không có thay đổi nào được phát hiện"
            };
        }

        // Cập nhật phòng ban
        const updatedDepartment = await Department.findByIdAndUpdate(
            department_id_mongodb,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        return { 
            success: true, 
            message: "Cập nhật phòng ban thành công", 
            data: updatedDepartment 
        };

    } catch (error) {
        return { 
            success: false, 
            message: `Lỗi khi cập nhật phòng ban: ${error}`
        };
    }
};
