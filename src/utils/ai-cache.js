// Pre-cached answers using real zone data — works with zero API calls
const PRE_CACHED = {
  "which zones have worst connectivity": `Analysis of 1,219 zones across Delhi NCR reveals severe connectivity gaps:

**Critical Zones (Score 0-20):**
• Multiple zones in outer Delhi (Narela, Bawana, Mundka periphery) score as low as 4/100 — complete transit deserts with only 1 bus stop and no metro access.

**Metro Stations with Broken Last-Mile (Score 30/100, 0 bus stops):**
• Shastri Park (Red Line) — dense residential catchment, zero feeder buses
• Chandni Chowk (Yellow Line) — high footfall commercial zone, no bus connectivity
• Vaishali (Blue Line) — Ghaziabad terminus, commuters entirely dependent on auto-rickshaws
• Huda City Centre (Yellow Line) — Gurgaon's primary terminus, no bus stops in zone
• Badarpur Border (Violet Line) — Faridabad gateway, zero feeder service

**Summary:** 301 out of 1,219 zones (25%) are classified as gap zones with scores below 50/100. Of these, 65 have a metro station but still lack adequate feeder connectivity.`,

  "sabse zyada problem kahan hai": `Delhi NCR mein sabse zyada problem outer areas aur metro terminal stations pe hai:

**Critical areas:**
• Narela, Bawana, Mundka — score 4-7/100, sirf 1 bus stop, koi metro nahi
• 301 zones (25%) gap zones hain (score < 50)

**Metro stations jahan last-mile nahi hai (Score 30/100):**
• Shastri Park (Red Line) — 0 bus stops
• Chandni Chowk (Yellow Line) — 0 bus stops
• Vaishali (Blue Line) — 0 bus stops
• Huda City Centre (Yellow Line) — 0 bus stops
• IFFCO Chowk, MG Road (Yellow Line) — Gurgaon mein 0 bus connectivity

**65 metro stations** ke zones mein score 50 se kam hai — metro hai lekin feeder connectivity broken hai. E-rickshaw deployment ke liye yeh highest-impact zones hain.`,

  "where should i deploy e-rickshaws": `Based on connectivity analysis, the following zones represent the highest-impact deployment opportunities:

**Tier 1 — Critical Priority (Score 30/100, metro present, 0 bus stops):**
1. **Shastri Park** (Red Line) — Dense residential zone, zero bus connectivity. Deploy 15-20 e-rickshaws, 3km coverage radius.
2. **Chandni Chowk** (Yellow Line) — Highest footfall in Old Delhi, no feeder buses. Narrow lanes ideal for e-rickshaws.
3. **Vaishali** (Blue Line) — Ghaziabad terminus, 0 bus stops. Estimated 800-1,200 daily commuters needing last-mile.
4. **Huda City Centre** (Yellow Line) — Gurgaon's primary terminus, auto-dependent. High willingness to pay (est. ₹15-20/ride).
5. **Badarpur Border** (Violet Line) — Faridabad gateway, entire extension corridor has zero feeder service.

**Tier 2 — High Priority (Score 30-35):**
• Patel Nagar, Yamuna Bank (Blue Line)
• NHPC Chowk, Mewala Maharajpur, Sector-28 (Violet Line)

**Recommended strategy:** 15-20 e-rickshaws per Tier 1 station, 3-5km coverage radius. Estimated combined daily ridership across 5 stations: 4,000-6,000 rides.`,

  "compare dwarka vs noida": `**Dwarka vs Noida — Connectivity Analysis:**

**Dwarka (Blue Line + Grey Line):**
• **Excellent connectivity** — most sectors score 80-100/100
• Dwarka Sector 8, 13, 21: Score 100/100 with 11-13 bus stops each
• Grey Line extension (Najafgarh, Dhansa Bus Stand) is well-served — scores 93-100
• Notable exception: Dwarka station itself scores only 42/100 (1 bus stop) — a localized gap

**Noida (Blue Line + Aqua Line):**
• **Severe connectivity gaps** despite two metro lines
• Aqua Line: All 21 stations score 30/100 with **zero bus stops** — Sectors 50, 51, 76, 81, 83, 101, 137-148, NSEZ, Knowledge Park, Pari Chowk, Alpha 1, Delta 1, GNIDA Office
• Vaishali (Blue Line terminus): Score 30/100, 0 bus stops — a critical gap

**Assessment:** Noida exhibits **dramatically worse** last-mile connectivity than Dwarka. The Aqua Line corridor has zero bus feeder service across all 21 stations — representing the single largest gap zone cluster in the network. Dwarka, by contrast, is one of the best-connected corridors in Delhi NCR. **Noida is the priority deployment target.**`,

  "how many gap zones are there": `There are **301 gap zones** out of 1,219 total analyzed zones in Delhi NCR — representing **25% of the transit network** with connectivity scores below 50/100.

**Severity breakdown:**
• **Score 0-20 (Critical):** Complete transit deserts — primarily outer Delhi zones with 0-1 bus stops, no metro. Approximately 32 zones.
• **Score 21-35 (Severe):** Minimal bus service — 1-2 stops, very low frequency. Approximately 175 zones.
• **Score 36-49 (Poor):** Some transit infrastructure exists but insufficient for daily commuter needs. Approximately 94 zones.

**Key finding:** 67 gap zones contain a metro station but still score below 50 — indicating that while metro access exists, the feeder connectivity layer is fundamentally broken. These metro-adjacent gap zones represent the highest-priority intervention points for last-mile solutions.`,

  "tell me about laxmi nagar": `**Laxmi Nagar — Zone Analysis (Blue Line)**

Laxmi Nagar is one of East Delhi's most densely populated commercial hubs, served by the Blue Line metro.

**Connectivity profile:**
• **Connectivity score: 99/100** — one of the best-connected metro stations in Delhi
• 8 bus stops within the zone with strong route diversity
• Excellent feeder coverage on Vikas Marg, Laxmi Nagar Main Road, and surrounding arterials
• High bus frequency makes this zone a connectivity success story

**Adjacent gap on the same line:**
• Yamuna Bank (Blue Line interchange) — Score 30/100, 0 bus stops. Despite being a major interchange one stop away, it has zero feeder connectivity.

**Deployment recommendation:** **Low priority** for e-rickshaw deployment — Laxmi Nagar is already well-served by buses. Resources would be better directed at adjacent Yamuna Bank or other Blue Line gap stations. The contrast between Laxmi Nagar (Score 99) and Yamuna Bank (Score 30) one stop away illustrates how unevenly distributed Delhi's last-mile connectivity is.`,

  "best areas for e-rickshaw business": `**E-Rickshaw Deployment Analysis — Revenue-Optimized Rankings:**

**1. Yellow Line Terminus Corridors:**
• Huda City Centre (Score 30) — Gurgaon's busiest terminus, zero bus stops, premium-paying corporate commuters. Est. revenue: ₹15-20/ride.
• Samaypur Badli — Northern terminus serving industrial workforce.

**2. Violet Line Faridabad Corridor:**
• Badarpur Border, NHPC Chowk, Mewala Maharajpur — All scoring 30/100 with zero bus stops. Rapidly growing residential catchment, high volume potential.

**3. Blue Line Terminal Areas:**
• Vaishali (Score 30) — Ghaziabad border, 0 bus stops, residential catchment of 5+ lakh residents.
• Noida Electronic City — IT workforce requiring last-mile to office parks.

**4. Aqua Line (Noida Sectors 51-142):**
• 21 stations with near-zero bus connectivity. First-mover advantage in a rapidly developing market.

**5. Red Line North:**
• Shastri Park (Score 30) — Dense residential, no buses. High ridership volume at low fares.

**Financial model:** Target 15-20 e-rickshaws per station. Areas near IT hubs (Noida, Gurgaon) support ₹15-20/ride; residential corridors support ₹10-15/ride at higher volume.`,

  "which metro stations have worst last mile": `**Metro Stations with Critical Last-Mile Gaps (Score 30/100, 0 bus stops in zone):**

**Red Line:**
• Shastri Park — Dense residential area, zero bus connectivity
• Pratap Nagar — Industrial zone, no feeder service

**Yellow Line:**
• Chandni Chowk — One of Delhi's highest-footfall areas, yet zero bus stops in the zone
• Gurudronacharya, MG Road, IFFCO Chowk — Gurgaon corridor with no bus connectivity
• Huda City Centre — Terminus station, entirely auto-rickshaw dependent

**Blue Line:**
• Vaishali — Ghaziabad terminus, 0 bus stops, major commuter stranding
• Yamuna Bank — Key interchange station with zero feeder service
• Patel Nagar — Central Delhi location, surprisingly no bus stops in hex zone

**Violet Line:**
• Badarpur Border, Sarai, NHPC Chowk, Mewala Maharajpur, Sector-28 — The entire Faridabad extension has zero bus connectivity across 5+ stations.

**Summary:** 65 metro stations fall within gap zones (score < 50). This represents a systemic failure in feeder connectivity — the metro backbone exists, but the last-mile layer is absent.`,

  "delhi mein kitne gap zones hain": `Delhi NCR mein **301 gap zones** hain — 1,219 total zones mein se 25% ka connectivity score 50 se neeche hai.

**Breakdown:**
• Score 0-20 (Critical): ~32 zones — koi connectivity nahi, mostly outer Delhi (Narela, Mundka)
• Score 21-35 (Severe): ~175 zones — sirf 1-2 bus stops, bahut kam service
• Score 36-49 (Poor): ~94 zones — kuch service hai lekin daily commuters ke liye kaafi nahi

**65 metro stations** gap zones mein hain — metro hai lekin feeder bus connectivity broken hai. Yeh sabse important intervention points hain.

**E-rickshaw deployment opportunity:** In 65 metro gap zones pe focus karo — har station pe 15-20 e-rickshaws. Estimated daily ridership: 200-300 rides per station.`,

  "analyze dwarka corridor": `**Dwarka Corridor — Connectivity Analysis:**

The Dwarka corridor is one of the **best-connected** areas in Delhi NCR, served by the Blue Line metro (Dwarka Sec-21 to Dwarka Mor) and the Grey Line extension to Dhansa Bus Stand.

**Connectivity profile:**
• **Excellent overall scores** — most Dwarka sector stations score 80-100/100
• Dwarka Sector-13: Score 100/100, 11 bus stops in zone
• Dwarka Sector-8: Score 100/100, 13 bus stops
• Dwarka Sector-21 (Blue + Airport Express interchange): Score 100/100, 12 bus stops
• Dwarka Mor: Score 96/100, 7 bus stops

**Grey Line extension:**
• Najafgarh: Score 93/100, 6 bus stops — well-served
• Dhansa Bus Stand: Score 100/100, 12 bus stops — excellent terminus connectivity

**Notable exception:** Dwarka station itself (Blue + Grey interchange) scores only 42/100 with 1 bus stop — a surprising gap in an otherwise well-connected corridor.

**Recommendation:** Dwarka is NOT a priority deployment area for e-rickshaws — connectivity is already strong. Focus instead on the underserved Dwarka station hex zone, or redirect resources to Gurgaon's Yellow Line corridor (Huda City Centre, IFFCO Chowk) which have severe last-mile gaps.`,

  "top 10 underserved metro stations": `**Top 10 Underserved Metro Stations (Score 30/100, 0 bus stops in zone):**

1. **Huda City Centre** (Yellow Line) — Gurgaon's primary terminus, lakhs of daily commuters
2. **Vaishali** (Blue Line) — Ghaziabad border terminus, dense residential catchment
3. **Chandni Chowk** (Yellow Line) — Historic commercial hub, high footfall
4. **Badarpur Border** (Violet Line) — Faridabad gateway
5. **Shastri Park** (Red Line) — Dense residential area in East Delhi
6. **IFFCO Chowk** (Yellow Line) — Major Gurgaon corporate corridor
7. **MG Road** (Yellow Line) — Gurgaon shopping/commercial hub
8. **Yamuna Bank** (Blue Line) — Critical interchange station
9. **Patel Nagar** (Blue Line) — Central Delhi residential
10. **Pratap Nagar** (Red Line) — North Delhi industrial zone

All 10 stations have a connectivity score of 30/100 with **zero bus stops** in their hexagon zones. Combined daily commuter footfall is estimated at 5-7 lakh people who currently rely entirely on auto-rickshaws or walking for last-mile transport. These represent the highest-priority intervention points in Delhi's transit network.`,

  "recommend top 5 zones for deployment": `**Top 5 Priority Zones for E-Rickshaw Deployment:**

**#1 Huda City Centre (Yellow Line) — Score: 30/100**
Gurgaon's primary metro terminus. Zero bus stops in zone. Serves a corporate commuter base with high willingness to pay. Estimated daily demand: 1,000-1,500 rides. Revenue potential: ₹15-20/ride.

**#2 Vaishali (Blue Line) — Score: 30/100**
Ghaziabad border terminus. Zero bus stops. Dense residential catchment of 5+ lakh residents. Peak-hour demand is consistently high. Estimated daily demand: 800-1,200 rides.

**#3 Badarpur Border (Violet Line) — Score: 30/100**
Faridabad gateway. The entire Violet Line extension corridor lacks bus connectivity. Intercity commuter capture opportunity. Estimated daily demand: 600-900 rides.

**#4 Chandni Chowk (Yellow Line) — Score: 30/100**
Historic commercial hub with massive footfall. Narrow lanes are ideal for e-rickshaw operations. Tourist traffic adds premium ride potential. Estimated daily demand: 800-1,000 rides.

**#5 Noida Sector 76 (Aqua Line) — Score: 30/100**
Rapidly developing IT/residential corridor. The Aqua Line has 21 stations, most without bus stops. First-mover advantage in an expanding market. Estimated daily demand: 400-700 rides.

**Phase 1 recommendation:** Deploy 75-100 e-rickshaws across these 5 stations. Combined estimated daily ridership: 3,600-5,300 rides. At ₹12 average fare: ₹43,000-64,000 daily revenue potential.`,
};

// Stop words to ignore in matching
const STOP_WORDS = new Set(['the', 'a', 'an', 'is', 'are', 'do', 'does', 'in', 'on', 'at', 'of', 'to', 'me', 'i', 'my', 'first', 'please', 'can', 'you', 'tell', 'about', 'what', 'how', 'should']);

// Normalize question for cache lookup — lowercase, trim, strip punctuation, remove stop words
function normalizeQuestion(q) {
  return q
    .toLowerCase()
    .trim()
    .replace(/[?!.,'":;]/g, '')
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(w => w && !STOP_WORDS.has(w))
    .join(' ');
}

// Token-based similarity — what fraction of cache key tokens appear in the question
function tokenOverlap(query, key) {
  const qTokens = new Set(query.split(' '));
  const kTokens = key.split(' ');
  if (kTokens.length === 0) return 0;
  let matches = 0;
  for (const t of kTokens) if (qTokens.has(t)) matches++;
  return matches / kTokens.length;
}

// Find cache match — token-based fuzzy lookup
function findCacheMatch(question) {
  const normalized = normalizeQuestion(question);
  if (!normalized) return null;

  let bestMatch = null;
  let bestScore = 0;

  for (const [key, answer] of Object.entries(PRE_CACHED)) {
    const keyNorm = normalizeQuestion(key);
    const score = tokenOverlap(normalized, keyNorm);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = answer;
    }
  }

  // Require at least 70% of key tokens to be present
  if (bestScore >= 0.7) return bestMatch;

  // Check localStorage cache (exact normalized match)
  try {
    const cached = localStorage.getItem(`ai_cache_${normalized}`);
    if (cached) return cached;
  } catch {}

  return null;
}

// Store answer in localStorage
function cacheAnswer(question, answer) {
  const normalized = normalizeQuestion(question);
  try {
    localStorage.setItem(`ai_cache_${normalized}`, answer);
  } catch {}
}

export { findCacheMatch, cacheAnswer, PRE_CACHED };
