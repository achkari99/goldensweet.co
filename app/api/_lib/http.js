import { NextResponse } from 'next/server';

const CONTENT_NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
  'Surrogate-Control': 'no-store',
};

export function jsonOk(payload, { noCache = false, status = 200 } = {}) {
  return NextResponse.json(payload, {
    status,
    headers: noCache ? CONTENT_NO_CACHE_HEADERS : undefined,
  });
}

export function jsonError(status, error, { noCache = false } = {}) {
  return NextResponse.json(
    { success: false, error },
    {
      status,
      headers: noCache ? CONTENT_NO_CACHE_HEADERS : undefined,
    }
  );
}
