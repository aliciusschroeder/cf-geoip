// test/extractCookies.spec.ts
import { describe, it, expect } from 'vitest';
import { extractCookies } from '../src/utils/extractCookies';

describe('extractCookies utility', () => {
	it('returns an empty object if no cookies exist', () => {
		const result = extractCookies('');
		expect(result).toEqual({});
	});

	it('extracts all cookies if no keys are specified', () => {
		const cookieString = 'foo=bar; hello=world; coordinates=%7B%22lat%22%3A%2210%22%7D';
		const result = extractCookies(cookieString);
		expect(result).toEqual({
			foo: 'bar',
			hello: 'world',
			coordinates: '%7B%22lat%22%3A%2210%22%7D',
		});
	});

	it('extracts only the specified cookies if keys are given', () => {
		const cookieString = 'foo=bar; hello=world; country=Germany; coordinates=10%2C20';
		const result = extractCookies(cookieString, ['country', 'coordinates'] as const);
		expect(result).toEqual({
			country: 'Germany',
			coordinates: '10%2C20',
		});
	});

	it('handles cookies with no explicit value', () => {
		const cookieString = 'empty=; key=value';
		const result = extractCookies(cookieString);
		expect(result).toEqual({ empty: '', key: 'value' });
	});
});
