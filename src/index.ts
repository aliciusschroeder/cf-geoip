import { LOCAL_ORIGIN, PROD_DOMAIN, PROD_ORIGIN } from './config';
import { extractCookies } from './utils/extractCookies';
import { getCoordinates } from './utils/getCoordinates';
import { findCountry } from './utils/getCountry';

const ALLOWED_ORIGIN = (LOCAL_TEST: boolean) => (LOCAL_TEST ? LOCAL_ORIGIN : PROD_ORIGIN);

type WorkerResponse = {
	lat: string;
	lon: string;
	country: string;
	cached: boolean;
};

/**
 * Generates an HTTP response with appropriate headers and optional cookies.
 *
 * @param {boolean} [LOCAL_TEST=false] - Indicates if the local test environment is being used.
 * @param {WorkerResponse} workerResponse - The response data from the worker.
 * @param {boolean} [setCookies=true] - Determines whether to set cookies in the response headers.
 * @returns {Response} - The HTTP response object with JSON body and headers.
 */
function response(LOCAL_TEST: boolean = false, workerResponse: WorkerResponse, setCookies: boolean = true): Response {
	const headers = new Headers();
	headers.append('Content-Type', 'application/json');
	headers.append('Access-Control-Allow-Methods', 'GET');
	headers.append('Access-Control-Allow-Headers', 'Content-Type');
	headers.append('Access-Control-Allow-Credentials', 'true');
	headers.append('Access-Control-Allow-Origin', ALLOWED_ORIGIN(LOCAL_TEST));

	if (setCookies) {
		const maxAge = 60 * 60 * 24; // 1 day
		const cookieSettings = `Path=/; Max-Age=${maxAge}; SameSite=Lax${!LOCAL_TEST ? `; domain=.${PROD_DOMAIN}` : ''}`;
		headers.append('Set-Cookie', `coordinates=${JSON.stringify({ lat: workerResponse.lat, lon: workerResponse.lon })}; ${cookieSettings}`);
		headers.append('Set-Cookie', `country=${workerResponse.country}; ${cookieSettings}`);
	}
	return new Response(JSON.stringify(workerResponse), {
		status: 200,
		statusText: 'OK',
		headers,
	});
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const cookies = request.headers.get('Cookie');
		// If the next line causes an error, make sure to check worker-configuration.d.ts
		const LOCAL_TEST = env.ENVIRONMENT === 'dev';
		if (cookies) {
			const { coordinates, country } = extractCookies(cookies, ['coordinates', 'country']);
			if (coordinates && country) {
				const { lat, lon } = JSON.parse(coordinates);
				return response(LOCAL_TEST, { lat, lon, country, cached: true }, false);
			}
		}
		const { lat, lon } = getCoordinates(request);

		const country = findCountry(lat, lon) ?? 'null';
		return response(LOCAL_TEST, { lat: lat.toString(), lon: lon.toString(), country, cached: false });
	},
} satisfies ExportedHandler<Env>;
