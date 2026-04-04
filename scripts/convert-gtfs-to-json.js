import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'src', 'data');

function parseCSV(filePath) {
  const raw = readFileSync(filePath, 'utf-8');
  const lines = raw.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(',').map(v => v.trim());
    if (vals.length < headers.length) continue;
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = vals[j];
    }
    rows.push(row);
  }
  return rows;
}

// ---- Metro Stations ----
console.log('Processing metro stations...');
const metroStops = parseCSV(join(root, 'data/dmrc/stops.txt'));
const metroRoutes = parseCSV(join(root, 'data/dmrc/routes.txt'));

// Build line mapping from route names
const METRO_LINE_COLORS = {
  'Red': '#EE1C25', 'Yellow': '#FFCB05', 'Blue': '#0053A5',
  'Blue Branch': '#0053A5', 'Green': '#00A650', 'Green Branch': '#00A650',
  'Violet': '#8B5FA0', 'Pink': '#F186AB', 'Magenta': '#B9539F',
  'Airport Express': '#F57F17', 'Grey': '#9E9E9E', 'Rapid Metro': '#FFA500',
  'Aqua': '#00BCD4', 'Orange': '#F57F17'
};

// Map route_id to line name using the route_long_name prefix (e.g. "RED_...", "GRAY_...", "ORANGE/AIRPORT_...")
const routeLineMap = {};
for (const r of metroRoutes) {
  const longName = (r.route_long_name || '').toUpperCase();
  if (longName.startsWith('RED_')) routeLineMap[r.route_id] = 'Red';
  else if (longName.startsWith('YELLOW_')) routeLineMap[r.route_id] = 'Yellow';
  else if (longName.startsWith('BLUE_')) routeLineMap[r.route_id] = 'Blue';
  else if (longName.startsWith('GREEN_')) routeLineMap[r.route_id] = 'Green';
  else if (longName.startsWith('VIOLET_')) routeLineMap[r.route_id] = 'Violet';
  else if (longName.startsWith('PINK_')) routeLineMap[r.route_id] = 'Pink';
  else if (longName.startsWith('MAGENTA_')) routeLineMap[r.route_id] = 'Magenta';
  else if (longName.startsWith('ORANGE') || longName.startsWith('AIRPORT')) routeLineMap[r.route_id] = 'Airport Express';
  else if (longName.startsWith('GRAY_') || longName.startsWith('GREY_')) routeLineMap[r.route_id] = 'Grey';
  else if (longName.startsWith('RAPID_')) routeLineMap[r.route_id] = 'Rapid Metro';
  else if (longName.startsWith('AQUA_')) routeLineMap[r.route_id] = 'Aqua';
}

// Build stop_id → route_ids from trips + stop_times
const metroTrips = parseCSV(join(root, 'data/dmrc/trips.txt'));
const tripRouteMap = {};
for (const t of metroTrips) {
  tripRouteMap[t.trip_id] = t.route_id;
}

console.log('Processing metro stop_times (this may take a moment)...');
const metroStopTimes = parseCSV(join(root, 'data/dmrc/stop_times.txt'));
const stopRoutes = {}; // stop_id → Set of route_ids
for (const st of metroStopTimes) {
  const routeId = tripRouteMap[st.trip_id];
  if (!routeId) continue;
  if (!stopRoutes[st.stop_id]) stopRoutes[st.stop_id] = new Set();
  stopRoutes[st.stop_id].add(routeId);
}

const metroStations = metroStops.map(s => {
  const routes = stopRoutes[s.stop_id] || new Set();
  const lines = [...new Set([...routes].map(rid => routeLineMap[rid]).filter(Boolean))];
  return {
    stop_id: s.stop_id,
    stop_name: s.stop_name,
    lat: parseFloat(s.stop_lat),
    lng: parseFloat(s.stop_lon),
    lines,
    color: lines.length > 0 ? METRO_LINE_COLORS[lines[0]] : '#9E9E9E'
  };
}).filter(s => !isNaN(s.lat) && !isNaN(s.lng));

writeFileSync(join(outDir, 'metro-stations.json'), JSON.stringify(metroStations));
console.log(`  → ${metroStations.length} metro stations`);

// ---- Bus Stops ----
console.log('Processing bus stops...');
const busStopsRaw = parseCSV(join(root, 'data/bus/stops.txt'));
const busStops = busStopsRaw.map(s => ({
  stop_id: s.stop_id,
  stop_name: s.stop_name,
  lat: parseFloat(s.stop_lat),
  lng: parseFloat(s.stop_lon)
})).filter(s => !isNaN(s.lat) && !isNaN(s.lng) && s.lat > 27 && s.lat < 30 && s.lng > 76 && s.lng < 78);

// Deduplicate bus stops by rounding coordinates to ~50m precision
const seen = new Set();
const dedupedBusStops = busStops.filter(s => {
  const key = `${s.lat.toFixed(4)},${s.lng.toFixed(4)}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

writeFileSync(join(outDir, 'bus-stops.json'), JSON.stringify(dedupedBusStops));
console.log(`  → ${dedupedBusStops.length} bus stops (deduped from ${busStops.length})`);

// ---- Bus Routes ----
console.log('Processing bus routes...');
const busRoutesRaw = parseCSV(join(root, 'data/bus/routes.txt'));
const busRoutes = busRoutesRaw.map(r => ({
  route_id: r.route_id,
  name: r.route_short_name || r.route_long_name || r.route_id
}));

writeFileSync(join(outDir, 'bus-routes.json'), JSON.stringify(busRoutes));
console.log(`  → ${busRoutes.length} bus routes`);

// ---- Bus Frequency (aggregate from stop_times) ----
console.log('Processing bus stop_times for frequency (3.7M rows, patience)...');

// Read line by line for efficiency instead of parseCSV
const busStopTimesRaw = readFileSync(join(root, 'data/bus/stop_times.txt'), 'utf-8');
const stLines = busStopTimesRaw.split('\n');
const stHeaders = stLines[0].split(',').map(h => h.trim());
const tripIdIdx = stHeaders.indexOf('trip_id');
const stopIdIdx = stHeaders.indexOf('stop_id');

// Build trip_id → route_id from bus trips
const busTrips = parseCSV(join(root, 'data/bus/trips.txt'));
const busTripRouteMap = {};
for (const t of busTrips) {
  busTripRouteMap[t.trip_id] = t.route_id;
}

// Count unique trips per stop AND unique routes per stop
const stopTripCount = {};  // stop_id → count of unique trips
const stopRouteSet = {};   // stop_id → Set of route_ids

for (let i = 1; i < stLines.length; i++) {
  const line = stLines[i];
  if (!line) continue;
  const parts = line.split(',');
  const tripId = parts[tripIdIdx]?.trim();
  const stopId = parts[stopIdIdx]?.trim();
  if (!tripId || !stopId) continue;

  if (!stopTripCount[stopId]) stopTripCount[stopId] = 0;
  stopTripCount[stopId]++;

  const routeId = busTripRouteMap[tripId];
  if (routeId) {
    if (!stopRouteSet[stopId]) stopRouteSet[stopId] = new Set();
    stopRouteSet[stopId].add(routeId);
  }
}

// Build frequency data for each deduped bus stop
const busFrequency = dedupedBusStops.map(s => {
  const trips = stopTripCount[s.stop_id] || 0;
  const routes = stopRouteSet[s.stop_id] ? stopRouteSet[s.stop_id].size : 0;
  return {
    stop_id: s.stop_id,
    routes_count: routes,
    trips_per_day: trips
  };
}).filter(f => f.trips_per_day > 0 || f.routes_count > 0);

writeFileSync(join(outDir, 'bus-frequency.json'), JSON.stringify(busFrequency));
console.log(`  → ${busFrequency.length} stops with frequency data`);

console.log('\nDone! JSON files written to src/data/');
