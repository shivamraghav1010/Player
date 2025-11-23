const express = require('express');
const { auth } = require('../middleware/auth');
const Video = require('../models/Video');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  },
});

// Upload video
router.post('/upload', auth, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video file provided' });
    }

    const { title, description, sport } = req.body;

    // Check video duration (this is a basic check, you might want to use ffprobe for accurate duration)
    if (req.file.size > 50 * 1024 * 1024) { // Rough check for 30sec video
      return res.status(400).json({ message: 'Video too large or too long' });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'athlete-videos',
          transformation: [
            { width: 720, height: 1280, crop: 'limit' },
            { quality: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // Create video document
    const video = new Video({
      title,
      description,
      videoUrl: result.secure_url,
      thumbnailUrl: result.secure_url.replace('.mp4', '.jpg'), // Cloudinary generates thumbnail
      sport,
      duration: Math.min(30, Math.floor(result.duration || 30)), // Ensure max 30 seconds
      uploader: req.user.id,
    });

    await video.save();

    res.status(201).json(video);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all videos
router.get('/all', async (req, res) => {
  try {
    const videos = await Video.find({})
      .populate('uploader', 'username profilePic')
      .sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get videos by sport
router.get('/sport/:sport', async (req, res) => {
  try {
    const videos = await Video.find({ sport: req.params.sport })
      .populate('uploader', 'username profilePic')
      .sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's videos
router.get('/user/:userId', async (req, res) => {
  try {
    const videos = await Video.find({ uploader: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike video
router.post('/:id/like', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const userId = req.user.id;
    const likeIndex = video.likes.indexOf(userId);

    if (likeIndex > -1) {
      video.likes.splice(likeIndex, 1);
    } else {
      video.likes.push(userId);
    }

    await video.save();
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Increment view count
router.post('/:id/view', async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    res.json({ views: video.views });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to video
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const newComment = {
      user: req.user.id,
      text,
      createdAt: new Date(),
    };

    video.comments.push(newComment);
    await video.save();

    // Populate the comment with user info
    await video.populate('comments.user', 'username profilePic');

    res.status(201).json(video.comments[video.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get video with comments
router.get('/:id/details', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('uploader', 'username profilePic')
      .populate('comments.user', 'username profilePic')
      .populate('likes', 'username');

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete video
router.delete('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check if the user is the owner of the video
    if (video.uploader.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this video' });
    }

    // Delete from Cloudinary if needed (optional - videos can be kept for backup)
    // You can uncomment the following lines if you want to delete from Cloudinary too
    /*
    const publicId = video.videoUrl.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`athlete-videos/${publicId}`, { resource_type: 'video' });
    */

    await Video.findByIdAndDelete(req.params.id);

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;