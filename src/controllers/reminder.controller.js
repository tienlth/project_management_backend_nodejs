const Reminder = require("../models/reminder.model");

const getUserReminders = async (req, res) => {
  try {
    const userId = req.user.id;
    const reminders = await Reminder.find({ createdBy: userId })
      .populate("task", "title")
      .populate("project", "name");

    res.status(200).json({ success: true, data: reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error });
  }
};

const createReminder = async (req, res) => {
  try {
    const { project, task, remindAt } = req.body;
    const userId = req.user.id;

    if (!remindAt) {
      return res.status(400).json({ success: false, message: "Thời gian nhắc không được để trống" });
    }

    const newReminder = new Reminder({ project, task, remindAt, createdBy: userId });
    await newReminder.save();

    res.status(201).json({ success: true, message: "Tạo nhắc hẹn thành công", data: newReminder });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error });
  }
};

const deleteReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;
    const userId = req.user.id;

    const reminder = await Reminder.findOneAndDelete({ _id: reminderId, createdBy: userId });

    if (!reminder) {
      return res.status(404).json({ success: false, message: "Không tìm thấy nhắc hẹn" });
    }

    res.status(200).json({ success: true, message: "Xóa nhắc hẹn thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error });
  }
};

module.exports = {
  getUserReminders,
  createReminder,
  deleteReminder
};
