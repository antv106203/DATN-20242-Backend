const Department = require("../models/department.model");
const mongoose = require("mongoose");

exports.getListDepartment = async (search = "", order = "asc", floor = null) =>{
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
        const sortOrder = order === "asc" ? 1 : -1;
        let sortOptions = { department_name: sortOrder };

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
        const { department_name, department_code } = department;
        if (!department_name || !department_code) {
            return { success: false, message: "Department name and code are required", data: null };
        }
        const existingDepartment = await Department.findOne({ department_code });
        if (existingDepartment) {
            return { success: false, message: "Department code already exists", data: null };
        }
        // Tạo phòng ban mới
        const newDepartment = new Department({ department_name, department_code });
        await newDepartment.save();
        return { success: true, message: "Department created successfully", data: newDepartment };
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
                message: "Department not found"
            };
        }
        else{
            return { 
                success: true, 
                message: "Department details fetched successfully", 
                data: department 
            };
        }
    } catch (error) {
        return { 
            success: false, 
            message: `Failed to fetch department details: ${error}`
        };
    }
}

exports.updateDepartment = async (department_id_mongodb ,data_input) => {
    try {
        // Lấy dữ liệu phòng ban hiện tại
        const existingDepartment = await Department.findById(department_id_mongodb);
        if (!existingDepartment) {
            return { 
                success: false, 
                message: "Department not found" 
            };
        }

        // Kiểm tra và giữ nguyên giá trị cũ nếu giá trị mới không hợp lệ
        const updateData = {
            department_name: data_input.department_name !== null && data_input.department_name !== undefined
                ? data_input.department_name.trim()
                : existingDepartment.department_name, // Giữ nguyên nếu giá trị mới là null

            department_code: data_input.department_code !== null && data_input.department_code !== undefined
                ? data_input.department_code.trim()
                : existingDepartment.department_code // Giữ nguyên nếu giá trị mới là null
        };

        // Kiểm tra nếu cả hai giá trị đều không thay đổi
        if (
            updateData.department_name === existingDepartment.department_name &&
            updateData.department_code === existingDepartment.department_code
        ) {
            return { 
                success: false, 
                message: "No changes detected"
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
            message: "Department updated successfully", 
            data: updatedDepartment 
        };
    } catch (error) {
        return { 
            success: false, 
            message: `Failed to update department: ${error}`
        };
    }
}
