const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `You are an expert Import & Export assistant for Indian and international trade.
Help users with IEC, customs, documentation, Incoterms (FOB, CIF, etc.), shipping, duties, compliance, and practical trade workflows.
Be clear, accurate, and concise. Use simple language. If something depends on country or product, say so and ask a short clarifying question when needed.
Do not invent legal/regulatory facts; when unsure, say what the user should verify with an official source or consultant.
Stay on import/export and related business topics. If asked something unrelated, briefly redirect to trade topics.`;

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const MAX_HISTORY_MESSAGES = 20;

/**
 * @param {Array<{ role: 'user' | 'assistant', content: string }>} historyMessages
 * @param {string} userMessage
 * @returns {Promise<string>}
 */
async function getAssistantReply(historyMessages, userMessage) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const err = new Error('OPENAI_API_KEY is not configured');
    err.code = 'OPENAI_NOT_CONFIGURED';
    throw err;
  }

  const recent = Array.isArray(historyMessages)
    ? historyMessages.slice(-MAX_HISTORY_MESSAGES)
    : [];

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...recent.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ];

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages,
      temperature: 0.5,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(data?.error?.message || 'OpenAI request failed');
    err.code = 'OPENAI_API_ERROR';
    err.status = response.status;
    err.details = data?.error || null;
    throw err;
  }

  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    const err = new Error('Empty response from OpenAI');
    err.code = 'OPENAI_EMPTY_RESPONSE';
    throw err;
  }

  return content.trim();
}

module.exports = {
  getAssistantReply,
  SYSTEM_PROMPT,
  MAX_HISTORY_MESSAGES,
};
