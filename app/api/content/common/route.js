import { getCommonContent, contentErrorMessage, contentErrorStatus } from '../../_lib/content';
import { jsonError, jsonOk } from '../../_lib/http';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  const lang = String(new URL(request.url).searchParams.get('lang') || 'en').toLowerCase();

  try {
    const data = await getCommonContent(lang);
    return jsonOk(
      {
        success: true,
        lang,
        page: 'common',
        data,
      },
      { noCache: true }
    );
  } catch (error) {
    return jsonError(
      contentErrorStatus(error),
      contentErrorMessage(error, 'Failed to load common content'),
      { noCache: true }
    );
  }
}
