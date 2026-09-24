const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-oss-20b:free';

const getAIResponse = async (message) => {
  if (!process.env.AI_API_KEY) {
    const error = new Error('AI_API_KEY is not configured');
    error.statusCode = 500;
    throw error;
  }

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.AI_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
      'X-Title': 'AI Customer Support Chat',
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || DEFAULT_MODEL,
      messages: [{ role: 'user', content: message }],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('OpenRouter error:', data);
    const error = new Error(
      data?.error?.message || `OpenRouter request failed with status ${response.status}`
    );
    error.statusCode = response.status >= 400 && response.status < 500 ? 502 : 503;
    throw error;
  }

  const aiMessage = data?.choices?.[0]?.message?.content;

  if (!aiMessage) {
    console.error('Unexpected OpenRouter response:', data);
    const error = new Error('AI provider returned an empty response');
    error.statusCode = 502;
    throw error;
  }

  return aiMessage;
};

module.exports = { getAIResponse };
