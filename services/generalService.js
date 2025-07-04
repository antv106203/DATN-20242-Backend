const Department = require("../models/department.model");
const Fingerprint = require("../models/fingerprint.model");
const User = require("../models/user.model");
const Device = require("../models/device.model");
const AccessLog = require("../models/accessLog.model")
exports.getGeneralDashboardData = async() => {
    try {
        const totalDepartments = await Department.countDocuments();
        const totalFingerprints = await Fingerprint.countDocuments();
        const totalDevices = await Device.countDocuments();
        const totalUsers = await User.countDocuments({ status: "ACTIVE" });

        return {
            success: true,
            message: "Lấy dữ liệu tổng quan thành công",
            data: {
                totalDepartments,
                totalUsers,
                totalFingerprints,
                totalDevices
            }
        };
    } catch (error) {
        return {
            success: false,
            message: `Lỗi máy chủ: ${error.message}`,
            data: null
        };
    }
}

exports.getRecentHistoryAccess = async () => {
    try {
        const skip = 0;
        let sortOptions = { access_time: -1 };
        let filter = {};

        const accessLogs = await AccessLog.find(filter)
            .populate({
                path: "user_id",
                select: "full_name user_code avatar",
            })
            .skip(skip)
            .limit(5)
            .sort(sortOptions);

        return {
            success: true,
            message: "Lấy dữ liệu lịch sử thành công",
            data: accessLogs,
        };
    } catch (error) {
        return {
            success: false,
            message: `Lỗi khi lấy dữ liệu lịch sử ${error}`,
        };
    }
};


exports.getAccessChartData = async (range) => {
    const now = new Date();

    function toVietnamTime(date) {
        return new Date(date.getTime() + 7 * 60 * 60 * 1000);
    }

    function getStartOfVietnamDate(date) {
        const d = toVietnamTime(date);
        return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    }

    const nowVN = toVietnamTime(now);
    let match = {};
    let buckets = [];

    if (range === "today") {
        const startVN = new Date(nowVN);
        startVN.setUTCHours(0, 0, 0, 0);

        const currentHour = nowVN.getUTCHours();
        const totalSlots = Math.min(7, currentHour + 1);
        const interval = Math.ceil((currentHour + 1) / totalSlots);

        for (let i = 0; i < totalSlots; i++) {
            const from = i * interval;
            const to = Math.min((i + 1) * interval - 1, currentHour);
            if (from > to) continue;
            buckets.push({ from, to, label: `${from}h - ${to + 1}h` });
        }

        const startUTC = new Date(startVN.getTime() - 7 * 60 * 60 * 1000);
        match = { access_time: { $gte: startUTC } };

    } else if (range === "week") {
        const weekdayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

        const today = nowVN.getUTCDay();
        const todayIndex = today === 0 ? 6 : today - 1;

        const monday = new Date(nowVN);
        const daysFromMonday = today === 0 ? 6 : today - 1;
        monday.setUTCDate(monday.getUTCDate() - daysFromMonday);
        monday.setUTCHours(0, 0, 0, 0);

        for (let i = 0; i <= todayIndex; i++) {
            const d = new Date(monday);
            d.setUTCDate(monday.getUTCDate() + i);
            d.setUTCHours(0, 0, 0, 0);
            buckets.push({
                label: weekdayNames[i],
                date: new Date(d),
            });
        }

        const mondayUTC = new Date(monday.getTime() - 7 * 60 * 60 * 1000);
        match = { access_time: { $gte: mondayUTC } };

    } else if (range === "month") {
        const startVN = new Date(Date.UTC(nowVN.getUTCFullYear(), nowVN.getUTCMonth(), 1));
        const today = nowVN.getUTCDate();
        const totalSlots = Math.min(7, today);
        const interval = Math.ceil(today / totalSlots);

        for (let i = 0; i < totalSlots; i++) {
            const from = i * interval + 1;
            const to = Math.min((i + 1) * interval, today);
            if (from > to) continue;
            buckets.push({
                from,
                to,
                label: `${from}/${nowVN.getUTCMonth() + 1} - ${to}/${nowVN.getUTCMonth() + 1}`,
            });
        }

        const startUTC = new Date(startVN.getTime() - 7 * 60 * 60 * 1000);
        match = { access_time: { $gte: startUTC } };
    }

    try {
        const entries = await AccessLog.find(match).lean();
        let grouped = [];

        if (range === "today") {
            grouped = buckets.map(b => {
                const filtered = entries.filter(e => {
                    const hour = toVietnamTime(new Date(e.access_time)).getUTCHours();
                    return hour >= b.from && hour <= b.to;
                });
                return {
                    name: b.label,
                    success: filtered.filter(f => f.result === "success").length,
                    failed: filtered.filter(f => f.result === "failed").length
                };
            });

        } else if (range === "week") {
            grouped = buckets.map(b => {
                const filtered = entries.filter(e => {
                    const accessDate = getStartOfVietnamDate(new Date(e.access_time));
                    const bucketDate = getStartOfVietnamDate(new Date(b.date));
                    return accessDate.getTime() === bucketDate.getTime();
                });
                return {
                    name: b.label,
                    success: filtered.filter(f => f.result === "success").length,
                    failed: filtered.filter(f => f.result === "failed").length
                };
            });

        } else if (range === "month") {
            grouped = buckets.map(b => {
                const filtered = entries.filter(e => {
                    const dateVN = toVietnamTime(new Date(e.access_time));
                    const day = dateVN.getUTCDate();
                    const month = dateVN.getUTCMonth();
                    return (
                        month === nowVN.getUTCMonth() &&
                        day >= b.from &&
                        day <= b.to
                    );
                });
                return {
                    name: b.label,
                    success: filtered.filter(f => f.result === "success").length,
                    failed: filtered.filter(f => f.result === "failed").length
                };
            });
        }

        return {
            success: true,
            message: "Lấy dữ liệu biểu đồ thành công",
            data: grouped
        };

    } catch (error) {
        return {
            success: false,
            message: `Lỗi khi tạo dữ liệu biểu đồ: ${error.message}`,
            data: null
        };
    }
};


