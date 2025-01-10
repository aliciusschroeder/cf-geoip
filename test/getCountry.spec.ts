// test/getCountry.spec.ts
import { describe, it, expect } from 'vitest';
import { findCountry } from '../src/utils/getCountry';

describe('findCountry utility', () => {
	it('returns "Germany" for coordinates in Germany', () => {
		// Example coordinate in Berlin
		const result = findCountry(52.52, 13.405);
		expect(result).toBe('Germany');
	});

	it('returns null for coordinates outside the known polygons', () => {
		// Example coordinate in London
		const result = findCountry(51.5074, -0.1278);
		expect(result).toBeNull();
	});

	it('returns null for edge-case lat/lon that is not in the polygon', () => {
		// Example coordinate in the ocean
		const result = findCountry(0, 0);
		expect(result).toBeNull();
	});
});
