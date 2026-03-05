/**
 * Chat Service
 * Centralised API logic for chat operations — keep all fetch/axios calls
 * here so UI components remain free of HTTP concerns.
 */

// ─── Chat Mode Constants ───────────────────────────────────────────────────────
export const CHAT_MODES = {
  BOT: 'BOT',
  PENDING_AGENT: 'PENDING_AGENT',
  LIVE_AGENT: 'LIVE_AGENT',
};

// ─── Shared helpers ────────────────────────────────────────────────────────────
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
};

async function parseResponse(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text || `HTTP ${res.status}`);
  }
}

// ─── Escalation ────────────────────────────────────────────────────────────────
/**
 * Request escalation from bot/automated replies to a live agent.
 *
 * @param {string} apiUrl       - Base API URL (e.g. "https://api.example.com/api")
 * @param {string|number} clientId      - ID of the authenticated client/user
 * @param {string|number} conversationId - Active chat / conversation ID
 *
 * @returns {Promise<EscalateResponse>}
 *
 * @typedef {Object} EscalateResponse
 * @property {'assigned'|'no_agent_available'} status
 * @property {string} [agentId]
 * @property {string} [agentName]
 * @property {string} [message]
 */
export const escalateToAgent = async (apiUrl, clientId, conversationId) => {
  if (!clientId || !conversationId) {
    throw new Error('clientId and conversationId are required for escalation');
  }

  const res = await fetch(`${apiUrl}/chats/escalate`, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({
      clientId: String(clientId),
      conversationId: String(conversationId),
    }),
  });

  const data = await parseResponse(res);

  if (!res.ok) {
    throw new Error(data?.message || `Escalation failed (HTTP ${res.status})`);
  }

  return data;
};
