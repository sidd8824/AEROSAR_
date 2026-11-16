# AeroSAR

AeroSAR is an interactive aircraft search planning prototype. Enter an aircraft’s last known position and contact time, then model its nominal track and an estimated search area using speed, heading, endurance, wind, and position uncertainty.

**For training and demonstration only.** The model does not generate search probabilities or account for terrain, changes in course, or aircraft-specific drift. It is unsuitable for emergency response.

## Run locally

Install Node.js and npm, then run:

```sh
git clone https://github.com/sidd8824/AEROSAR_.git
cd 'AEROSAR_/project 2'
npm ci
npm run dev
```

Open the URL printed by the dev server. The workspace opens with a sample mission when account access is unconfigured. Use **New mission** to start from blank inputs.

## Plan a search

1. Enter latitude and longitude or select the last known position on the map. Enter the last contact time in UTC.
2. Add heading, speed, remaining endurance, wind, and position uncertainty. Select **Calculate search area** to update the estimate and fit the map to it.
3. Use **Search analysis** to compare uncertainty or flight and wind assumptions against the calculated mission.
4. Save the mission to history, export its geometry as GeoJSON, or print the report from **Mission intelligence**.

## Accounts and mission history

To enable email sign-in, copy `.env.example` to `.env.local` inside `project 2` and fill in the Supabase project URL and public anon key. Enable email authentication in that project. The app saves signed-in mission history in the current browser. Demo history lasts for the current session.

## Map layers

The vector street layer uses [OpenFreeMap](https://openfreemap.org/quick_start/) with MapLibre GL. The layer picker also offers Esri satellite imagery and a raster OpenStreetMap layer for devices without WebGL or when vector tiles fail. Provider credits appear in the map.

## Development

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run typecheck` | Check TypeScript |
| `npm run build` | Build the deployable site in `dist/` |
| `npm run preview` | Serve the production build locally |

Mission input, map, analysis, and history views live in `project 2/src/components/`. The search model, coordinate calculations, validation, storage, and exports live in `project 2/src/lib/`.
