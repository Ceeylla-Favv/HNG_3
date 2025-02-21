const express = require('express');
const { scheduleMessage, getScheduledMessage, cancelSchedule, rescheduleMessage } = require('../controllers/messageController');
const router = express.Router();

router.route("/schedule").post(scheduleMessage);
router.route("/get-scheduled-messages").get(getScheduledMessage);
router.route("/cancel-scheduled-message/:id").delete(cancelSchedule);
router.route("/reschedule-message/:id").patch(rescheduleMessage);

module.exports = router;