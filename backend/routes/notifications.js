const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const Notification = require('../models/Notification');

const router = express.Router();

// Get all notifications
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      isActive: true,
      $or: [
        // Admin/broadcast notifications (not follow notifications)
        {
          type: { $ne: 'follow' },
          $or: [
            { targetAudience: 'all' },
            { targetAudience: req.user.role === 'admin' ? 'admins' : 'athletes' }
          ]
        },
        // Personal notifications (including follow notifications)
        { recipient: req.user.id },
        // Notifications created by admins (so admins can see notifications they sent)
        ...(req.user.role === 'admin' ? [{ createdBy: req.user.id }] : [])
      ]
    })
      .populate('createdBy', 'username profilePic')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create notification (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { title, message, type, targetAudience } = req.body;

    const notification = new Notification({
      title,
      message,
      type,
      targetAudience,
      createdBy: req.user.id,
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update notification (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { title, message, type, targetAudience, isActive } = req.body;

    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { title, message, type, targetAudience, isActive },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete notification (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create follow notification
router.post('/follow', auth, async (req, res) => {
  try {
    const { recipientId } = req.body;

    const notification = new Notification({
      title: 'New Follower',
      message: 'Someone started following you!',
      type: 'follow',
      recipient: recipientId,
      createdBy: req.user.id,
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send notification to specific user (admin only)
router.post('/send-to-user', adminAuth, async (req, res) => {
  try {
    const { recipientId, title, message, type } = req.body;

    // Validate required fields
    if (!recipientId || !title || !message) {
      return res.status(400).json({ message: 'Recipient ID, title, and message are required' });
    }

    // Validate recipientId is a valid ObjectId
    if (!require('mongoose').Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ message: 'Invalid recipient ID' });
    }

    // Check if recipient exists
    const User = require('../models/User');
    const recipientExists = await User.findById(recipientId);
    if (!recipientExists) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    const notification = new Notification({
      title,
      message,
      type: type || 'general',
      recipient: recipientId,
      createdBy: req.user.id,
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notifications as read
router.put('/mark-read', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;