export type PanelConfig = {
  name: string; url: string; apiKey: string; userId: number; locationId: number; nestId: number; eggId: number;
  allocationIds: number[]; dockerImage?: string; startup?: string;
  limits?: { memory?: number; swap?: number; disk?: number; io?: number; cpu?: number };
  featureLimits?: { databases?: number; allocations?: number; backups?: number };
};
export function panels(): PanelConfig[] {
  const parsed = JSON.parse(process.env.PTERO_PANELS_JSON || '[]');
  if (!Array.isArray(parsed)) throw new Error('PTERO_PANELS_JSON harus berupa array');
  return parsed.filter((p: PanelConfig) => p.name && p.url && p.apiKey && p.userId && p.locationId && p.nestId && p.eggId && Array.isArray(p.allocationIds) && p.allocationIds.length);
}
export async function ptero(panel: PanelConfig, path: string, init: RequestInit = {}) {
  const base = panel.url.replace(/\/$/, '');
  const res = await fetch(`${base}/api/application${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${panel.apiKey}`, Accept: 'Application/vnd.pterodactyl.v1+json', 'Content-Type': 'application/json', ...(init.headers || {}) },
    cache: 'no-store',
  });
  const text = await res.text();
  let data: any; try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok) throw new Error(`Pterodactyl ${panel.name} HTTP ${res.status}: ${JSON.stringify(data.errors || data)}`);
  return data;
}
