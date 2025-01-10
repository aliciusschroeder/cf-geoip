import { point, polygon, featureCollection } from '@turf/helpers';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { countries } from '../data/countries';

export function findCountry(lat: number, lng: number): string | null {
	const testPoint = point([lng, lat]); // Turf expects [lng, lat]

	for (const country of countries) {
		const countryPolygon = polygon(country.geometry.coordinates, country.properties);
		if (booleanPointInPolygon(testPoint, countryPolygon)) {
			return country.properties.name; // Return the country name
		}
	}

	return null; // Not found
}
