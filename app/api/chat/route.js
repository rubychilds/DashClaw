export const dynamic = 'force-dynamic';

import { getUserId } from '../../lib/org.js';

const OPENCLAW_API_URL = process.env.OPENCLAW_API_URL;
const OPENCLAW_API_TOKEN = process.env.OPENCLAW_API_TOKEN;

export async function POST(request) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!OPENCLAW_API_URL || !OPENCLAW_API_TOKEN) {
      return new Response(JSON.stringify({ error: 'OpenClaw not configured' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { message, conversationHistory } = await request.json();

    // Build input: conversation history + new message
    const input = [
      ...(conversationHistory || []),
      { role: 'user', content: message },
    ];

    const openclawRes = await fetch(`${OPENCLAW_API_URL}/v1/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENCLAW_API_TOKEN}`,
      },
      body: JSON.stringify({
        model: 'openclaw',
        input,
        stream: true,
        user: userId,
      }),
    });

    if (!openclawRes.ok) {
      const errText = await openclawRes.text();
      return new Response(JSON.stringify({ error: 'OpenClaw error', details: errText }), {
        status: openclawRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Stream SSE through to the client
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    (async () => {
      try {
        const reader = openclawRes.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writer.write(value);
        }
      } catch (e) {
        // Client disconnected or upstream error
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
