const nodemailer = require("nodemailer");
require("dotenv").config();

const sendMessage = async (msg) => {
    try {
        console.log(`Sending message to ${msg.recipient}: "${msg.content}"`);

        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.appName,
            pass: process.env.appPass,
          },
        });

        let info = await transporter.sendMail({
          from: process.env.appName,
          to: msg.recipient,
          subject: "Scheduled Message",
          text: msg.content,
        });

        console.log("Email info:", info);
        console.log(`Message sent successfully to ${msg.recipient}`);

        return info;

    } catch (error) {
        console.log(error.message);
    }
};

module.exports = sendMessage;