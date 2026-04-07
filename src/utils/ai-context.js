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

// Off-topic patterns we definitely want to reject
const OFF_TOPIC_PATTERNS = [
    /\bweather\b/i, /\btemperature\b/i, /\brain\b/i,
    /\bjoke\b/i, /\bpoem\b/i, /\bstory\b/i, /\bsong\b/i,
    /\bpython\b/i, /\bjavascript\b/i, /\bcode\b/i, /\bscript\b/i, /\bprogramming\b/i,
    /\bpolitics\b/i, /\belection\b/i, /\bgovernment policy\b/i,
    /\bcricket\b/i, /\bfootball\b/i, /\bmovie\b/i, /\bbollywood\b/i,
    /\bstock\b/i, /\bcrypto\b/i, /\bbitcoin\b/i,
    /\brecipe\b/i, /\bcooking\b/i,
    /\blove\b/i, /\bdating\b/i, /\bmarriage\b/i,
];

export function isTransitQuery(message) {
    const lower = message.toLowerCase().trim();
    if (!lower) return false;

    // Reject if it matches an obvious off-topic pattern
    if (OFF_TOPIC_PATTERNS.some((p) => p.test(lower))) return false;

    // Allow if it has transit keywords
    if (TRANSIT_KEYWORDS.some((kw) => lower.includes(kw))) return true;

    // Allow short questions with location-like words (Delhi area names) — be permissive
    // Common Delhi place name suffixes/patterns
    if (/\b(pur|garh|bagh|abad|nagar|mod|mor|chowk|gate|stand|terminal|sector|sec[- ]?\d+)\b/i.test(lower)) return true;

    // Allow questions that look like location queries even with misspellings
    if (/\b(where|kahan|nearest|near|how far|kitna)\b/i.test(lower)) return true;

    return false;
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
