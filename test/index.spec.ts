// test/worker.spec.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { LOCAL_ORIGIN } from '../src/config';
import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import worker from '../src/index';

// We'll need typed CF properties:
interface CfMock {
  latitude?: string;
  longitude?: string;
  [key: string]: string | undefined;
}

declare module "cloudflare:test" {
  interface ProvidedEnv extends Env {}
}

function makeRequest(
  url: string, 
  options: RequestInit & { cf?: CfMock } = {}
): Request<unknown, IncomingRequestCfProperties<unknown>> {
  return new Request(url, options as RequestInit) as unknown as Request<unknown, IncomingRequestCfProperties<unknown>>;
}

describe('Worker fetch handler', () => {
  beforeAll(() => {
    // You can mock the ENV var here if needed
    env.ENVIRONMENT = 'dev'; // so that LOCAL_TEST = true
  });

  it('should respond with fresh lat/lon/country when no cookies are present', async () => {
    const request = makeRequest('https://example.com', {
      cf: { latitude: '52.5200', longitude: '13.4050' },
      headers: {
        // No cookies
      },
    });
    const ctx = createExecutionContext();

    const response = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(200);
    const body = await response.json<{
      lat: string;
      lon: string;
      country: string;
      cached: boolean;
    }>();

    expect(body.lat).toBe('52.52');
    expect(body.lon).toBe('13.405');
    expect(body.country).toBe('Germany'); 
    expect(body.cached).toBe(false);

    // Check that cookies were set
    const setCookieHeaders = response.headers.get('Set-Cookie');
    expect(setCookieHeaders).toContain('coordinates=');
    expect(setCookieHeaders).toContain('country=');
  });

  it('should respond with cached data when valid cookies exist', async () => {
    const request = makeRequest('https://example.com', {
      headers: {
        Cookie: 'coordinates={"lat":"52.52","lon":"13.405"}; country=Germany',
      },
      cf: { latitude: '9999', longitude: '9999' }, 
      // CF data won't matter if cookies exist
    });
    const ctx = createExecutionContext();

    const response = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(200);
    const body = await response.json<{
      lat: string;
      lon: string;
      country: string;
      cached: boolean;
    }>();

    // The data comes from cookies, so it should match the above cookie.
    expect(body.lat).toBe('52.52');
    expect(body.lon).toBe('13.405');
    expect(body.country).toBe('Germany');
    expect(body.cached).toBe(true);

    // Because cached = true, we expect no new Set-Cookie
    const setCookieHeaders = response.headers.get('Set-Cookie') || '';
    expect(setCookieHeaders).toBe('');
  });

  it('should throw an error if CF location is missing', async () => {
    // No lat/lon in CF
    const request = makeRequest('https://example.com', {
      cf: {},
    });
    const ctx = createExecutionContext();

    let error: Error | null = null;
    try {
      await worker.fetch(request, env, ctx);
      await waitOnExecutionContext(ctx);
    } catch (e) {
      error = e as Error;
    }
    expect(error).not.toBeNull();
    expect(error?.message).toContain('Location not available');
  });

  it('should check CORS headers in response', async () => {
    const request = makeRequest('https://example.com', {
      cf: { latitude: '52.5200', longitude: '13.4050' },
    });
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET');
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(LOCAL_ORIGIN); // Because ENVIRONMENT=dev
  });
});
