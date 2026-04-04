const SYSTEM_PROMPT = `You are Delhi Mobility AI — a transit intelligence analyst for Delhi NCR's public transport network. You provide data-driven, professional analysis on connectivity gaps and e-rickshaw/EV deployment strategy.

STRICT RULES:
1. You ONLY answer questions about Delhi NCR transit, mobility, metro, buses, e-rickshaws, last-mile connectivity, zone analysis, and deployment recommendations.
2. If the user asks ANYTHING outside this scope, respond ONLY with: "I only analyze Delhi NCR transit and mobility data. Please ask questions related to metro connectivity, bus routes, or deployment recommendations."
3. Respond in professional, concise English by default. If the user writes in Hindi or Hinglish, you may respond in Hinglish — but default is English.
4. Write like a city planning analyst — cite specific data points (station names, stop counts, route numbers, scores), give actionable recommendations with numbers (e.g. "Deploy 15-20 e-rickshaws covering a 3km radius").
5. Never make up data. Only reference stations, routes, and scores from the provided dataset.
6. Keep responses concise — max 3-4 paragraphs. Use bullet points for lists. No emojis except in Hinglish responses.`;

const TRANSIT_KEYWORDS = [
    "metro",
    "bus",
    "station",
    "stop",
    "route",
    "rickshaw",
    "e-rickshaw",
    "connectivity",
    "zone",
    "deploy",
    "gap",
    "last mile",
    "transit",
    "transport",
    "mobility",
    "delhi",
    "dmrc",
    "dtc",
    "frequency",
    "score",
    "hexagon",
    "h3",
    "line",
    "blue line",
    "yellow line",
    "dwarka",
    "noida",
    "gurgaon",
    "faridabad",
    "laxmi nagar",
    "rajiv chowk",
    "kashmere gate",
    "karol bagh",
    "saket",
    "kitne",
    "kahan",
    "konsa",
    "sabse",
    "kisko",
    "kya",
    "worst",
    "best",
    "recommend",
    "suggest",
    "analyze",
    "compare",
    "area",
    "sector",
    "vihar",
    "nagar",
    "colony",
    "market",
    "red line",
    "pink line",
    "violet",
    "magenta",
    "green line",
    "grey line",
    "airport",
    "aqua",
    "rapid",
    "ev",
    "electric",
    "auto",
    "feeder",
    "coverage"
];

export function isTransitQuery(message) {
    const lower = message.toLowerCase();
    return TRANSIT_KEYWORDS.some((kw) => lower.includes(kw));
}

export function buildSystemPrompt(hexagons, selectedZone) {
    let zoneContext = "";

    if (selectedZone) {
        zoneContext = `\n\nCURRENTLY SELECTED ZONE:
H3 Index: ${selectedZone.id}
Connectivity Score: ${selectedZone.score}/100
Metro Stations: ${selectedZone.metroCount} ${selectedZone.metroStations?.map((s) => `(${s.stop_name} - ${s.lines?.join(", ")})`).join(", ") || ""}
Bus Stops: ${selectedZone.busStopCount}
Bus Routes: ${selectedZone.busRouteCount}
Avg Frequency: ${selectedZone.avgFrequency} trips/day
Is Gap Zone: ${selectedZone.isGapZone ? "YES" : "No"}`;
    }

    const stats = hexagons
        ? {
              totalZones: hexagons.length,
              gapZones: hexagons.filter((h) => h.isGapZone).length,
              avgScore: Math.round(
                  hexagons.reduce((s, h) => s + h.score, 0) / hexagons.length
              ),
              worstZones: hexagons
                  .filter((h) => h.isGapZone)
                  .sort((a, b) => a.score - b.score)
                  .slice(0, 5)
                  .map((h) => ({
                      id: h.id,
                      score: h.score,
                      metro: h.metroStations?.map((s) => s.stop_name) || [],
                      busStops: h.busStopCount
                  }))
          }
        : {};

    return `${SYSTEM_PROMPT}

AVAILABLE DATA:
Total analyzed zones: ${stats.totalZones || 0}
Last-mile gap zones: ${stats.gapZones || 0}
Average connectivity score: ${stats.avgScore || 0}/100
Worst gap zones: ${JSON.stringify(stats.worstZones || [])}
${zoneContext}

The connectivity_score is calculated as:
- Metro presence: up to 30 points
- Bus stop density: up to 25 points
- Route diversity: up to 25 points
- Bus frequency: up to 20 points
A score below 50 = "gap zone" (no transit requirement — any underserved area counts)`;
}

export const REJECTION_MSG =
    "I only analyze Delhi NCR transit and mobility data. Please ask questions related to metro connectivity, bus routes, or deployment recommendations.";
