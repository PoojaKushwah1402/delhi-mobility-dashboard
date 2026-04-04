import { useState, useEffect, useMemo, useCallback } from 'react';
import './index.css';
import { loadData } from './utils/data-loader';
import { computeHexagons } from './utils/h3-utils';
import Map from './components/Map';
import Header from './components/Header';
import StatsPanel from './components/StatsPanel';
import ZoneDetail from './components/ZoneDetail';
import AIChat from './components/AIChat';
import LiveTracker from './components/LiveTracker';

function App() {
  const [data, setData] = useState(null);
  const [hexagons, setHexagons] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [layers, setLayers] = useState({
    hexagons: true,
    metro: true,
    busStops: true,
    liveBuses: true,
    gapOnly: false
  });
  const [liveBusCount, setLiveBusCount] = useState(0);
  const [lastBusUpdate, setLastBusUpdate] = useState(null);

  useEffect(() => {
    const d = loadData();
    setData(d);
    const hexes = computeHexagons(d.metroStations, d.busStops, d.busFrequency);
    setHexagons(hexes);
  }, []);

  const toggleLayer = useCallback((key) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const stats = useMemo(() => {
    if (!data || hexagons.length === 0) return null;
    const gapZones = hexagons.filter(h => h.isGapZone);
    const brackets = [0, 0, 0, 0, 0];
    hexagons.forEach(h => {
      if (h.score <= 20) brackets[0]++;
      else if (h.score <= 40) brackets[1]++;
      else if (h.score <= 60) brackets[2]++;
      else if (h.score <= 80) brackets[3]++;
      else brackets[4]++;
    });
    return {
      metroStations: data.metroStations.length,
      busStops: data.busStops.length,
      busRoutes: data.busRoutes.length,
      gapZones: gapZones.length,
      totalZones: hexagons.length,
      brackets,
      liveBuses: liveBusCount
    };
  }, [data, hexagons, liveBusCount]);

  if (!data) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#08090d' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="skeleton" style={{ width: 200, height: 24, margin: '0 auto 12px' }} />
          <div className="skeleton" style={{ width: 140, height: 14, margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <Map
        metroStations={data.metroStations}
        busStops={data.busStops}
        hexagons={hexagons}
        layers={layers}
        selectedZone={selectedZone}
        onZoneSelect={setSelectedZone}
        onBusUpdate={(count) => { setLiveBusCount(count); setLastBusUpdate(new Date()); }}
      />
      <Header onChatToggle={() => setChatOpen(!chatOpen)} chatOpen={chatOpen} />
      <StatsPanel
        stats={stats}
        layers={layers}
        onToggleLayer={toggleLayer}
        lastBusUpdate={lastBusUpdate}
      />
      {selectedZone && (
        <ZoneDetail
          zone={selectedZone}
          onClose={() => setSelectedZone(null)}
          onAskAI={() => setChatOpen(true)}
        />
      )}
      {chatOpen && (
        <AIChat
          hexagons={hexagons}
          selectedZone={selectedZone}
          onClose={() => setChatOpen(false)}
        />
      )}
      <LiveTracker count={liveBusCount} lastUpdate={lastBusUpdate} />
    </div>
  );
}

export default App;
