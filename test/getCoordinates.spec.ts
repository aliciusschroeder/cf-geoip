// test/getCoordinates.spec.ts
import { describe, it, expect } from 'vitest';
import { getCoordinates } from '../src/utils/getCoordinates';

describe('getCoordinates utility', () => {
	it('should return lat/lon from request.cf properties', () => {
		const mockRequest = {
			cf: {
				latitude: '52.5200',
				longitude: '13.4050',
			},
		} as unknown as Request;

		const coords = getCoordinates(mockRequest as Request<unknown, IncomingRequestCfProperties<unknown>>);
		expect(coords.lat).toBe(52.52);
		expect(coords.lon).toBe(13.405);
	});

	it('should throw an error if no location data is available', () => {
		const mockRequest = {} as unknown as Request;
		expect(() => getCoordinates(mockRequest as Request<unknown, IncomingRequestCfProperties<unknown>>)).toThrow('Location not available');
	});
});
