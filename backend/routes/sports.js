const express = require('express');
const { adminAuth } = require('../middleware/auth');
const Sport = require('../models/Sport');

const router = express.Router();

// Get all sports
router.get('/', async (req, res) => {
  try {
    const sports = await Sport.find({ isActive: true }).sort({ order: 1, name: 1 });
    res.json(sports);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all sports (admin - including inactive)
router.get('/admin', adminAuth, async (req, res) => {
  try {
    const sports = await Sport.find().sort({ order: 1, name: 1 });
    res.json(sports);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create sport (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, description, icon, order } = req.body;

    const sport = new Sport({
      name,
      description,
      icon,
      order: order || 0,
    });

    await sport.save();
    res.status(201).json(sport);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Sport with this name already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update sport (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, description, icon, order, isActive } = req.body;

    const sport = await Sport.findByIdAndUpdate(
      req.params.id,
      { name, description, icon, order, isActive },
      { new: true }
    );

    if (!sport) {
      return res.status(404).json({ message: 'Sport not found' });
    }

    res.json(sport);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Sport with this name already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete sport (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const sport = await Sport.findByIdAndDelete(req.params.id);
    if (!sport) {
      return res.status(404).json({ message: 'Sport not found' });
    }
    res.json({ message: 'Sport deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;