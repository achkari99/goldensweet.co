import { readSingleton, upsertSingleton } from '../_lib/data';
import { jsonError, jsonOk } from '../_lib/http';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const data = await readSingleton('settings');
    return jsonOk({ success: true, data });
  } catch (error) {
    return jsonError(500, error?.message || 'Failed to load settings');
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const data = await upsertSingleton('settings', body || {});
    return jsonOk({ success: true, data });
  } catch (error) {
    return jsonError(500, error?.message || 'Failed to update settings');
  }
}

