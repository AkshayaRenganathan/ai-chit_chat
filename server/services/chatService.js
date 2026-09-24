const Chat = require('../models/Chat');
const { getAIResponse } = require('./aiService');

const sendMessage = async (userId, message) => {
  const trimmedMessage = message?.trim();

  if (!trimmedMessage) {
    const error = new Error('Message is required');
    error.statusCode = 400;
    throw error;
  }

  let chat = await Chat.findOne({ userId });
  if (!chat) {
    chat = new Chat({ userId, messages: [] });
  }

  chat.messages.push({ sender: 'user', text: trimmedMessage });
  await chat.save();

  try {
    const aiMessage = await getAIResponse(trimmedMessage);
    chat.messages.push({ sender: 'ai', text: aiMessage });
    await chat.save();
    return aiMessage;
  } catch (error) {
    // Keep the user's message saved, but don't add a fake AI response.
    throw error;
  }
};

const getHistory = async (userId) => {
  const chat = await Chat.findOne({ userId });
  return chat?.messages || [];
};

module.exports = { sendMessage, getHistory };
