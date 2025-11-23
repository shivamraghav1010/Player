import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

const Sport = () => {
  const { sport } = useParams();
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, [sport]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest('.menu-container')) {
        setMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const fetchVideos = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/videos/sport/${sport}`);
      setVideos(response.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = async (video) => {
    setSelectedVideo(video);
    // Increment view count
    try {
      await axios.post(`http://localhost:5000/api/videos/${video._id}/view`);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleLike = async (videoId) => {
    try {
      await axios.post(`http://localhost:5000/api/videos/${videoId}/like`);
      // Refresh videos to update like count
      fetchVideos();
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleShare = (video) => {
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: `Check out this ${video.sport} video by ${video.uploader.username}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/videos/${videoId}`);
      // Refresh videos after deletion
      fetchVideos();
      setMenuOpen(null);
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video. Please try again.');
    }
  };

  const toggleMenu = (videoId) => {
    setMenuOpen(menuOpen === videoId ? null : videoId);
  };

  const closeModal = () => {
    setSelectedVideo(null);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading {sport} videos...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-header">
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
              {sport} Videos
            </h1>
            <Link
              to="/dashboard"
              style={{
                color: '#0095f6',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="video-grid">
          {videos.map(video => (
            <div key={video._id} className="video-card">
              <video
                src={video.videoUrl}
                className="video-thumbnail"
                onClick={() => handleVideoClick(video)}
                onMouseEnter={(e) => e.target.play()}
                onMouseLeave={(e) => e.target.pause()}
                muted
              />
              <div className="video-info">
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <p className="video-title" style={{ margin: 0, flex: 1 }}>{video.title}</p>
                  <div className="video-actions">
                    <button
                      onClick={() => handleLike(video._id)}
                      className={`action-btn like-btn ${video.likes?.includes(user?.id) ? 'liked' : ''}`}
                    >
                      <Heart size={16} />
                      <span>{video.likes?.length || 0}</span>
                    </button>
                    <button className="action-btn">
                      <MessageCircle size={16} />
                      <span>0</span>
                    </button>
                    <button
                      onClick={() => handleShare(video)}
                      className="action-btn"
                    >
                      <Share2 size={16} />
                    </button>
                    {user && user.id === video.uploader._id && (
                      <div className="menu-container">
                        <button
                          onClick={() => toggleMenu(video._id)}
                          className="action-btn menu-btn"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {menuOpen === video._id && (
                          <div className="dropdown-menu">
                            <button
                              onClick={() => handleDeleteVideo(video._id)}
                              className="dropdown-item delete-btn"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <p className="video-meta" style={{ margin: 0 }}>
                  {video.views} views • {new Date(video.createdAt).toLocaleDateString()}
                </p>
                {video.description && (
                  <p style={{
                    margin: '4px 0 0 0',
                    fontSize: '14px',
                    color: '#262626'
                  }}>
                    {video.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {videos.length === 0 && (
          <p style={{
            textAlign: 'center',
            color: '#8e8e8e',
            margin: '40px 0'
          }}>
            No videos uploaded for {sport} yet.
          </p>
        )}

        {/* Video Modal */}
        {selectedVideo && (
          <div className="modal" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeModal}>×</button>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <img
                    src={selectedVideo.uploader.profilePic || 'https://via.placeholder.com/40'}
                    alt={selectedVideo.uploader.username}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      marginRight: '12px'
                    }}
                  />
                  <div>
                    <Link
                      to={`/profile/${selectedVideo.uploader._id}`}
                      style={{
                        fontWeight: '600',
                        color: '#262626',
                        textDecoration: 'none'
                      }}
                    >
                      {selectedVideo.uploader.username}
                    </Link>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#8e8e8e' }}>
                      {selectedVideo.sport}
                    </p>
                  </div>
                </div>

                <video
                  src={selectedVideo.videoUrl}
                  controls
                  autoPlay
                  style={{
                    width: '100%',
                    maxHeight: '70vh',
                    borderRadius: '3px'
                  }}
                />

                <div style={{ marginTop: '16px' }}>
                  <h3 style={{ margin: '0 0 8px 0' }}>{selectedVideo.title}</h3>
                  {selectedVideo.description && (
                    <p style={{ margin: '0 0 8px 0', color: '#262626' }}>
                      {selectedVideo.description}
                    </p>
                  )}
                  <p style={{ margin: 0, color: '#8e8e8e', fontSize: '14px' }}>
                    {selectedVideo.views} views • {new Date(selectedVideo.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sport;