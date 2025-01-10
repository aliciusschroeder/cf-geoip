import { IncomingRequestCfProperties } from '@cloudflare/workers-types';

/**
 * Retrieves the geographical coordinates (latitude and longitude) from the incoming request.
 *
 * @param request - The incoming request object containing Cloudflare properties.
 * @returns An object containing the latitude and longitude as numbers.
 * @throws Will throw an error if the location information is not available in the request.
 */
export function getCoordinates(request: Request<unknown, IncomingRequestCfProperties<unknown>>): { lat: number; lon: number; } {
	const lat = request.cf?.latitude;
	const lon = request.cf?.longitude;
	if (!lat || !lon) {
		throw new Error('Location not available');
	}
	return { lat: parseFloat(lat), lon: parseFloat(lon) };
}
