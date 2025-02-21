const messageModel = require("../models/Message");

const scheduleMessage = async (req, res) => {
  try {
    const { content, recipient, sendAt } = req.body;

    if (!content || !recipient || !sendAt) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const sendAtUtc = new Date(sendAt).toISOString();

    if (isNaN(new Date(sendAtUtc).getTime())) {
      return res.status(400).json({
        message: "Invalid date format. Use 'YYYY-MM-DD HH:mm'",
      });
    }

    const message = new messageModel({
      content,
      recipient,
      sendAt: sendAtUtc,
    });

    await message.save();

    return res
      .status(201)
      .json({ message: "Message scheduled successfully", data: message });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getScheduledMessage = async (req, res) => {
  try {
    const messages = await messageModel
      .find({ sendAt: { $gte: new Date() } })
      .sort("sendAt");

    const formattedMessages = messages.map((msg) => ({
      ...msg._doc,
      sendAt: new Date(msg.sendAt).toLocaleString(),
    }));

    return res.status(200).json({ messages: formattedMessages });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const cancelSchedule = async (req, res) => {
  try {
    const message = await messageModel.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    return res.status(200).json({ message: "Message canceled successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const rescheduleMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { newSendAt, newContent } = req.body;

    if (!newSendAt) {
      return res.status(400).json({ message: "New send time is required" });
    }

    const message = await messageModel.findById(id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.sent) {
      return res
        .status(400)
        .json({ message: "Cannot reschedule a sent message" });
    }

    const updatedSentAt = new Date(newSendAt).toISOString();

    if (isNaN(new Date(updatedSentAt).getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    message.sendAt = updatedSentAt;

    if(newContent) {
      message.content = newContent;
    }
    
    await message.save();

    return res
      .status(200)
      .json({ message: "Message rescheduled successfully", data: message });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  scheduleMessage,
  getScheduledMessage,
  cancelSchedule,
  rescheduleMessage,
};
