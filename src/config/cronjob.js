const cron = require("node-cron");
const Reminder = require("../models/reminder.model");
const Task = require("../models/task.model");
const Project = require("../models/project.model");
const moment = require("moment");

function sendFCMNotification(userId, message) {
    console.log(`[Mock] Gửi thông báo cho user ${userId}: ${message}`);
}

async function checkReminders() {
    const now = moment().toDate();
    const reminders = await Reminder.find().populate("task").populate("project");

    for (const reminder of reminders) {
        let target = reminder.task || reminder.project;
        if (!target) {
            await Reminder.findByIdAndDelete(reminder._id); 
            continue;
        }

        if (target.endDate && moment(target.endDate).isBefore(now)) {
            await Reminder.findByIdAndDelete(reminder._id);
            continue;
        }

        let message = reminder.task
            ? `Nhắc nhở: Task "${target.name}" sắp đến hạn vào ${moment(target.endDate).format("DD/MM/YYYY HH:mm")}`
            : `Nhắc nhở: Project "${target.name}" sắp đến hạn vào ${moment(target.endDate).format("DD/MM/YYYY HH:mm")}`;

        sendFCMNotification(reminder.user, message);
        await reminder.save();
    }
}

function startReminderCronJob() {
    cron.schedule("0 */3 * * *", checkReminders);
    // cron.schedule("*/5 * * * * *", checkReminders);
}

module.exports = { startReminderCronJob };
