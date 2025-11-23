const express = require('express');
const { auth } = require('../middleware/auth');
const Chat = require('../models/Chat');
const User = require('../models/User');

const router = express.Router();

// Get user's chat history
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user.id })
      .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message and get AI response
router.post('/message', auth, async (req, res) => {
  try {
    const { message, sport } = req.body;

    // Get user info for personalized responses
    const user = await User.findById(req.user.id);

    // Simple AI response logic (in production, use OpenAI or similar)
    const aiResponse = generateAIResponse(message, sport, user);

    // Find or create chat
    let chat = await Chat.findOne({ user: req.user.id, sport });
    if (!chat) {
      chat = new Chat({ user: req.user.id, sport });
    }

    // Add messages
    chat.messages.push(
      { role: 'user', content: message },
      { role: 'assistant', content: aiResponse }
    );

    await chat.save();

    res.json({
      userMessage: message,
      aiResponse,
      chatId: chat._id,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Simple AI response generator
function generateAIResponse(message, sport, user) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('tip') || lowerMessage.includes('advice')) {
    return `For ${sport}, focus on consistent practice and proper technique. Make sure to warm up before training and cool down afterward.`;
  }

  if (lowerMessage.includes('exercise') || lowerMessage.includes('workout')) {
    return `Recommended ${sport} exercises: 1) Basic drills daily, 2) Strength training 3x/week, 3) Flexibility exercises. Start slow and build up gradually.`;
  }

  if (lowerMessage.includes('technique') || lowerMessage.includes('form')) {
    return `Proper ${sport} technique requires balance, coordination, and repetition. Watch professional players and practice slowly at first.`;
  }

  if (lowerMessage.includes('diet') || lowerMessage.includes('nutrition')) {
    return `A balanced diet for ${sport} athletes should include: proteins for muscle repair, complex carbs for energy, healthy fats, and plenty of vegetables. Stay hydrated!`;
  }

  if (lowerMessage.includes('grade') || lowerMessage.includes('level')) {
    return `Based on your experience in ${user.sports.join(', ')}, I'd estimate you're at an intermediate level. Keep practicing to advance further!`;
  }

  return `I'm here to help with ${sport} tips, exercises, techniques, and nutrition advice. What specific aspect would you like to know more about?`;
}

module.exports = router;