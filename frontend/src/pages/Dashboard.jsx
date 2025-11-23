import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const [videos, setVideos] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [availableSports, setAvailableSports] = useState([]);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      // First, get all videos to determine which sports have content
      const response = await axios.get('http://localhost:5000/api/videos/all');
      const allVideos = response.data;

      // Group videos by sport and get unique sports that have videos
      const videosBySport = {};
      const sportsWithVideos = new Set();

      allVideos.forEach(video => {
        if (!videosBySport[video.sport]) {
          videosBySport[video.sport] = [];
        }
        videosBySport[video.sport].push(video);
        sportsWithVideos.add(video.sport);
      });

      // Sort videos by creation date (newest first) and take only first 4 per sport
      Object.keys(videosBySport).forEach(sport => {
        videosBySport[sport] = videosBySport[sport]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 4);
      });

      setVideos(videosBySport);
      setAvailableSports(Array.from(sportsWithVideos));
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

  const closeModal = () => {
    setSelectedVideo(null);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading dashboard...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="main-content">
        {availableSports.map(sport => (
          <div key={sport} className="card" style={{ marginBottom: '30px' }}>
            <div className="card-header">
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>
                {sport}
              </h2>
              <Link
                to={`/sport/${sport}`}
                style={{
                  color: '#0095f6',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                View All
              </Link>
            </div>
            <div className="card-content">
              {videos[sport] && videos[sport].length > 0 ? (
                <div className="video-grid">
                  {videos[sport].map(video => (
                    <div key={video._id} className="video-card" onClick={() => handleVideoClick(video)}>
                      <video
                        src={video.videoUrl}
                        className="video-thumbnail"
                        onMouseEnter={(e) => e.target.play()}
                        onMouseLeave={(e) => e.target.pause()}
                        muted
                      />
                      <div className="video-info">
                        <p className="video-title">{video.title}</p>
                        <p className="video-meta">
                          {video.uploader.username} • {video.views} views
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{
                  textAlign: 'center',
                  color: '#8e8e8e',
                  margin: '20px 0'
                }}>
                  No videos uploaded for {sport} yet.
                </p>
              )}
            </div>
          </div>
        ))}

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

export default Dashboard;