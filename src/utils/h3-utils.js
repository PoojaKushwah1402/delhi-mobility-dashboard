import { latLngToCell, cellToBoundary, getResolution } from 'h3-js';

const H3_RESOLUTION = 8;

// Delhi NCR bounding box
const BOUNDS = {
  swLat: 28.40, swLng: 76.85,
  neLat: 28.85, neLng: 77.55
};

const STEP = 0.004; // ~440m steps to generate hex centers

export function computeHexagons(metroStations, busStops, busFrequency) {
  // Build lookup maps
  const freqMap = {};
  for (const f of busFrequency) {
    freqMap[f.stop_id] = f;
  }

  // Generate all H3 cells covering Delhi NCR
  const cellData = {};

  // Index metro stations into cells
  for (const station of metroStations) {
    const cell = latLngToCell(station.lat, station.lng, H3_RESOLUTION);
    if (!cellData[cell]) cellData[cell] = { metro: [], busStops: [], busRoutes: new Set(), totalTrips: 0 };
    cellData[cell].metro.push(station);
  }

  // Index bus stops into cells
  for (const stop of busStops) {
    const cell = latLngToCell(stop.lat, stop.lng, H3_RESOLUTION);
    if (!cellData[cell]) cellData[cell] = { metro: [], busStops: [], busRoutes: new Set(), totalTrips: 0 };
    cellData[cell].busStops.push(stop);

    const freq = freqMap[stop.stop_id];
    if (freq) {
      cellData[cell].totalTrips += freq.trips_per_day;
      for (let i = 0; i < freq.routes_count; i++) {
        cellData[cell].busRoutes.add(`${stop.stop_id}_r${i}`);
      }
    }
  }

  // Also scan the bounding box to fill in some area around metro stations
  // (already covered by indexing stops into cells)

  // Compute scores
  const hexagons = [];
  for (const [cellId, data] of Object.entries(cellData)) {
    const metroCount = data.metro.length;
    const busStopCount = data.busStops.length;
    const busRouteCount = data.busRoutes.size;
    const avgFreq = busStopCount > 0 ? data.totalTrips / busStopCount : 0;

    let score = 0;
    score += Math.min(metroCount * 30, 30);
    score += Math.min(busStopCount * 3, 25);
    score += Math.min(busRouteCount * 3, 25);
    score += Math.min(avgFreq * 0.5, 20);
    score = Math.round(score);

    const boundary = cellToBoundary(cellId);
    const isGapZone = metroCount > 0 && score < 40;

    hexagons.push({
      id: cellId,
      boundary, // [[lat, lng], ...]
      score,
      metroCount,
      busStopCount,
      busRouteCount,
      avgFrequency: Math.round(avgFreq),
      isGapZone,
      metroStations: data.metro,
      busStops: data.busStops
    });
  }

  return hexagons;
}

export function getScoreColor(score) {
  if (score <= 20) return '#ef4444';
  if (score <= 40) return '#f97316';
  if (score <= 60) return '#eab308';
  if (score <= 80) return '#22c55e';
  return '#06b6d4';
}

export function getScoreBracket(score) {
  if (score <= 20) return 'Critical';
  if (score <= 40) return 'Poor';
  if (score <= 60) return 'Moderate';
  if (score <= 80) return 'Good';
  return 'Excellent';
}
