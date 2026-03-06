import { createItem, readList } from '../_lib/data';
import { jsonError, jsonOk } from '../_lib/http';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const data = await readList('products');
    return jsonOk({ success: true, data });
  } catch (error) {
    return jsonError(500, error?.message || 'Failed to load products');
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const data = await createItem('products', body || {});
    return jsonOk({ success: true, data }, { status: 201 });
  } catch (error) {
    return jsonError(500, error?.message || 'Failed to create product');
  }
}

