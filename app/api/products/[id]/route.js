import { deleteItem, readList, updateItem } from '../../_lib/data';
import { jsonError, jsonOk } from '../../_lib/http';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function findById(items, id) {
  const targetId = String(id || '');
  return items.find((item) => String(item.id) === targetId);
}

export async function GET(_request, { params }) {
  try {
    const id = String(params?.id || '').trim();
    if (!id) {
      return jsonError(400, 'Product id is required');
    }
    const products = await readList('products');
    const data = findById(products, id);
    if (!data) {
      return jsonError(404, 'Product not found');
    }
    return jsonOk({ success: true, data });
  } catch (error) {
    return jsonError(500, error?.message || 'Failed to load product');
  }
}

export async function PUT(request, { params }) {
  try {
    const id = String(params?.id || '').trim();
    if (!id) {
      return jsonError(400, 'Product id is required');
    }
    const body = await request.json();
    const data = await updateItem('products', id, body || {});
    return jsonOk({ success: true, data });
  } catch (error) {
    if (error?.message === 'Item not found') {
      return jsonError(404, 'Product not found');
    }
    return jsonError(500, error?.message || 'Failed to update product');
  }
}

export async function DELETE(_request, { params }) {
  try {
    const id = String(params?.id || '').trim();
    if (!id) {
      return jsonError(400, 'Product id is required');
    }
    await deleteItem('products', id);
    return jsonOk({ success: true, message: 'Product deleted' });
  } catch (error) {
    if (error?.message === 'Item not found') {
      return jsonError(404, 'Product not found');
    }
    return jsonError(500, error?.message || 'Failed to delete product');
  }
}

