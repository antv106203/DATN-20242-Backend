const Department = require("../models/department.model");
const User = require("../models/user.model");

exports.createNewuser = async (newUser, avatar) =>{
    try {

        const { full_name, email, department_id, phone_number, date_of_birth, user_code, sex } = newUser;

        if (!full_name || !email || !department_id || !user_code) {
            return { success: false, message: "Full name, email, and user_code are required", data: null };
        }


        const existingUser = await User.findOne({ user_code });
        if (existingUser) {
            if(existingUser.status === "DELETED"){
                return { success: false, message: "User in deleted list"};
            }
            else {
                return { success: false, message: "User already exists"};
            }
        }

        const newUserData = new User({
            full_name,
            email,
            department_id,
            user_code,
            phone_number: phone_number || undefined,
            date_of_birth: date_of_birth || undefined,
            avatar: avatar ?? "",
            sex: sex || undefined
        })

        await newUserData.save();

        await Department.findByIdAndUpdate(department_id, { $inc: { total_member: 1 } });

        return { success: true, message: "User created successfully", data: newUserData};

    } catch (error) {
        return { success: false, message: `Internal server error: ${error}`, data: null };
    }
}

exports.deleteUserPre = async(_id) =>{
    try {
        const user_existing = await User.findById(_id);

        if(!user_existing){
            return {success: false, message: "User not found"}
        }

        else{
            await User.findByIdAndUpdate(_id, {status: "DELETED"}, {new: true});
            if (user_existing.department_id) {
                await Department.findByIdAndUpdate(user_existing.department_id, { $inc: { total_member: -1 } });
            }
            return {success: true, message: "User deleted successfully"}
        }
    } catch (error) {
        return { success: false, message: `Internal server error: ${error}`};
    }
}

exports.deleteUserFromList = async (_id) => {
    try {
        // Tìm user theo ID
        const user_existing = await User.findById(_id);

        if (!user_existing) {
            return { success: false, message: "User not found" };
        }

        // Xóa user vĩnh viễn khỏi database
        await User.findByIdAndDelete(_id);

        return { success: true, message: "User permanently deleted" };
    } catch (error) {
        return { success: false, message: `Internal server error: ${error}` };
    }
};

exports.getListUser = async(id_department = null, page = 1 , limit = 10, full_name = "", user_code = "", order = "asc", status = null) => {
    try {
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        let filter = {};

        if (id_department) {
            filter.department_id = id_department;
        }

        if (status) {
            filter.status = status;
        }

        // Nếu truyền full_name hoặc user_code thì thêm điều kiện regex
        if (full_name) {
            filter.full_name = { $regex: full_name, $options: "i" };
        }

        if (user_code) {
            filter.user_code = { $regex: user_code, $options: "i" };
        }

        const sortOrder = order === "asc" ? 1 : -1;
        const sortOptions = { full_name: sortOrder };

        const users = await User.find(filter)
            .populate("department_id")
            .skip(skip)
            .limit(limit)
            .sort(sortOptions);

        const total = await User.countDocuments(filter);
        const returned = users.length; // số bản ghi trả về ở trang hiện tại

        return {
            success: true,
            message: "User list fetched successfully",
            list_user: users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                returned: returned
            }
        };
    } catch (error) {
        return { success: false, message: `Failed to fetch user list: ${error}` };
    }
}

exports.UpdateInfomationOfUser = async(id, infoUser) =>{
    try {
        if (!id) {
            return { success: false, message: "User ID is required" };
        }

        if (Object.keys(infoUser).length === 0) {
            return { success: false, message: "No update fields provided" };
        }

        const updatedUser = await User.findByIdAndUpdate(id,
            {$set: infoUser},
            {new: true}
        )

        // Kiểm tra nếu không tìm thấy user
        if (!updatedUser) {
            return { success: false, message: "User not found" };
        }

        return {
            success: true,
            message: "User updated successfully",
            updatedUser
        };
    } catch (error) {
        return { success: false, message: `Failed to update user: ${error.message}` };
    }
}

exports.getDetailUser = async(_id) =>{
    try {
        const user = await User.findById(_id)

        if (!user) {
            return { 
                success: false, 
                message: "User not found"
            };
        }

        else{
            return { 
                success: true, 
                message: "User details fetched successfully", 
                data: user 
            };
        }
    } catch (error) {
        return { 
            success: false, 
            message: `Failed to fetch user details: ${error}`
        };
    }
}

exports.restoreUser = async(_id) =>{
    try {
        const user_existing = await User.findById(_id);

        if(!user_existing){
            return {success: false, message: "User not found"}
        }

        else{
            await User.findByIdAndUpdate(_id, {status: "ACTIVE"}, {new: true});
            if (user_existing.department_id) {
                await Department.findByIdAndUpdate(user_existing.department_id, { $inc: { total_member: 1 } });
            }
            return {success: true, message: "User restore successfully"}
        }
    } catch (error) {
        return { success: false, message: `Internal server error: ${error}`};
    }
}