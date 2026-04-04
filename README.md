# Delhi Mobility Intelligence Dashboard

An AI-powered, interactive dashboard that visualizes Delhi NCR's public transit network, identifies last-mile connectivity gaps around metro stations, and helps plan e-rickshaw/EV deployment using real government data.

Built by **Macro Rides** — an EV ride-hailing platform focused on hyperlocal e-rickshaw mobility in Delhi NCR.

## What It Shows

- **H3 Hexagonal Zones** — Delhi NCR is divided into ~460m hexagonal zones, each scored 0-100 on transit connectivity based on metro presence, bus stop density, route diversity, and bus frequency.
- **262 Metro Stations** — All DMRC stations plotted with correct line colors (Red, Yellow, Blue, Green, Violet, Pink, Magenta, Airport Express, Grey, Aqua, Rapid Metro). Click any station to see nearby bus stops, zone score, and line details.
- **6,636 Bus Stops** — Every DTC/DIMTS bus stop with route count and daily trip frequency. Click to see stop details.
- **63 Last-Mile Gap Zones** — Zones where a metro station exists but feeder bus connectivity scores below 40/100. These are the areas where e-rickshaw deployment would have the highest impact.
- **350 Simulated Buses** — Moving vehicle icons across Delhi's major corridors with smooth interpolation. Click any bus to see its route.
- **AI Chat** — Ask questions about Delhi's transit network in English or Hinglish. Powered by Claude API with real zone data injected as context.

## How to Use

1. **Explore the map** — Pan and zoom around Delhi NCR. Colored hexagons show connectivity quality (red = poor, green = good, cyan = excellent).
2. **Click a hexagon** — Opens the Zone Detail panel on the right showing connectivity score breakdown, metro stations, bus stops, and route count.
3. **Click a metro station** — Shows a popup with line info, nearby bus stops within 500m, and zone score. Click "View Zone Details" to open the full zone panel.
4. **Toggle layers** — Use the left sidebar to show/hide H3 zones, metro stations, bus stops, and live buses. Toggle "Gap Zones Only" to isolate the problem areas.
5. **AI Chat** — Click "AI Chat" in the top-right. Ask things like "Sabse zyada problem kahan hai?" or "Which zones need e-rickshaws near Blue Line?" The AI responds with real data points.

## Data Sources

All data is sourced from **Delhi Open Transit Data** ([otd.delhi.gov.in](https://otd.delhi.gov.in)):

| Dataset | Records | Format |
|---------|---------|--------|
| DMRC Metro Stations | 262 stations | GTFS `stops.txt` |
| DMRC Metro Routes | 36 routes across 11 lines | GTFS `routes.txt` |
| Bus Stops | 10,559 raw / 6,636 deduplicated | GTFS `stops.txt` |
| Bus Routes | 2,403 routes | GTFS `routes.txt` |
| Bus Stop Times | 3.7M records (pre-aggregated to per-stop frequency) | GTFS `stop_times.txt` |

## Connectivity Scoring

Each H3 hexagon (resolution 8, ~460m edge) is scored 0-100:

| Factor | Max Points |
|--------|-----------|
| Metro station present in zone | 30 |
| Bus stop density (3 pts per stop) | 25 |
| Route diversity (3 pts per route) | 25 |
| Bus frequency (0.5 pts per trip/day) | 20 |

A zone with a metro station but score < 40 is flagged as a **Last-Mile Gap Zone**.

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Download GTFS data (requires internet)
bash scripts/fetch-data.sh

# 3. Convert GTFS to JSON
node scripts/convert-gtfs-to-json.js

# 4. Set environment variables
cp .env.example .env
# Edit .env with your keys:
#   VITE_MAPBOX_TOKEN=pk.your_mapbox_token
#   VITE_OTD_API_KEY=your_otd_api_key
#   VITE_ANTHROPIC_API_KEY=sk-your_anthropic_key

# 5. Run dev server
npm run dev
```

## Tech Stack

- **React 19** + **Vite** — Frontend framework and build tool
- **Mapbox GL JS** — Interactive dark-themed map
- **H3-js** — Uber's hexagonal spatial indexing for zone analysis
- **Recharts** — Connectivity distribution bar chart
- **Tailwind CSS** — Utility styling
- **Claude API** — AI chat for transit analysis
- **Lucide React** — Icon library

## Deploy

Static site — deploy to Vercel, Netlify, or any static host:

```bash
npm run build   # outputs to dist/
```

For live bus tracking via the OTD real-time API, deploy the included Vercel serverless proxy at `api/buses.js`.

## License

MIT
