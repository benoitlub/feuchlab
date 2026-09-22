type Env = { MISTRAL_API_KEY?: string; MISTRAL_MODEL?: string };
type Mission = { operationId?: string; requiredCapabilities?: string[]; prompt?: string; context?: { id?: string } };
const headers = { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...headers, 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'Content-Type' } });
    const path = new URL(request.url).pathname;
    if (path === '/health' && request.method === 'GET') return json({ status: 'alive', capabilities: ['game.challenge.suggest'], configured: Boolean(env.MISTRAL_API_KEY) });
    if (path !== '/execute' || request.method !== 'POST') return json({ status: 'not-found' }, 404);
    const body = await request.json().catch(() => null) as { contract?: string; mission?: Mission } | null;
    const mission = body?.mission;
    if (body?.contract !== 'octopus-adapter-execution-v1' || !mission?.requiredCapabilities?.length || mission.requiredCapabilities.some(cap => cap !== 'game.challenge.suggest') || !['420-dice-game', 'feuch-dice'].includes(mission.context?.id ?? '')) return json({ status: 'failed', summary: 'Unsupported game mission or contract.' }, 400);
    if (!env.MISTRAL_API_KEY) return json({ status: 'failed', summary: 'Game adapter MISTRAL_API_KEY is not configured.' }, 503);
    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: { authorization: `Bearer ${env.MISTRAL_API_KEY}`, 'content-type': 'application/json' },
        body: JSON.stringify({ model: env.MISTRAL_MODEL || 'mistral-large-latest', messages: [{ role: 'system', content: 'You are a playful game text adapter. Return only valid JSON. Never change game rules or introduce unsafe challenges.' }, { role: 'user', content: mission.prompt || '' }], temperature: 0.4, max_tokens: 900 }),
      });
      if (!response.ok) return json({ operationId: mission.operationId, status: 'failed', summary: `Mistral API error: ${response.status} ${response.statusText}`, output: {} });
      const payload = await response.json() as { choices?: { message?: { content?: string } }[] };
      const text = payload.choices?.[0]?.message?.content;
      if (!text) return json({ operationId: mission.operationId, status: 'failed', summary: 'Mistral returned no text.', output: {} });
      return json({ operationId: mission.operationId, status: 'completed', summary: 'Game text generated.', output: { text } });
    } catch (error) {
      return json({ operationId: mission.operationId, status: 'failed', summary: error instanceof Error ? error.message : 'Generation failed.', output: {} }, 502);
    }
  },
};