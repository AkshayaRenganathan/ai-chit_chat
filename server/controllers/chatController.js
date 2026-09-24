const chatService = require('../services/chatService');

const sendMessage = async (req, res, next) => {
  try {
    const aiResponse = await chatService.sendMessage(req.user.userId, req.body.message);
    res.status(200).json({ aiResponse });
  } catch (error) {
    next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const messages = await chatService.getHistory(req.user.userId);
    res.status(200).json({ messages });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getHistory };
