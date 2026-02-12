import { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, FeatureGroup, Polyline, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L, { type LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

type OrchardTreePoint = {
  id: string;
  location_geojson: unknown;
};

type OrchardLine = {
  id: string;
  line_geojson: unknown;
};

type OrchardMapCanvasProps = {
  selectedBoundary: GeoJSON.Polygon | null;
  draftBoundary: GeoJSON.Polygon | null;
  orchardTreePoints: OrchardTreePoint[];
  orchardLines: OrchardLine[];
  addingTree: boolean;
  focusLocation: [number, number] | null;
  selectedOrchardName?: string;
  treeCount?: number;
  onBoundaryCreated: (polygon: GeoJSON.Polygon) => void;
  onBoundaryEdited: (polygon: GeoJSON.Polygon) => void;
  onBoundaryDeleted: () => void;
  onLineCreated: (line: GeoJSON.LineString) => void;
  onMapClick: (coords: [number, number]) => void;
  onUseMyLocation?: (coords: [number, number]) => void;
};

const toLatLngs = (polygon: GeoJSON.Polygon): LatLngExpression[] => {
  const ring = polygon.coordinates[0] || [];
  return ring.map(([lng, lat]) => [lat, lng]);
};

const lineToLatLngs = (line: GeoJSON.LineString): LatLngExpression[] => {
  return (line.coordinates || []).map(([lng, lat]) => [lat, lng]);
};

const extractPolygon = (feature: GeoJSON.Feature): GeoJSON.Polygon | null => {
  if (feature.geometry?.type === 'Polygon') {
    return feature.geometry;
  }
  if (feature.geometry?.type === 'MultiPolygon') {
    const coords = feature.geometry.coordinates[0];
    if (!coords) return null;
    return { type: 'Polygon', coordinates: coords };
  }
  return null;
};

const extractLine = (feature: GeoJSON.Feature): GeoJSON.LineString | null => {
  if (feature.geometry?.type === 'LineString') {
    return feature.geometry;
  }
  return null;
};

const treeIconSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <circle cx="24" cy="18" r="12" fill="#22c55e"/>
  <rect x="21" y="26" width="6" height="14" rx="2" fill="#92400e"/>
</svg>
`);

const treeIcon = L.icon({
  iconUrl: `data:image/svg+xml,${treeIconSvg}`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const MapClickHandler = ({
  enabled,
  onPoint,
}: {
  enabled: boolean;
  onPoint: (coords: [number, number]) => void;
}) => {
  useMapEvents({
    click(event) {
      if (!enabled) return;
      onPoint([event.latlng.lat, event.latlng.lng]);
    },
  });
  return null;
};

const MapLocator = ({ onLocate }: { onLocate?: (coords: [number, number]) => void }) => {
  const map = useMap();
  const handleLocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(position => {
      const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
      map.setView(coords, 17);
      onLocate?.(coords);
    });
  };
  
  // Don't render if no callback provided
  if (!onLocate) return null;
  
  return (
    <button
      type="button"
      onClick={handleLocate}
      className="absolute bottom-4 left-4 z-[1000] bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-1"
    >
      📍 Use My Location
    </button>
  );
};

const MapFocus = ({ coords }: { coords: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (!coords) return;
    map.setView(coords, Math.max(map.getZoom(), 17), { animate: true });
  }, [coords, map]);
  return null;
};

export function OrchardMapCanvas({
  selectedBoundary,
  draftBoundary,
  orchardTreePoints,
  orchardLines,
  addingTree,
  focusLocation,
  selectedOrchardName,
  treeCount,
  onBoundaryCreated,
  onBoundaryEdited,
  onBoundaryDeleted,
  onLineCreated,
  onMapClick,
  onUseMyLocation,
}: OrchardMapCanvasProps) {
  return (
    <div className="relative h-[600px] rounded-lg overflow-hidden border border-gray-200">
      <MapContainer center={[34.1, 74.8]} zoom={14} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <FeatureGroup>
          <EditControl
            position="topright"
            draw={{
              polygon: {
                allowIntersection: false,
                showArea: true,
              },
              polyline: {
                shapeOptions: { color: '#7c3aed' },
              },
              circle: false,
              marker: false,
              circlemarker: false,
              rectangle: false,
            }}
            edit={{
              edit: {
                selectedPathOptions: {
                  color: '#2563eb',
                },
              },
              remove: true,
            }}
            onCreated={event => {
              const layer = event.layer as L.Layer;
              const geojson = layer.toGeoJSON() as GeoJSON.Feature;
              const polygon = extractPolygon(geojson);
              if (polygon) {
                onBoundaryCreated(polygon);
                return;
              }
              const line = extractLine(geojson);
              if (line) {
                onLineCreated(line);
              }
            }}
            onEdited={event => {
              event.layers.eachLayer(layer => {
                const geojson = (layer as L.Layer).toGeoJSON() as GeoJSON.Feature;
                const polygon = extractPolygon(geojson);
                if (!polygon) return;
                onBoundaryEdited(polygon);
              });
            }}
            onDeleted={onBoundaryDeleted}
          />
        </FeatureGroup>
        {selectedBoundary && (
          <Polygon positions={toLatLngs(selectedBoundary)} pathOptions={{ color: '#16a34a', weight: 3 }}>
            {selectedOrchardName && (
              <Tooltip permanent direction="center" className="orchard-label">
                <div className="text-center font-semibold">
                  <div className="text-sm">{selectedOrchardName}</div>
                  <div className="text-xs text-green-700">🌳 {treeCount || 0} trees</div>
                </div>
              </Tooltip>
            )}
          </Polygon>
        )}
        {draftBoundary && <Polygon positions={toLatLngs(draftBoundary)} pathOptions={{ color: '#2563eb' }} />}
        {orchardLines.map(line => {
          const geometry = line.line_geojson as GeoJSON.LineString;
          if (!geometry?.coordinates) return null;
          return <Polyline key={line.id} positions={lineToLatLngs(geometry)} pathOptions={{ color: '#7c3aed' }} />;
        })}
        {orchardTreePoints.map(point => {
          const coords = point.location_geojson as GeoJSON.Point;
          const [lng, lat] = coords?.coordinates || [0, 0];
          return <Marker key={point.id} position={[lat, lng]} icon={treeIcon} />;
        })}
        <MapClickHandler enabled={addingTree} onPoint={onMapClick} />
        <MapFocus coords={focusLocation} />
        <MapLocator onLocate={onUseMyLocation} />
      </MapContainer>
    </div>
  );
}
