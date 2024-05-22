const express = require('express');
const Message = require('../models/Message');
const router = express.Router();

// Get messages for a room
router.get('/messages/:room', async (req, res) => {
    const { room } = req.params;
    try {
        const messages = await Message.find({ room }).sort('timestamp');
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
