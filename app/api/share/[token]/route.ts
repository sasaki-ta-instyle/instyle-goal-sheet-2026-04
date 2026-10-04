import { NextResponse } from 'next/server';
import { updateShare } from '@/lib/share-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 256 * 1024;

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  try {
    const raw = await req.text();
    if (raw.length > MAX_BYTES) {
      return NextResponse.json({ error: 'payload too large' }, { status: 413 });
    }
    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'invalid json' }, { status: 400 });
    }
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
    }
    const result = await updateShare(token, payload);
    if (result === 'invalid-token') {
      return NextResponse.json({ error: 'invalid token' }, { status: 400 });
    }
    if (result === 'not-found') {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error('[PUT /api/share/[token]]', e);
    return NextResponse.json({ error: 'storage unavailable' }, { status: 503 });
  }
}
