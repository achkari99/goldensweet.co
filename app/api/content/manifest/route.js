import { getContentManifest } from '../../_lib/content';
import { jsonError, jsonOk } from '../../_lib/http';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getContentManifest();
    return jsonOk({ success: true, data }, { noCache: true });
  } catch (error) {
    return jsonError(500, error?.message || 'Failed to load content manifest', { noCache: true });
  }
}

