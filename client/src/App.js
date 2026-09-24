import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Base URL for the backend API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

// Main App Component
const App = () => {
  const [token, setToken] = useState(null);
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  // Fetch chat history from the backend
  const fetchChatHistory = async (authToken) => {
    if (!authToken) {
      setChatHistory([]);
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/history`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setChatHistory(response.data.messages);
      setStatusMessage('');
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setStatusMessage('Error loading chat history. Please log in again.');
      setToken(null);
      localStorage.removeItem('token');
    }
  };

  // This useEffect will run whenever the token state changes.
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchChatHistory(storedToken);
    } else {
      setChatHistory([]);
    }
  }, []);

  // Handle user authentication (signup/login)
  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLoginView ? 'login' : 'signup';
      const response = await axios.post(`${API_BASE_URL}/auth/${endpoint}`, { username, password });

      if (isLoginView) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        setStatusMessage('Login successful!');
      } else {
        setStatusMessage('Signup successful! Please log in.');
        setIsLoginView(true); // Switch to login view after successful signup
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setStatusMessage(error.response?.data?.message || 'An error occurred.');
    }
  };

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Optimistically update the UI with the user's message
    const newMessage = { sender: 'user', text: message };
    setChatHistory([...chatHistory, newMessage]);
    setMessage('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/chat/send`,
        { message: newMessage.text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the UI with the AI's response
      setChatHistory((prevChatHistory) => [
        ...prevChatHistory,
        { sender: 'ai', text: response.data.aiResponse },
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setStatusMessage(
        error.response?.data?.message || 'Error sending message. Please try again.'
      );
    }
  };

  // Handle logout
  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setChatHistory([]);
    setStatusMessage('Logged out successfully.');
  };

  // Render Authentication View
  const renderAuth = () => (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          {isLoginView ? 'Login' : 'Sign Up'}
        </h2>
        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
          >
            {isLoginView ? 'Log In' : 'Sign Up'}
          </button>
        </form>
        {statusMessage && <p className="mt-4 text-sm text-center text-gray-600">{statusMessage}</p>}
        <p className="mt-4 text-center text-sm text-gray-500">
          {isLoginView ? "Don't have an account?" : "Already have an account?"}
          <span
            onClick={() => setIsLoginView(!isLoginView)}
            className="text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer ml-1"
          >
            {isLoginView ? "Sign Up" : "Log In"}
          </span>
        </p>
      </div>
      <div className="fixed bottom-0 left-0 w-full bg-gray-100 p-2 text-center text-xs text-gray-600 border-t border-gray-200">
        Created by Fathimath Sajeela
      </div>
    </div>
  );

  // Render Chat View
  const renderChat = () => (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-indigo-600 text-white p-4 shadow-md flex justify-between items-center rounded-b-xl">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">AI Customer Support</h1>
          {username && (
            <span className="text-sm font-light text-indigo-100 opacity-80">
              Welcome, {username}!
            </span>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-800 transition duration-200"
        >
          Logout
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-4 py-2 rounded-lg shadow-sm border ${
                msg.sender === 'user'
                  ? 'bg-indigo-500 text-white rounded-br-none'
                  : 'bg-white text-gray-800 rounded-bl-none'
              }`}
            >
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="bg-white p-4 border-t border-gray-200">
        <div className="flex rounded-full shadow-md overflow-hidden border border-gray-300">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 bg-gray-50 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white font-semibold px-6 py-3 hover:bg-indigo-700 transition duration-200"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );

  return token ? renderChat() : renderAuth();
};

export default App;
