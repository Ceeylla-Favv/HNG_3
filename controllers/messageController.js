const messageModel = require("../models/Message");
const formatMessage = require("../utils/gemini");

const url = "https://hng-3.onrender.com";

const scheduleMessage = async (req, res) => {
  try {
    const { message } = req.body;

    const processedMessage = await formatMessage(message);

    if (!processedMessage.recipient) {
      processedMessage.recipient = "default@recipient.com";
    }

    if (!processedMessage.content) {
      console.error("Error: Missing content");
      return res
        .status(400)
        .json({ message: "Invalid scheduling request: Missing content" });
    }

    if (!processedMessage.sendAt) {
      console.error("Error: Missing sendAt field");
      return res
        .status(400)
        .json({ message: "Invalid scheduling request: Missing sendAt" });
    }

    let scheduledDate = new Date(processedMessage.sendAt + " UTC");

    if (isNaN(scheduledDate.getTime())) {
      console.error("Error: Invalid date format ->", processedMessage.sendAt);
      return res.status(400).json({ message: "Invalid date format" });
    }

    
    const now = new Date();

    if (scheduledDate < now) {
      console.warn(
        "⚠️ Scheduled time is in the past. Adjusting to the next available time."
      );
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }

    const humanReadableTime = scheduledDate.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMessage = new messageModel({
      content: processedMessage.content,
      recipient: processedMessage.recipient,
      sendAt: new Date(processedMessage.sendAt + " UTC").toISOString(),
      sent: false,
    });

    await newMessage.save();

    res.status(200).json({
      message: `Your message ('${processedMessage.content}') to ('${processedMessage.recipient}') has been scheduled for ${humanReadableTime}.`,
      status: "success",
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const integrationConfig = async (req, res) => {
  const integrationData = {
    data: {
      date: {
        created_at: "2025-02-22",
        updated_at: "2025-02-22",
      },
      descriptions: {
        app_description: "Schedule messages to be sent at a later time",
        app_logo: "https://i.ibb.co/0V1h40vP/image1-0.jpg",
        app_name: "Message Scheduler",
        app_url: url,
        background_color: "#fff",
      },
      integration_category: "Communication & Collaboration",
      integration_type: "modifier",
      is_active: true,
      key_features: [
        "Task reminders which is helpful for internal team communication",
        "Time-Sensitive communication between users to ensure that messages are delivered at the best time",
      ],
      permissions: {
        monitoring_user: {
          always_online: true,
          display_name: "Message Scheduler",
        },
      },
      settings: [
        {
          label: "Scheduled message",
          type: "text",
          required: true,
          default: "",
        },
      ],
      target_url: `${url}/schedule`,
    },
  };

  res.json(integrationData);
};

module.exports = {
  scheduleMessage,
  integrationConfig,
};
