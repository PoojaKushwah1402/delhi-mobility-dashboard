import GtfsRealtimeBindings from 'gtfs-realtime-bindings';

export default async function handler(req, res) {
  // Allow CORS for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    const apiKey = process.env.VITE_OTD_API_KEY || process.env.OTD_API_KEY || req.query.key;
    if (!apiKey) {
      return res.status(400).json({ error: 'No API key provided', vehicles: [] });
    }

    const response = await fetch(
      `https://otd.delhi.gov.in/api/realtime/VehiclePositions.pb?key=${apiKey}`
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Upstream API returned ${response.status}`,
        vehicles: [],
      });
    }

    const buffer = await response.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(buffer)
    );

    const vehicles = [];
    for (const entity of feed.entity) {
      if (entity.vehicle && entity.vehicle.position) {
        const v = entity.vehicle;
        vehicles.push({
          vehicle_id: v.vehicle?.id || entity.id || null,
          route_id: v.trip?.routeId || null,
          lat: v.position.latitude,
          lng: v.position.longitude,
          bearing: v.position.bearing || null,
          speed: v.position.speed || null,
          timestamp: v.timestamp
            ? Number(v.timestamp)
            : feed.header?.timestamp
              ? Number(feed.header.timestamp)
              : null,
        });
      }
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=10');
    return res.status(200).json({
      count: vehicles.length,
      timestamp: feed.header?.timestamp ? Number(feed.header.timestamp) : Date.now(),
      vehicles,
    });
  } catch (err) {
    console.error('[api/buses] Error:', err.message);
    return res.status(500).json({
      error: 'Failed to fetch or parse bus data',
      details: err.message,
      vehicles: [],
    });
  }
}
