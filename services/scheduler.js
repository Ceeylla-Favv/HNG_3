const cron = require("node-cron");
const messageModel = require("../models/Message");
const sendMessage = require("../utils/sendMessage");

const scheduleMessage = () => {
    cron.schedule("* * * * *", async () => {
        try {
            console.log("Checking for messages to send...");

            const now = new Date();
            const nowUTC = new Date(now.toISOString());

            const messages = await messageModel.find({
                sendAt: { $lte: nowUTC},
                sent: false,
            });

            for (const msg of messages) {
                await sendMessage(msg);
                msg.sent = true;
                await msg.save();
            }
        } catch (error) {
            console.error("Error processing scheduled messages:", error);
        }
    });

    console.log("Scheduler is running...");
};

module.exports = scheduleMessage;