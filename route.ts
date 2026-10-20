import { NextResponse } from 'next/server';
import { requireUser, isDeveloper } from '@/lib/firebase-admin';
import { panels, ptero } from '@/lib/ptero';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    if (!isDeveloper(user.uid)) return NextResponse.json({ error: 'Akses developer ditolak' }, { status: 403 });
    const result = await Promise.all(panels().map(async p => {
      try { const r = await ptero(p, '/nodes'); return { name: p.name, online: true, nodes: r.data?.length ?? 0 }; }
      catch { return { name: p.name, online: false, nodes: 0 }; }
    }));
    return NextResponse.json({ panels: result });
  } catch { return NextResponse.json({ error: 'Autentikasi diperlukan' }, { status: 401 }); }
}
