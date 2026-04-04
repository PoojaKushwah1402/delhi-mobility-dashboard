export default async function handler(req, res) {
  try {
    const apiKey = process.env.VITE_OTD_API_KEY || req.query.key;
    if (!apiKey) {
      return res.status(400).json({ error: 'No API key provided' });
    }

    const response = await fetch(
      `https://otd.delhi.gov.in/api/realtime/VehiclePositions.pb?key=${apiKey}`
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Upstream API error' });
    }

    const buffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'application/x-protobuf');
    res.setHeader('Cache-Control', 'public, max-age=15');
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bus data' });
  }
}
