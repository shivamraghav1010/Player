import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Heart, MessageCircle, Share2, Upload, MoreHorizontal } from 'lucide-react';

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: '',
    profilePic: '',
    state: '',
    country: '',
    sports: []
  });
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);

  const isOwnProfile = user && user.id === id;
  const isFollowing = user && profile?.followers?.includes(user.id);

  useEffect(() => {
    fetchProfile();
    fetchVideos();
  }, [id]);

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

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/profile/${id}`);
      setProfile(response.data);
      if (isOwnProfile) {
        setEditForm({
          bio: response.data.bio || '',
          profilePic: response.data.profilePic || '',
          state: response.data.state || '',
          country: response.data.country || '',
          sports: response.data.sports || []
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/videos/user/${id}`);
      setVideos(response.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUploadingPic(true);

    try {
      // First upload profile picture if a file was selected
      if (profilePicFile) {
        const formData = new FormData();
        formData.append('profilePic', profilePicFile);

        await axios.post('http://localhost:5000/api/users/upload-profile-pic', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      // Then update the profile information
      await axios.put('http://localhost:5000/api/users/profile', {
        bio: editForm.bio,
        state: editForm.state,
        country: editForm.country,
        sports: editForm.sports,
      });

      // Refresh profile data to get the latest info
      await fetchProfile();
      setIsEditing(false);
      setProfilePicFile(null);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setUploadingPic(false);
    }
  };

  const handleFollow = async () => {
    try {
      await axios.post(`http://localhost:5000/api/users/follow/${id}`);
      fetchProfile(); // Refresh profile data to update follower count and following status
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      // Preview the image
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditForm({ ...editForm, profilePic: e.target.result });
      };
      reader.readAsDataURL(file);
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
        text: `Check out this ${video.sport} video by ${profile.username}`,
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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading profile...</div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="main-content">
          <p>Profile not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="profile-container">
          <div className="profile-top-section">
            <div className="profile-pic-section">
              <div className="profile-pic-upload">
                <img
                  src={profile.profilePic || 'https://via.placeholder.com/150'}
                  alt={profile.username}
                  className="profile-pic"
                />
              </div>
            </div>

            <div className="profile-info-section">
              <div className="profile-username-row">
                <h1 className="profile-username">{profile.username}</h1>
                {isOwnProfile ? (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="btn btn-secondary edit-profile-btn"
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                ) : (
                  <button
                    onClick={handleFollow}
                    className={`btn ${isFollowing ? 'btn-secondary' : 'follow-btn'}`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>

              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-number">{videos.length}</span>
                  <span className="stat-label">posts</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{profile.followers?.length || 0}</span>
                  <span className="stat-label">followers</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{profile.following?.length || 0}</span>
                  <span className="stat-label">following</span>
                </div>
              </div>

              <div className="profile-bio-section">
                {isEditing ? (
                  <form onSubmit={handleEditSubmit} className="edit-profile-form">
                    <div className="form-group">
                      <label className="form-label">Profile Picture</label>
                      <div className="profile-pic-preview">
                        <img
                          src={editForm.profilePic || 'https://via.placeholder.com/150'}
                          alt="Profile preview"
                          className="profile-pic-preview-img"
                        />
                        <label htmlFor="profile-pic-upload" className="upload-btn">
                          <Upload size={16} />
                          Change Photo
                          <input
                            id="profile-pic-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePicChange}
                            className="upload-input"
                          />
                        </label>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Bio</label>
                      <textarea
                        placeholder="Tell us about yourself..."
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        className="form-control"
                        rows="3"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">State</label>
                        <input
                          type="text"
                          placeholder="State"
                          value={editForm.state}
                          onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Country</label>
                        <input
                          type="text"
                          placeholder="Country"
                          value={editForm.country}
                          onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                          className="form-control"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="btn save-btn"
                      disabled={uploadingPic}
                    >
                      {uploadingPic ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                ) : (
                  <>
                    <p className="profile-bio">{profile.bio || 'No bio yet'}</p>
                    <p className="profile-location">
                      {profile.state && profile.country ? `${profile.state}, ${profile.country}` : ''}
                    </p>
                    <p className="profile-sports">
                      Sports: {profile.sports?.join(', ') || 'Not specified'}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="video-grid">
          {videos.map(video => (
            <div key={video._id} className="video-card" style={{ maxWidth: '293px' }}>
              <video
                src={video.videoUrl}
                className="video-thumbnail"
                controls
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
                    {isOwnProfile && (
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
            No videos uploaded yet.
          </p>
        )}
      </div>
    </>
  );
};

export default Profile;