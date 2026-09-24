import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import App from './App';

// Mock the axios library to prevent actual API calls during tests
jest.mock('axios');

// Mock localStorage to simulate a browser environment
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// A helper function to mock a successful login flow and wait for the chat UI
const mockSuccessfulLogin = async () => {
  axios.post.mockResolvedValueOnce({ data: { token: 'mock-jwt-token' } });
  fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'testuser' } });
  fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
  fireEvent.click(screen.getByRole('button', { name: /log in/i }));

  // Wait for the UI to update to the chat view after login
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: /ai customer support/i })).toBeInTheDocument();
  });
};

describe('App Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    axios.get.mockClear();
    axios.post.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    
    // **THE FIX:** Ensure localStorage is empty for every new test
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('renders login view by default and handles signup navigation', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/sign up/i));
    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
    
    fireEvent.click(screen.getByText(/log in/i));
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  });

  test('handles successful login and switches to chat view', async () => {
    axios.get.mockResolvedValueOnce({ data: { messages: [] } }); 
    
    render(<App />);
    await mockSuccessfulLogin();
    
    expect(screen.queryByPlaceholderText('Username')).not.toBeInTheDocument();
  });

  test('handles login failure and displays error message', async () => {
    axios.post.mockRejectedValue({ response: { data: { message: 'Invalid credentials' } } });
    
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  });

  test('loads token from localStorage and fetches chat history on mount', async () => {
    // This test explicitly needs a token, so we mock it here.
    localStorageMock.getItem.mockReturnValue('mock-stored-token');
    
    const mockChatHistory = [
      { sender: 'user', text: 'Hello' },
      { sender: 'ai', text: 'Hi there!' },
    ];
    axios.get.mockResolvedValue({ data: { messages: mockChatHistory } });
    
    render(<App />);
    
    await waitFor(() => {
      expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
      expect(axios.get).toHaveBeenCalledWith(expect.any(String), { headers: { Authorization: `Bearer mock-stored-token` } });
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('Hi there!')).toBeInTheDocument();
    });
  });

  test('sends a message and displays both user and AI responses', async () => {
    axios.post.mockResolvedValueOnce({ data: { token: 'mock-jwt-token' } }); // Login
    axios.get.mockResolvedValueOnce({ data: { messages: [] } }); // History
    axios.post.mockResolvedValueOnce({ data: { aiResponse: 'Test AI response' } }); // AI response
    
    render(<App />);
    await mockSuccessfulLogin();
    
    const messageInput = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test AI response')).toBeInTheDocument();
    });
  });

  test('handles logout correctly and returns to login view', async () => {
    axios.post.mockResolvedValueOnce({ data: { token: 'mock-jwt-token' } });
    axios.get.mockResolvedValueOnce({ data: { messages: [] } });
    
    render(<App />);
    await mockSuccessfulLogin();
    
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);
    
    await waitFor(() => {
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });
    expect(screen.queryByRole('heading', { name: /ai customer support/i })).not.toBeInTheDocument();
  });
});
