import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sport: '',
    video: null,
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  const sports = [
    'Football', 'Basketball', 'Cricket', 'Tennis', 'Badminton',
    'Swimming', 'Athletics', 'Volleyball', 'Hockey', 'Table Tennis',
    'Wrestling', 'Boxing', 'Judo', 'Karate', 'Taekwondo'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('video/')) {
        setError('Please select a video file');
        return;
      }

      // Check file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        setError('File size must be less than 100MB');
        return;
      }

      setFormData({ ...formData, video: file });
      setError('');

      // Create video preview
      const videoUrl = URL.createObjectURL(file);
      setPreview(videoUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.video) {
      setError('Please select a video file');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!formData.sport) {
      setError('Please select a sport');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const uploadData = new FormData();
      uploadData.append('video', formData.video);
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('sport', formData.sport);

      const response = await axios.post('http://localhost:5000/api/videos/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Clean up preview URL
      if (preview) {
        URL.revokeObjectURL(preview);
      }

      navigate(`/profile/${user.id}`);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="card">
          <div className="card-header">
            <h2>Upload Practice Video</h2>
          </div>
          <div className="card-content">
            {error && (
              <div style={{
                color: '#ed4956',
                background: '#fce8e9',
                border: '1px solid #ed4956',
                borderRadius: '3px',
                padding: '8px',
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter video title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your practice session"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Sport *</label>
                <select
                  name="sport"
                  value={formData.sport}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a sport</option>
                  {sports.map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Video File *</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  required
                />
                <small style={{ color: '#8e8e8e', fontSize: '12px' }}>
                  Max file size: 100MB. Videos longer than 30 seconds will be trimmed.
                </small>
              </div>

              {preview && (
                <div style={{ marginBottom: '16px' }}>
                  <label>Preview:</label>
                  <video
                    src={preview}
                    controls
                    style={{
                      width: '100%',
                      maxHeight: '300px',
                      marginTop: '8px',
                      borderRadius: '3px'
                    }}
                  />
                </div>
              )}

              <button
                type="submit"
                className="btn"
                disabled={uploading}
                style={{
                  width: '100%',
                  opacity: uploading ? 0.6 : 1,
                  cursor: uploading ? 'not-allowed' : 'pointer'
                }}
              >
                {uploading ? 'Uploading...' : 'Upload Video'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Upload;