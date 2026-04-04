import {useEffect, useRef, useState} from "react";
import mapboxgl from "mapbox-gl";
import {latLngToCell} from "h3-js";
import {getScoreColor} from "../utils/h3-utils";
import busFrequencyData from "../data/bus-frequency.json";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Simulated route names for buses
const ROUTE_NAMES = [
    "501",
    "522",
    "534",
    "543",
    "604",
    "615",
    "703",
    "712",
    "764",
    "806",
    "821",
    "853",
    "871",
    "905",
    "937",
    "961",
    "971",
    "981",
    "427",
    "433",
    "448",
    "462",
    "473",
    "489",
    "319",
    "334",
    "347",
    "240UP",
    "249DN",
    "257UP",
    "312DN",
    "340UP",
    "378DN",
    "401UP"
];
const ROUTE_DIRS = [
    "Towards Kashmere Gate",
    "Towards ISBT",
    "Towards Dwarka Sec-21",
    "Towards Anand Vihar",
    "Towards Mehrauli",
    "Towards Badarpur Border",
    "Towards Narela Terminal",
    "Towards Noida Sec-62",
    "Towards Mundka"
];

// Build frequency lookup
const freqMap = {};
busFrequencyData.forEach((f) => {
    freqMap[f.stop_id] = f;
});

// Haversine distance in meters
function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Minimal navigation dot — small filled circle with directional notch
function loadBusIcon(map) {
    return new Promise((resolve) => {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="5" fill="#3b82f6"/>
      <circle cx="8" cy="8" r="3.5" fill="#60a5fa"/>
      <path d="M8 2 L10 6 L6 6 Z" fill="#ffffff" opacity="0.9"/>
    </svg>`;

        const img = new Image(16, 16);
        img.onload = () => {
            map.addImage("bus-icon", img, { pixelRatio: 1 });
            resolve(true);
        };
        img.onerror = () => resolve(false);
        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    });
}

export default function Map({
    metroStations,
    busStops,
    hexagons,
    layers,
    selectedZone,
    onZoneSelect,
    onBusUpdate
}) {
    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const tooltipRef = useRef(null);
    const popupRef = useRef(null);

    // Initialize map
    useEffect(() => {
        if (mapRef.current) return;
        mapboxgl.accessToken = MAPBOX_TOKEN;

        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/dark-v11",
            center: [77.209, 28.6139],
            zoom: 11,
            pitch: 0,
            antialias: true
        });

        map.addControl(
            new mapboxgl.NavigationControl({showCompass: false}),
            "bottom-right"
        );

        // Tooltip (hover)
        const tooltip = document.createElement("div");
        tooltip.style.cssText = `
      position: absolute; pointer-events: none; z-index: 200;
      background: #1a1e2a; border: 1px solid #2a3050;
      padding: 8px 12px; border-radius: 4px; font-size: 11px;
      color: #d4dce8; font-family: 'Outfit', sans-serif;
      display: none; transform: translate(-50%, -120%);
      transition: opacity 100ms, transform 100ms;
      white-space: nowrap;
    `;
        mapContainer.current.appendChild(tooltip);
        tooltipRef.current = tooltip;

        map.on("load", async () => {
            mapRef.current = map;
            await loadBusIcon(map);
            console.log("[Map] Map loaded, setting mapLoaded=true");
            setMapLoaded(true);
        });

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // ===== HEXAGON LAYER =====
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !mapLoaded || hexagons.length === 0) return;

        const isGapView = layers.gapOnly;
        const visibleHexes = isGapView
            ? hexagons.filter((h) => h.isGapZone)
            : hexagons;
        const features = visibleHexes.map((hex) => ({
            type: "Feature",
            properties: {
                id: hex.id,
                score: hex.score,
                color: getScoreColor(hex.score),
                isGapZone: hex.isGapZone,
                opacity: isGapView ? 0.7 : hex.isGapZone ? 0.55 : 0.35
            },
            geometry: {
                type: "Polygon",
                coordinates: [
                    hex.boundary
                        .map(([lat, lng]) => [lng, lat])
                        .concat([
                            hex.boundary.map(([lat, lng]) => [lng, lat])[0]
                        ])
                ]
            }
        }));
        const geojson = {type: "FeatureCollection", features};

        if (map.getSource("hexagons")) {
            map.getSource("hexagons").setData(geojson);
        } else {
            map.addSource("hexagons", {type: "geojson", data: geojson});

            map.addLayer({
                id: "hex-fill",
                type: "fill",
                source: "hexagons",
                paint: {
                    "fill-color": ["get", "color"],
                    "fill-opacity": ["get", "opacity"]
                }
            });
            map.addLayer({
                id: "hex-border",
                type: "line",
                source: "hexagons",
                paint: {
                    "line-color": ["get", "color"],
                    "line-opacity": 0.7,
                    "line-width": 1
                }
            });
            map.addLayer({
                id: "hex-selected",
                type: "line",
                source: "hexagons",
                paint: {
                    "line-color": "#ffffff",
                    "line-width": 2.5,
                    "line-opacity": 0
                }
            });

            // Hex hover — brighten + tooltip
            map.on("mousemove", "hex-fill", (e) => {
                map.getCanvas().style.cursor = "pointer";
                // Brighten hovered hex
                map.setPaintProperty("hex-fill", "fill-opacity", [
                    "case",
                    ["==", ["get", "id"], e.features[0].properties.id],
                    0.65,
                    ["get", "opacity"]
                ]);
                const score = e.features[0].properties.score;
                const isGap = e.features[0].properties.isGapZone;
                tooltipRef.current.innerHTML = `<span style="font-family:'IBM Plex Mono',monospace;font-weight:600;color:${getScoreColor(score)}">${score}</span><span style="color:#6b7a94">/100</span>${isGap === true || isGap === "true" ? ' <span style="color:#ef4444;font-size:10px;font-weight:500">GAP ZONE</span>' : ""}`;
                tooltipRef.current.style.display = "block";
                tooltipRef.current.style.left = e.point.x + "px";
                tooltipRef.current.style.top = e.point.y + "px";
            });
            map.on("mouseleave", "hex-fill", () => {
                map.getCanvas().style.cursor = "";
                tooltipRef.current.style.display = "none";
                map.setPaintProperty("hex-fill", "fill-opacity", [
                    "get",
                    "opacity"
                ]);
            });
            // Hex click
            map.on("click", "hex-fill", (e) => {
                if (e.features.length === 0) return;
                const hex = hexagons.find(
                    (h) => h.id === e.features[0].properties.id
                );
                if (hex) onZoneSelect(hex);
            });
        }

        const hexVis = layers.hexagons ? "visible" : "none";
        ["hex-fill", "hex-border", "hex-selected"].forEach((id) =>
            map.setLayoutProperty(id, "visibility", hexVis)
        );

        // Gap-only view: dramatic styling
        if (isGapView) {
            map.setPaintProperty("hex-border", "line-width", 2.5);
            map.setPaintProperty("hex-border", "line-opacity", 0.9);
            map.setPaintProperty("hex-border", "line-color", "#ef4444");
            // Hide bus stops and live buses, keep metro
            if (map.getLayer("bus-stops-layer")) map.setLayoutProperty("bus-stops-layer", "visibility", "none");
            ["live-buses-layer", "live-buses-glow"].forEach((id) => {
                if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", "none");
            });
            if (map.getLayer("metro-stations")) map.setLayoutProperty("metro-stations", "visibility", "visible");
        } else {
            map.setPaintProperty("hex-border", "line-width", 1);
            map.setPaintProperty("hex-border", "line-opacity", 0.7);
            map.setPaintProperty("hex-border", "line-color", ["get", "color"]);
        }
    }, [mapLoaded, hexagons, layers.hexagons, layers.gapOnly]);

    // Selected hex highlight
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !mapLoaded || !map.getLayer("hex-selected")) return;
        map.setPaintProperty("hex-selected", "line-opacity", [
            "case",
            ["==", ["get", "id"], selectedZone?.id || ""],
            1,
            0
        ]);
    }, [mapLoaded, selectedZone]);

    // ===== METRO STATIONS LAYER =====
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !mapLoaded || metroStations.length === 0) return;

        const features = metroStations.map((s) => ({
            type: "Feature",
            properties: {
                name: s.stop_name,
                lines: JSON.stringify(s.lines || []),
                color: s.color || "#9E9E9E",
                lat: s.lat,
                lng: s.lng
            },
            geometry: {type: "Point", coordinates: [s.lng, s.lat]}
        }));
        const geojson = {type: "FeatureCollection", features};

        if (map.getSource("metro")) {
            map.getSource("metro").setData(geojson);
        } else {
            map.addSource("metro", {type: "geojson", data: geojson});
            map.addLayer({
                id: "metro-stations",
                type: "circle",
                source: "metro",
                paint: {
                    "circle-radius": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        9,
                        4,
                        14,
                        7
                    ],
                    "circle-color": ["get", "color"],
                    "circle-stroke-color": "#ffffff",
                    "circle-stroke-width": 1.5,
                    "circle-opacity": 0.9
                }
            });

            // Hover — tooltip only (no paint mutation to avoid perf issues)
            map.on("mousemove", "metro-stations", (e) => {
                map.getCanvas().style.cursor = "pointer";
                const f = e.features[0].properties;
                const lines = JSON.parse(f.lines);
                const lineDots = lines
                    .map((l) => {
                        const colors = {
                            Red: "#EE1C25",
                            Yellow: "#FFCB05",
                            Blue: "#0053A5",
                            Green: "#00A650",
                            Violet: "#8B5FA0",
                            Pink: "#F186AB",
                            Magenta: "#B9539F",
                            "Airport Express": "#F57F17",
                            Grey: "#9E9E9E",
                            "Rapid Metro": "#FFA500",
                            Aqua: "#00BCD4",
                            "Blue Branch": "#0053A5",
                            "Green Branch": "#00A650"
                        };
                        return `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${colors[l] || "#9E9E9E"};margin-right:3px"></span>${l}`;
                    })
                    .join(" ");
                tooltipRef.current.innerHTML = `<strong style="font-size:12px">${f.name}</strong><br/><span style="font-size:10px;color:#6b7a94">${lineDots}</span>`;
                tooltipRef.current.style.display = "block";
                tooltipRef.current.style.left = e.point.x + "px";
                tooltipRef.current.style.top = e.point.y + "px";
            });
            map.on("mouseleave", "metro-stations", () => {
                map.getCanvas().style.cursor = "";
                tooltipRef.current.style.display = "none";
            });

            // Click — rich popup
            map.on("click", "metro-stations", (e) => {
                if (e.originalEvent) e.originalEvent.stopPropagation();
                const f = e.features[0].properties;
                const coords = e.features[0].geometry.coordinates;
                const lines = JSON.parse(f.lines);
                const lat = parseFloat(f.lat);
                const lng = parseFloat(f.lng);

                // Count bus stops within 500m
                const nearbyBusStops = busStops.filter(
                    (b) => haversine(lat, lng, b.lat, b.lng) <= 500
                ).length;

                // Find hex this station belongs to
                const hexId = latLngToCell(lat, lng, 8);
                const hex = hexagons.find((h) => h.id === hexId);
                const score = hex ? hex.score : "—";
                const scoreColor = hex ? getScoreColor(hex.score) : "#6b7a94";

                const METRO_COLORS = {
                    Red: "#EE1C25",
                    Yellow: "#FFCB05",
                    Blue: "#0053A5",
                    Green: "#00A650",
                    Violet: "#8B5FA0",
                    Pink: "#F186AB",
                    Magenta: "#B9539F",
                    "Airport Express": "#F57F17",
                    Grey: "#9E9E9E",
                    "Rapid Metro": "#FFA500",
                    Aqua: "#00BCD4",
                    "Blue Branch": "#0053A5",
                    "Green Branch": "#00A650"
                };

                const linesHTML = lines
                    .map(
                        (l) =>
                            `<div style="display:flex;align-items:center;gap:6px;margin-top:3px"><div style="width:8px;height:8px;border-radius:50%;background:${METRO_COLORS[l] || "#9E9E9E"};flex-shrink:0"></div><span>${l} Line</span></div>`
                    )
                    .join("");

                if (popupRef.current) popupRef.current.remove();
                popupRef.current = new mapboxgl.Popup({
                    closeButton: true,
                    closeOnClick: true,
                    maxWidth: "240px",
                    className: "custom-popup"
                })
                    .setLngLat(coords)
                    .setHTML(
                        `
            <div style="font-family:'Outfit',sans-serif;color:#d4dce8;font-size:11px">
              <div style="font-size:14px;font-weight:600;margin-bottom:6px">${f.name}</div>
              ${linesHTML}
              <div style="margin-top:10px;padding-top:8px;border-top:1px solid #2a3050">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                  <span style="color:#6b7a94">Nearby bus stops</span>
                  <span style="font-family:'IBM Plex Mono',monospace;font-weight:600">${nearbyBusStops}</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                  <span style="color:#6b7a94">Zone score</span>
                  <span style="font-family:'IBM Plex Mono',monospace;font-weight:600;color:${scoreColor}">${score}<span style="color:#3d4a60">/100</span></span>
                </div>
              </div>
              ${
                  hex
                      ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid #2a3050;text-align:center">
                <a href="#" id="view-zone-${hexId}" style="color:#06b6d4;text-decoration:none;font-weight:500;font-size:10px;letter-spacing:0.05em;text-transform:uppercase">VIEW ZONE DETAILS →</a>
              </div>`
                      : ""
              }
            </div>
          `
                    )
                    .addTo(map);

                // Zoom in
                map.flyTo({
                    center: coords,
                    zoom: Math.max(map.getZoom(), 13),
                    duration: 600
                });

                // Attach click handler for "View Zone"
                if (hex) {
                    setTimeout(() => {
                        const link = document.getElementById(
                            `view-zone-${hexId}`
                        );
                        if (link)
                            link.addEventListener("click", (ev) => {
                                ev.preventDefault();
                                onZoneSelect(hex);
                                popupRef.current?.remove();
                            });
                    }, 100);
                }
            });
        }

        map.setLayoutProperty(
            "metro-stations",
            "visibility",
            layers.metro ? "visible" : "none"
        );
    }, [mapLoaded, metroStations, layers.metro]);

    // ===== BUS STOPS LAYER =====
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !mapLoaded || busStops.length === 0) return;

        const features = busStops.map((s) => {
            const freq = freqMap[s.stop_id];
            return {
                type: "Feature",
                properties: {
                    name: s.stop_name,
                    stop_id: s.stop_id,
                    routes_count: freq?.routes_count || 0,
                    trips_per_day: freq?.trips_per_day || 0
                },
                geometry: {type: "Point", coordinates: [s.lng, s.lat]}
            };
        });
        const geojson = {type: "FeatureCollection", features};

        if (map.getSource("bus-stops")) {
            map.getSource("bus-stops").setData(geojson);
        } else {
            map.addSource("bus-stops", {type: "geojson", data: geojson});
            const beforeLayer = map.getLayer("metro-stations")
                ? "metro-stations"
                : undefined;

            map.addLayer(
                {
                    id: "bus-stops-layer",
                    type: "circle",
                    source: "bus-stops",
                    paint: {
                        "circle-radius": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            9,
                            2,
                            13,
                            4,
                            16,
                            6
                        ],
                        "circle-color": "#64748b",
                        "circle-opacity": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            9,
                            0.3,
                            13,
                            0.6,
                            16,
                            0.8
                        ],
                        "circle-stroke-color": "#94a3b8",
                        "circle-stroke-width": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            9,
                            0,
                            13,
                            0.5
                        ]
                    }
                },
                beforeLayer
            );

            // Hover — brighten
            map.on("mousemove", "bus-stops-layer", (e) => {
                map.getCanvas().style.cursor = "pointer";
                tooltipRef.current.innerHTML = `<strong>${e.features[0].properties.name}</strong>`;
                tooltipRef.current.style.display = "block";
                tooltipRef.current.style.left = e.point.x + "px";
                tooltipRef.current.style.top = e.point.y + "px";
            });
            map.on("mouseleave", "bus-stops-layer", () => {
                map.getCanvas().style.cursor = "";
                tooltipRef.current.style.display = "none";
            });

            // Click — popup with stop details
            map.on("click", "bus-stops-layer", (e) => {
                if (e.originalEvent) e.originalEvent.stopPropagation();
                const f = e.features[0].properties;
                const coords = e.features[0].geometry.coordinates;

                if (popupRef.current) popupRef.current.remove();
                popupRef.current = new mapboxgl.Popup({
                    closeButton: true,
                    closeOnClick: true,
                    maxWidth: "220px",
                    className: "custom-popup"
                })
                    .setLngLat(coords)
                    .setHTML(
                        `
            <div style="font-family:'Outfit',sans-serif;color:#d4dce8;font-size:11px">
              <div style="font-size:13px;font-weight:600;margin-bottom:2px">${f.name}</div>
              <div style="font-family:'IBM Plex Mono',monospace;font-size:10px;color:#3d4a60;margin-bottom:8px">ID: ${f.stop_id}</div>
              <div style="padding-top:8px;border-top:1px solid #2a3050">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                  <span style="color:#6b7a94">Routes serving</span>
                  <span style="font-family:'IBM Plex Mono',monospace;font-weight:600">${f.routes_count}</span>
                </div>
                <div style="display:flex;justify-content:space-between">
                  <span style="color:#6b7a94">Trips/day</span>
                  <span style="font-family:'IBM Plex Mono',monospace;font-weight:600">${f.trips_per_day}</span>
                </div>
              </div>
            </div>
          `
                    )
                    .addTo(map);
            });
        }

        map.setLayoutProperty(
            "bus-stops-layer",
            "visibility",
            layers.busStops ? "visible" : "none"
        );
    }, [mapLoaded, busStops, layers.busStops]);

    // ===== LIVE BUSES (real API) + SIMULATED FALLBACK =====
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !mapLoaded) return;

        let isLive = false;
        let cancelled = false;
        let prevLivePositions = null; // for smooth interpolation between polls
        let targetLivePositions = null;
        let liveInterpolationStart = 0;

        // ----- Simulation state (fallback) -----
        const NUM_SIM = 350;
        const CORRIDORS = [
            {center: [77.209, 28.6139], spread: 0.12, heading: 0},
            {center: [77.1025, 28.5562], spread: 0.08, heading: 45},
            {center: [77.27, 28.63], spread: 0.1, heading: 90},
            {center: [77.32, 28.58], spread: 0.08, heading: 135},
            {center: [77.209, 28.7], spread: 0.1, heading: 0},
            {center: [77.209, 28.52], spread: 0.08, heading: 180},
            {center: [77.06, 28.47], spread: 0.06, heading: 225},
            {center: [77.15, 28.65], spread: 0.08, heading: 270},
            {center: [77.28, 28.68], spread: 0.06, heading: 30},
            {center: [77.35, 28.62], spread: 0.05, heading: 60}
        ];
        function seededRandom(seed) {
            let s = seed;
            return () => {
                s = (s * 16807) % 2147483647;
                return (s - 1) / 2147483646;
            };
        }
        const simBuses = [];
        for (let i = 0; i < NUM_SIM; i++) {
            const rng = seededRandom(i * 7919 + 1);
            const c = CORRIDORS[i % CORRIDORS.length];
            const headingRad =
                ((c.heading + (rng() - 0.5) * 60) * Math.PI) / 180;
            const speed = 0.000035 + rng() * 0.000065;
            simBuses.push({
                id: `sim_${i}`,
                route: ROUTE_NAMES[i % ROUTE_NAMES.length],
                direction: ROUTE_DIRS[i % ROUTE_DIRS.length],
                lng: c.center[0] + (rng() - 0.5) * c.spread * 2,
                lat: c.center[1] + (rng() - 0.5) * c.spread * 2,
                targetLng: 0,
                targetLat: 0,
                vLng: Math.cos(headingRad) * speed,
                vLat: Math.sin(headingRad) * speed,
                bearing: ((headingRad * 180) / Math.PI + 90) % 360
            });
        }
        function advanceSim(bus, dt) {
            bus.lng += bus.vLng * dt;
            bus.lat += bus.vLat * dt;
            if (bus.lng < 76.85 || bus.lng > 77.55) bus.vLng *= -1;
            if (bus.lat < 28.4 || bus.lat > 28.85) bus.vLat *= -1;
            bus.vLng += (Math.random() - 0.5) * 0.000008;
            bus.vLat += (Math.random() - 0.5) * 0.000008;
            bus.bearing =
                ((Math.atan2(bus.vLat, bus.vLng) * 180) / Math.PI + 90) % 360;
        }
        let simPrev = simBuses.map((b) => ({
            lng: b.lng,
            lat: b.lat,
            bearing: b.bearing
        }));
        simBuses.forEach((b, i) => {
            advanceSim(b, 30);
            b.targetLng = b.lng;
            b.targetLat = b.lat;
            b.lng = simPrev[i].lng;
            b.lat = simPrev[i].lat;
        });

        // ----- GeoJSON helpers -----
        function toGeoJSON(vehicles, simulated) {
            return {
                type: "FeatureCollection",
                features: vehicles.map((v) => ({
                    type: "Feature",
                    properties: {
                        id: v.vehicle_id || v.id,
                        route: v.route_id || v.route || "—",
                        direction: v.direction || "",
                        bearing: v.bearing || 0,
                        simulated: !!simulated
                    },
                    geometry: {type: "Point", coordinates: [v.lng, v.lat]}
                }))
            };
        }

        // ----- Create map source + layers once -----
        if (!map.getSource("live-buses")) {
            map.addSource("live-buses", {
                type: "geojson",
                data: toGeoJSON([], true)
            });

            map.addLayer({
                id: "live-buses-glow",
                type: "circle",
                source: "live-buses",
                paint: {
                    "circle-radius": 8,
                    "circle-color": "#3b82f6",
                    "circle-opacity": 0.12,
                    "circle-blur": 1
                }
            });
            map.addLayer({
                id: "live-buses-layer",
                type: "symbol",
                source: "live-buses",
                layout: {
                    "icon-image": "bus-icon",
                    "icon-size": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        9,
                        0.6,
                        11,
                        0.8,
                        13,
                        1,
                        16,
                        1.4
                    ],
                    "icon-rotate": ["get", "bearing"],
                    "icon-rotation-alignment": "map",
                    "icon-allow-overlap": true,
                    "icon-ignore-placement": true
                },
                paint: {"icon-opacity": 0.9}
            });

            // Hover
            map.on("mousemove", "live-buses-layer", (e) => {
                map.getCanvas().style.cursor = "pointer";
                const f = e.features[0].properties;
                tooltipRef.current.innerHTML = `<span style="font-family:'IBM Plex Mono',monospace;font-weight:600;color:#3b82f6">Route ${f.route}</span>`;
                tooltipRef.current.style.display = "block";
                tooltipRef.current.style.left = e.point.x + "px";
                tooltipRef.current.style.top = e.point.y + "px";
            });
            map.on("mouseleave", "live-buses-layer", () => {
                map.getCanvas().style.cursor = "";
                tooltipRef.current.style.display = "none";
            });

            // Click
            map.on("click", "live-buses-layer", (e) => {
                if (e.originalEvent) e.originalEvent.stopPropagation();
                const f = e.features[0].properties;
                const coords = e.features[0].geometry.coordinates;
                const isSim = f.simulated === true || f.simulated === "true";
                if (popupRef.current) popupRef.current.remove();
                popupRef.current = new mapboxgl.Popup({
                    closeButton: true,
                    closeOnClick: true,
                    maxWidth: "220px",
                    className: "custom-popup"
                })
                    .setLngLat(coords)
                    .setHTML(
                        `
            <div style="font-family:'Outfit',sans-serif;color:#d4dce8;font-size:11px">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
                <div style="width:8px;height:5px;background:#3b82f6;border-radius:1px"></div>
                <span style="font-size:14px;font-weight:600">Route ${f.route}</span>
              </div>
              ${f.direction ? `<div style="color:#6b7a94;margin-bottom:4px">${f.direction}</div>` : ""}
              <div style="margin-top:8px;padding-top:8px;border-top:1px solid #2a3050">
                <div style="display:flex;align-items:center;gap:4px">
                  <div style="width:6px;height:6px;border-radius:50%;background:${isSim ? "#f59e0b" : "#16a34a"}"></div>
                  <span style="font-size:10px;color:${isSim ? "#f59e0b" : "#16a34a"};letter-spacing:0.05em;text-transform:uppercase;font-weight:500">${isSim ? "Simulated Position" : "Live GPS Position"}</span>
                </div>
              </div>
            </div>
          `
                    )
                    .addTo(map);
            });
        }

        // ----- Fetch real bus data -----
        async function fetchRealBuses() {
            try {
                const resp = await fetch("/api/buses");
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                const data = await resp.json();
                if (!data.vehicles || data.vehicles.length === 0)
                    throw new Error("No vehicles");
                return data.vehicles;
            } catch (err) {
                console.warn("[Map] Real bus API failed:", err.message);
                return null;
            }
        }

        // ----- Main loop -----
        let simInterpolationStart = performance.now();
        const POLL_INTERVAL = 30000;

        function simGeoJSON(t) {
            const positions = simBuses.map((b, i) => ({
                lng: simPrev[i].lng + (b.targetLng - simPrev[i].lng) * t,
                lat: simPrev[i].lat + (b.targetLat - simPrev[i].lat) * t,
                bearing: b.bearing,
                id: b.id,
                route: b.route,
                direction: b.direction
            }));
            return toGeoJSON(positions, true);
        }

        function liveGeoJSON(t) {
            if (!prevLivePositions || !targetLivePositions) return null;
            // Build a map from vehicle_id → target for interpolation
            const targetMap = {};
            targetLivePositions.forEach((v) => {
                targetMap[v.vehicle_id] = v;
            });
            const positions = prevLivePositions.map((pv) => {
                const tv = targetMap[pv.vehicle_id];
                if (!tv) return pv; // vehicle disappeared, keep last pos
                return {
                    vehicle_id: pv.vehicle_id,
                    route_id: tv.route_id || pv.route_id,
                    lng: pv.lng + (tv.lng - pv.lng) * t,
                    lat: pv.lat + (tv.lat - pv.lat) * t,
                    bearing: tv.bearing || pv.bearing || 0
                };
            });
            // Also add any new vehicles from target that weren't in prev
            const prevIds = new Set(prevLivePositions.map((v) => v.vehicle_id));
            targetLivePositions.forEach((tv) => {
                if (!prevIds.has(tv.vehicle_id)) positions.push(tv);
            });
            return toGeoJSON(positions, false);
        }

        let consecutiveFailures = 0;

        async function poll() {
            if (cancelled) return;
            const realData = await fetchRealBuses();
            if (realData && realData.length > 10) {
                consecutiveFailures = 0;
                if (!isLive) {
                    console.log(`[Map] Switching to LIVE — ${realData.length} buses`);
                    isLive = true;
                    prevLivePositions = realData;
                    targetLivePositions = realData;
                } else {
                    prevLivePositions = targetLivePositions || realData;
                    targetLivePositions = realData;
                }
                liveInterpolationStart = performance.now();
                onBusUpdate(realData.length, false);
            } else {
                consecutiveFailures++;
                // Only fall back to simulation after 3 consecutive failures
                // This prevents buses from vanishing on a single bad poll
                if (consecutiveFailures >= 3) {
                    if (isLive) console.log("[Map] 3 failures, falling back to simulation");
                    isLive = false;
                    onBusUpdate(NUM_SIM, true);
                } else if (isLive) {
                    console.log(`[Map] Poll failed (${consecutiveFailures}/3), keeping last live data`);
                }
            }
        }

        function tick() {
            if (cancelled) return;
            const now = performance.now();

            if (isLive) {
                const elapsed = now - liveInterpolationStart;
                let t = Math.min(elapsed / POLL_INTERVAL, 1);
                t = t * t * (3 - 2 * t);
                const geo = liveGeoJSON(t);
                if (geo && map.getSource("live-buses")) {
                    map.getSource("live-buses").setData(geo);
                }
            } else {
                const elapsed = now - simInterpolationStart;
                let t = Math.min(elapsed / POLL_INTERVAL, 1);
                t = t * t * (3 - 2 * t);

                if (map.getSource("live-buses")) {
                    map.getSource("live-buses").setData(simGeoJSON(t));
                }

                if (t >= 1) {
                    const positions = simBuses.map((b, i) => ({
                        lng: simPrev[i].lng + (b.targetLng - simPrev[i].lng),
                        lat: simPrev[i].lat + (b.targetLat - simPrev[i].lat)
                    }));
                    simPrev = positions.map((p, i) => ({
                        ...p,
                        bearing: simBuses[i].bearing
                    }));
                    simBuses.forEach((b, i) => {
                        b.lng = simPrev[i].lng;
                        b.lat = simPrev[i].lat;
                        advanceSim(b, 30);
                        b.targetLng = b.lng;
                        b.targetLat = b.lat;
                        b.lng = simPrev[i].lng;
                        b.lat = simPrev[i].lat;
                    });
                    simInterpolationStart = now;
                    if (!isLive) onBusUpdate(NUM_SIM, true);
                }
            }
        }

        // Kick off: poll immediately, then update at 2fps (not 60fps)
        poll();
        const pollInterval = setInterval(poll, POLL_INTERVAL);
        const tickInterval = setInterval(tick, 500);

        return () => {
            cancelled = true;
            clearInterval(pollInterval);
            clearInterval(tickInterval);
        };
    }, [mapLoaded]);

    // Toggle bus visibility
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !mapLoaded) return;
        const vis = layers.liveBuses ? "visible" : "none";
        ["live-buses-layer", "live-buses-glow"].forEach((id) => {
            if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", vis);
        });
    }, [mapLoaded, layers.liveBuses]);

    return (
        <div
            ref={mapContainer}
            style={{position: "absolute", inset: 0, background: "#08090d"}}
        />
    );
}
