import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedSport, setSelectedSport] = useState(user?.sports?.[0] || '');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const sports = [
    'Football', 'Basketball', 'Cricket', 'Tennis', 'Badminton',
    'Swimming', 'Athletics', 'Volleyball', 'Hockey', 'Table Tennis',
    'Wrestling', 'Boxing', 'Judo', 'Karate', 'Taekwondo'
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedSport) return;

    const userMessage = { role: 'user', content: inputMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/chat/message', {
        message: inputMessage,
        sport: selectedSport,
      });

      const aiMessage = {
        role: 'assistant',
        content: response.data.aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setSelectedSport(user?.sports?.[0] || '');
  };

  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>AI Sports Assistant</h2>
              <button
                onClick={startNewChat}
                className="btn btn-secondary"
                style={{ fontSize: '14px' }}
              >
                New Chat
              </button>
            </div>
          </div>
          <div className="card-content">
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Select Sport:
              </label>
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                style={{
                  width: '200px',
                  padding: '8px',
                  border: '1px solid #dbdbdb',
                  borderRadius: '3px'
                }}
              >
                <option value="">Choose a sport</option>
                {sports.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>

            <div className="chat-container">
              <div className="chat-messages">
                {messages.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    color: '#8e8e8e',
                    marginTop: '50px'
                  }}>
                    <p>👋 Hi! I'm your AI sports assistant.</p>
                    <p>Select a sport above and ask me anything about:</p>
                    <ul style={{ textAlign: 'left', display: 'inline-block', marginTop: '10px' }}>
                      <li>Training tips and techniques</li>
                      <li>Exercise recommendations</li>
                      <li>Diet and nutrition advice</li>
                      <li>Performance grading</li>
                      <li>Sports-specific guidance</li>
                    </ul>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div key={index} className={`message ${message.role}`}>
                      <p>{message.content}</p>
                      <small style={{
                        fontSize: '10px',
                        opacity: 0.7,
                        marginTop: '4px',
                        display: 'block'
                      }}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </small>
                    </div>
                  ))
                )}
                {loading && (
                  <div className="message assistant">
                    <p>Thinking...</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="chat-input">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={selectedSport ? `Ask about ${selectedSport}...` : "Select a sport first"}
                  disabled={!selectedSport || loading}
                  style={{
                    opacity: (!selectedSport || loading) ? 0.5 : 1
                  }}
                />
                <button
                  type="submit"
                  className="btn"
                  disabled={!inputMessage.trim() || !selectedSport || loading}
                  style={{
                    opacity: (!inputMessage.trim() || !selectedSport || loading) ? 0.5 : 1
                  }}
                >
                  Send
                </button>
              </form>
            </div>

            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: '#f8f9fa',
              borderRadius: '3px',
              fontSize: '14px',
              color: '#666'
            }}>
              <strong>Example questions:</strong>
              <ul style={{ margin: '8px 0 0 20px' }}>
                <li>"What exercises should I do for better endurance?"</li>
                <li>"How can I improve my technique?"</li>
                <li>"What's a good diet for athletes?"</li>
                <li>"How do I grade my performance?"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;