export const dynamic = 'force-dynamic';

import { getUserId } from '../../lib/org.js';

export async function POST(request) {
  try {
    const userId = getUserId(request);
    const orgId = request.headers.get('x-org-id') || '';

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized', debug: { orgId, userId } }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = process.env.OPENCLAW_API_URL;
    const token = process.env.OPENCLAW_API_TOKEN;

    if (!url || !token) {
      return new Response(JSON.stringify({
        error: 'OpenClaw not configured',
        debug: { hasUrl: !!url, hasToken: !!token },
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const message = body.message;

    const openclawRes = await fetch(`${url}/v1/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: 'openclaw',
        input: message,
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
    console.error('[chat] Error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
