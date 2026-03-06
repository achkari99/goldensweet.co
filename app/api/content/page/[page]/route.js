import { getPageContent, contentErrorMessage, contentErrorStatus } from '../../../_lib/content';
import { jsonError, jsonOk } from '../../../_lib/http';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request, { params }) {
  const lang = String(new URL(request.url).searchParams.get('lang') || 'en').toLowerCase();
  const page = String(params?.page || '').toLowerCase();

  try {
    const data = await getPageContent(lang, page);
    return jsonOk(
      {
        success: true,
        lang,
        page,
        data,
      },
      { noCache: true }
    );
  } catch (error) {
    return jsonError(
      contentErrorStatus(error),
      contentErrorMessage(error, 'Failed to load page content'),
      { noCache: true }
    );
  }
}

