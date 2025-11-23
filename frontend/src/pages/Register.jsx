import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'athlete',
    state: '',
    country: '',
    sports: [],
    profilePic: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const sports = [
    'Football', 'Basketball', 'Cricket', 'Tennis', 'Badminton',
    'Swimming', 'Athletics', 'Volleyball', 'Hockey', 'Table Tennis',
    'Wrestling', 'Boxing', 'Judo', 'Karate', 'Taekwondo'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'sports') {
      const selectedSports = formData.sports.includes(value)
        ? formData.sports.filter(sport => sport !== value)
        : [...formData.sports, value];
      setFormData({ ...formData, sports: selectedSports });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.sports.length === 0) {
      setError('Please select at least one sport');
      return;
    }

    setLoading(true);

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      state: formData.state,
      country: formData.country,
      sports: formData.sports,
    });

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '350px', margin: '20px auto', padding: '20px' }}>
      <div style={{
        background: 'white',
        border: '1px solid #dbdbdb',
        borderRadius: '3px',
        padding: '40px 40px 20px'
      }}>
        <h1 style={{
          textAlign: 'center',
          fontSize: '2rem',
          marginBottom: '30px',
          fontFamily: 'cursive'
        }}>
          Athlete Platform
        </h1>

        <p style={{
          textAlign: 'center',
          color: '#8e8e8e',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          Sign up to share your athletic journey
        </p>

        {error && (
          <div style={{
            color: '#ed4956',
            background: '#fce8e9',
            border: '1px solid #ed4956',
            borderRadius: '3px',
            padding: '8px',
            marginBottom: '16px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '9px 0 7px 8px',
                border: '1px solid #dbdbdb',
                borderRadius: '3px',
                background: '#fafafa',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '9px 0 7px 8px',
                border: '1px solid #dbdbdb',
                borderRadius: '3px',
                background: '#fafafa',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '9px 0 7px 8px',
                border: '1px solid #dbdbdb',
                borderRadius: '3px',
                background: '#fafafa',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '9px 0 7px 8px',
                border: '1px solid #dbdbdb',
                borderRadius: '3px',
                background: '#fafafa',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '9px 0 7px 8px',
                border: '1px solid #dbdbdb',
                borderRadius: '3px',
                background: '#fafafa',
                fontSize: '14px'
              }}
            >
              <option value="athlete">Athlete</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '9px 0 7px 8px',
                border: '1px solid #dbdbdb',
                borderRadius: '3px',
                background: '#fafafa',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={formData.country}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '9px 0 7px 8px',
                border: '1px solid #dbdbdb',
                borderRadius: '3px',
                background: '#fafafa',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Select your sports:
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px'
            }}>
              {sports.map(sport => (
                <label key={sport} style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    name="sports"
                    value={sport}
                    checked={formData.sports.includes(sport)}
                    onChange={handleChange}
                    style={{ marginRight: '8px' }}
                  />
                  {sport}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#0095f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
      </div>

      <div style={{
        background: 'white',
        border: '1px solid #dbdbdb',
        borderRadius: '3px',
        padding: '20px',
        marginTop: '10px',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, fontSize: '14px' }}>
          Have an account?{' '}
          <Link to="/login" style={{ color: '#0095f6', textDecoration: 'none' }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;