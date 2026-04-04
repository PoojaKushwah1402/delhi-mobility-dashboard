import metroStationsData from '../data/metro-stations.json';
import busStopsData from '../data/bus-stops.json';
import busRoutesData from '../data/bus-routes.json';
import busFrequencyData from '../data/bus-frequency.json';

export function loadData() {
  return {
    metroStations: metroStationsData,
    busStops: busStopsData,
    busRoutes: busRoutesData,
    busFrequency: busFrequencyData
  };
}
