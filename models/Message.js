const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const messageSchema = new Schema({
  content: { type: String, required: true },
  recipient: { type: String, required: true },
  sendAt: { type: Date, required: true },
  sent: {type: Boolean, default: false},
},{
    timestamps: true
});

const messageModel = model("Message", messageSchema);

module.exports = messageModel;
