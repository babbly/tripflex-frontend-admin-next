import { NextRequest } from 'next/server';

export async function apiFetch(
  input: string | Request,
  init?: RequestInit,
): Promise<Response> {
  let url = input;

  if (typeof input === 'string' && input.startsWith('/api/')) {
    url =
      process.env.NEXT_PUBLIC_BASE_PATH +
      (input.startsWith('/') ? input : '/' + input);
  }

  return fetch(url as RequestInfo, init);
}

export function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
