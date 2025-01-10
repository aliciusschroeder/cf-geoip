export function extractCookies(cookies: string): { [key: string]: string };
export function extractCookies<K extends readonly string[]>(
  cookies: string,
  keys: K
): {
  [P in K[number]]: string;
};
/**
 * Extracts cookies from a cookie string and returns an object containing the key-value pairs.
 *
 * @param cookies - The cookie string to extract from, typically from the `document.cookie`.
 * @param keys - An optional array of keys to filter the extracted cookies. If not provided, all cookies are extracted.
 * @returns An object containing the extracted key-value pairs of cookies.
 */
export function extractCookies(cookies: string, keys?: readonly string[]): { [key: string]: string } {
  const result: { [key: string]: string } = {};
  const cookiePairs = cookies.split(';');
  for (const cookie of cookiePairs) {
    const [key, value] = cookie.trim().split('=');
    if (!keys || keys.includes(key)) {
      if (key) {
        result[key] = value ?? '';
      }
    }
  }
  return result;
}
