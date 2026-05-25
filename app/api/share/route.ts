import { NextResponse } from 'next/server';
import { writeShare } from '@/lib/share-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 256 * 1024;

export async function POST(req: Request) {
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
    const token = await writeShare(payload);
    return NextResponse.json({ token }, { status: 201 });
  } catch (e) {
    console.error('[POST /api/share]', e);
    return NextResponse.json({ error: 'storage unavailable' }, { status: 503 });
  }
}
