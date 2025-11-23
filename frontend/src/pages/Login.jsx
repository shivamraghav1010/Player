import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '350px', margin: '50px auto', padding: '20px' }}>
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
            {loading ? 'Logging in...' : 'Log In'}
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
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#0095f6', textDecoration: 'none' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;