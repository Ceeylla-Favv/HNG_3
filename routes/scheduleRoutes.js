const express = require('express');
const { scheduleMessage, integrationConfig } = require('../controllers/messageController');
const router = express.Router();

router.route("/schedule").post(scheduleMessage);
router.route("/integration").get(integrationConfig);

module.exports = router;