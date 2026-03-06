import { createItem } from '../_lib/data';
import { jsonError, jsonOk } from '../_lib/http';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body?.name || '').trim();
    const email = String(body?.email || '').trim();
    const message = String(body?.message || '').trim();

    if (!name || !email || !message) {
      return jsonError(400, 'Name, email and message required');
    }

    const data = await createItem('contacts', {
      name,
      email,
      phone: String(body?.phone || '').trim(),
      subject: String(body?.subject || '').trim(),
      message,
      status: 'new',
      createdAt: new Date().toISOString(),
    });

    return jsonOk(
      {
        success: true,
        message: 'Message received',
        data,
      },
      { status: 201 }
    );
  } catch (error) {
    return jsonError(500, error?.message || 'Failed to submit contact form');
  }
}

