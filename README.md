# CF GeoIP Detection & Country Polygon Matching

A **Cloudflare Workers** project that demonstrates how to leverage the inherent `request.cf` (Cloudflare-provided) request properties for near real-time user geolocation—all **for free**. This repository showcases:

1. **Accurate Geo-IP** via `request.cf` properties
2. **Polygon-based Country Detection** using [Turf.js](https://turfjs.org/) (`boolean-point-in-polygon`)
3. **Cookie Caching** (store lat/lon + country in a user’s browser)
4. **CORS and Cookie Handling** for frictionless cross-subdomain requests

> **Note**: Additional polygons for other countries and U.S. states are included as text files in `src/data`. Feel free to import them into [`src/data/countries.ts`](./src/data/countries.ts) if you want to detect more locations.

---

## Features

- **GeoIP via `request.cf`:** Cloudflare provides latitude and longitude by default. This means you don’t need a separate paid IP geo-location service.
- **Country Detection:** Uses [`@turf/boolean-point-in-polygon`](https://github.com/Turfjs/turf/blob/master/packages/turf-boolean-point-in-polygon) to check whether the user’s coordinates fall within a country’s polygon.
- **Cookie Storage / Caching:** Once a user’s country is detected, store it in cookies to skip repeated polygon checks on subsequent requests.
- **CORS-Ready Endpoints:** Fully configured Access-Control headers for easier integration from any subdomain mapped to the worker.
- **Typed with TypeScript** for a reliable developer experience.
- **Tested with Vitest** ensuring that major methods (cookie extraction, coordinates reading, country detection, and the main fetch handler) are covered.

---

## Getting Started Locally

1. **Clone** this repository:
   ```bash
   git clone https://github.com/aliciusschroeder/cf-geoip.git
   ```
2. **Install** dependencies (via [pnpm](https://pnpm.io/)):
   ```bash
   pnpm install
   ```
3. **Start** the dev server:
   ```bash
   pnpm run dev
   ```
   This runs `wrangler dev`, launching your Cloudflare Worker in development mode.

---

## Deployment

Deploying the worker is straightforward:

```bash
pnpm run deploy
```

> Make sure you have [Wrangler](https://developers.cloudflare.com/workers/wrangler) configured with your Cloudflare account before deploying.

---

## Testing

This project has tests covering the major functionality:

```bash
pnpm run test
```

- **Unit Tests** cover cookie extraction, coordinate retrieval, country detection, and the main fetch handler’s logic.

---

## Project Structure

```
.
├── src
│   ├── data
│   │   ├── countries.ts          # Example implementation with Germanys polygon
│   │   ├── countries.txt         # Additional polygons for other countries
│   │   └── us_states.txt         # Polygons for U.S. states
│   ├── utils
│   │   ├── extractCookies.ts     # Cookie parsing utility
│   │   ├── getCoordinates.ts     # Pulls lat/lon from request.cf
│   │   └── getCountry.ts         # Runs polygon check via Turf
│   ├── config.ts                 # Origin and environment domain config
│   └── index.ts                  # Cloudflare Worker’s main fetch handler
├── test                          # Vitest test suites
│   ├── *.spec.ts
│   └── ...
├── package.json
├── tsconfig.json
└── wrangler.toml
└── ...
```

### Please Note

1. **`ENVIRONMENT` Variable:**  
   We rely on an `ENVIRONMENT` var (`dev` vs. production) to toggle between local and production origins for CORS and cookie `domain` settings.
2. **Cookie Domain Logic:**
   - If `ENVIRONMENT` is set to `dev`, cookies do **not** receive a `domain` attribute.
   - If on production, we add `.example.com` (configurable) to the cookie domain.
3. **Handling Missing CF Data:**
   - If `request.cf` doesn’t contain `latitude` or `longitude`, the code **throws an error**. This is by design so you notice Cloudflare issues or usage outside a Cloudflare environment.
4. **Add More Polygons at Will:**
   - Expand the coverage by appending polygons to [`countries.ts`](./src/data/countries.ts). The text files in `src/data` can assist if you need more detail or additional regions.

---

## Usage (In Production)

Once deployed and mapped to a route (say `https://geo.example.com/`):

- **Call** it from your browser or any client:
  ```js
  fetch('https://geo.example.com', { credentials: 'include' })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      // => { lat: "52.52", lon: "13.405", country: "Germany", cached: false }
    });
  ```
- **Cookies** get set in the user’s browser, e.g. `coordinates` and `country`.
- **Subsequent requests** from the same browser skip the polygon check and return the cached location data instantly (`cached: true`).

---

## Contributing

Feel free to open issues or submit pull requests. Any ideas, remarks, you’re welcome to contribute them!
