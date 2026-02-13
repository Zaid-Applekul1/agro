import { useMemo, useState, useEffect, type FormEvent } from 'react';
import * as toGeoJSON from '@tmcw/togeojson';
import * as turf from '@turf/turf';
import { useFields } from '../hooks/useFields';
import { useOrchards } from '../hooks/useOrchards';
import { useTrees } from '../hooks/useTrees';
import { OrchardBoundaryPanel } from './OrchardBoundaryPanel';
import { OrchardMapCanvas } from './OrchardMapCanvas';
import { OrchardTreeTaggingPanel } from './OrchardTreeTaggingPanel';

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

const validatePolygon = (polygon: GeoJSON.Polygon) => {
  if (polygon.coordinates[0].length < 4) {
    return 'Polygon must have at least 3 points.';
  }
  const kinks = turf.kinks(polygon);
  if (kinks.features.length > 0) {
    return 'Boundary has self-intersections.';
  }
  return null;
};

const computeArea = (polygon: GeoJSON.Polygon) => {
  const areaSqm = turf.area(polygon);
  return {
    hectares: areaSqm / 10000,
    acres: areaSqm / 4046.8564224,
  };
};

export function OrchardMap() {
  const { fields } = useFields();
  const { trees } = useTrees();
  const { orchards, treePoints, lines, loading, error, addOrchard, addTreePoint, addLine } = useOrchards();

  const [selectedOrchardId, setSelectedOrchardId] = useState<string | null>(null);
  const [draftBoundary, setDraftBoundary] = useState<GeoJSON.Polygon | null>(null);
  const [draftArea, setDraftArea] = useState<{ hectares: number; acres: number } | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [addingTree, setAddingTree] = useState(false);
  const [pendingPoint, setPendingPoint] = useState<[number, number] | null>(null);
  const [focusLocation, setFocusLocation] = useState<[number, number] | null>(null);

  const [orchardForm, setOrchardForm] = useState({
    name: '',
    fieldId: '',
  });

  const [treeForm, setTreeForm] = useState({
    variety: 'Apple',
    season: 'Summer',
    managementType: 'tree',
    treeBlockId: '',
  });

  const selectedOrchard = useMemo(() => {
    if (!selectedOrchardId && orchards.length > 0) return orchards[0];
    return orchards.find(orchard => orchard.id === selectedOrchardId) || null;
  }, [selectedOrchardId, orchards]);

  const selectedBoundary = useMemo(() => {
    if (!selectedOrchard) return null;
    return extractPolygon({ type: 'Feature', geometry: selectedOrchard.boundary_geojson as any } as GeoJSON.Feature);
  }, [selectedOrchard]);

  // Get unique varieties from tree blocks for the selected field
  const availableVarieties = useMemo(() => {
    const fieldId = selectedOrchard?.field_id;
    if (!fieldId) return [];
    return Array.from(new Set(trees
      .filter(t => t.field_id === fieldId)
      .map(t => t.variety)));
  }, [trees, selectedOrchard]);

  const orchardTreePoints = useMemo(() => {
    if (!selectedOrchard) return [];
    return treePoints.filter(point => point.orchard_id === selectedOrchard.id);
  }, [selectedOrchard, treePoints]);

  const totalTreeCount = selectedOrchard?.tree_count ?? orchardTreePoints.length;

  // Auto-select first orchard when orchards load
  useEffect(() => {
    if (!selectedOrchardId && orchards.length > 0) {
      setSelectedOrchardId(orchards[0].id);
    }
  }, [orchards, selectedOrchardId]);

  const handleSelectOrchard = (id: string) => {
    setSelectedOrchardId(id);
    const orchard = orchards.find(item => item.id === id);
    if (!orchard) return;
    const polygon = extractPolygon({ type: 'Feature', geometry: orchard.boundary_geojson as any } as GeoJSON.Feature);
    if (!polygon) return;
    const centroid = turf.centroid(polygon as any);
    const [lng, lat] = centroid.geometry.coordinates;
    setFocusLocation([lat, lng]);
  };

  const handleFocusTree = (point: { location_geojson: unknown }) => {
    const coords = point.location_geojson as GeoJSON.Point;
    const [lng, lat] = coords?.coordinates || [0, 0];
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    setFocusLocation([lat, lng]);
  };

  const handleUseMyLocation = (coords: [number, number]) => {
    setFocusLocation(coords);
    handleTreePoint(coords);
  };

  const handleBoundaryUpdate = (polygon: GeoJSON.Polygon) => {
    const error = validatePolygon(polygon);
    if (error) {
      setMapError(error);
      setDraftBoundary(null);
      setDraftArea(null);
      return;
    }
    setMapError(null);
    setDraftBoundary(polygon);
    setDraftArea(computeArea(polygon));
  };

  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const doc = new DOMParser().parseFromString(text, 'text/xml');
        const geojson = toGeoJSON.kml(doc);
        const feature = geojson.features.find(item => item.geometry?.type === 'Polygon' || item.geometry?.type === 'MultiPolygon');

        if (!feature) {
          setMapError('No polygon boundary found in the KML file.');
          return;
        }

        const polygon = extractPolygon(feature);
        if (!polygon) {
          setMapError('Unsupported geometry in KML file.');
          return;
        }

        handleBoundaryUpdate(polygon);
      } catch (err) {
        setMapError(err instanceof Error ? err.message : 'Failed to read KML file.');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveOrchard = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!orchardForm.name.trim()) {
      setFormError('Orchard name is required.');
      return;
    }

    if (!draftBoundary || !draftArea) {
      setFormError('Please draw or upload an orchard boundary first.');
      return;
    }

    setFormSubmitting(true);
    const { data, error: submitError } = await addOrchard({
      name: orchardForm.name.trim(),
      field_id: orchardForm.fieldId || null,
      boundary_geojson: draftBoundary as any,
      area_hectares: Number(draftArea.hectares.toFixed(4)),
      area_acres: Number(draftArea.acres.toFixed(4)),
    });
    setFormSubmitting(false);

    if (submitError) {
      setFormError(submitError);
      return;
    }

    // Auto-select the newly created orchard
    if (data) {
      setSelectedOrchardId(data.id);
    }

    setDraftBoundary(null);
    setDraftArea(null);
    setOrchardForm({ name: '', fieldId: '' });
  };

  const handleTreePoint = (coords: [number, number]) => {
    if (!selectedBoundary) {
      setMapError('Select an orchard before tagging trees.');
      return;
    }

    const point = turf.point([coords[1], coords[0]]);
    const inside = turf.booleanPointInPolygon(point, selectedBoundary);
    if (!inside) {
      setMapError('Tree point must be inside the orchard boundary.');
      return;
    }

    setMapError(null);
    setPendingPoint(coords);
  };

  const handleLineCreated = async (line: GeoJSON.LineString) => {
    if (!selectedOrchard) {
      setMapError('Select an orchard before adding line features.');
      return;
    }

    const { error: submitError } = await addLine({
      orchard_id: selectedOrchard.id,
      line_type: 'row',
      line_geojson: line as any,
      notes: null,
    });

    if (submitError) {
      setMapError(submitError);
    }
  };

  const handleTreeSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedOrchard || !pendingPoint) return;

    setFormSubmitting(true);
    const { error: submitError } = await addTreePoint({
      orchard_id: selectedOrchard.id,
      tree_block_id: treeForm.treeBlockId || null,
      variety: treeForm.variety.trim(),
      season: treeForm.season.trim(),
      management_type: treeForm.managementType,
      location_geojson: {
        type: 'Point',
        coordinates: [pendingPoint[1], pendingPoint[0]],
      } as any,
    });
    setFormSubmitting(false);

    if (submitError) {
      setFormError(submitError);
      return;
    }

    setPendingPoint(null);
    setAddingTree(false);
    setTreeForm({ variety: 'Apple', season: 'Summer', managementType: 'tree', treeBlockId: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading orchards: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-xl font-bold text-gray-900">🗺️ Orchard Mapping & Tree Tagging</h3>
        <p className="text-sm text-gray-600 mt-1">Draw boundaries, upload KML files, and tag trees with GPS coordinates</p>
      </div>

      {mapError && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          {mapError}
        </div>
      )}

      {/* Map - Full Width */}
      <div className="w-full">
        <OrchardMapCanvas
          selectedBoundary={selectedBoundary}
          draftBoundary={draftBoundary}
          orchardTreePoints={orchardTreePoints}
          orchardLines={lines.filter(line => line.orchard_id === selectedOrchard?.id)}
          addingTree={addingTree}
          focusLocation={focusLocation}
          selectedOrchardName={selectedOrchard?.name}
          treeCount={totalTreeCount}
          onBoundaryCreated={handleBoundaryUpdate}
          onBoundaryEdited={handleBoundaryUpdate}
          onBoundaryDeleted={() => {
            setDraftBoundary(null);
            setDraftArea(null);
          }}
          onLineCreated={handleLineCreated}
          onMapClick={handleTreePoint}
          onUseMyLocation={handleUseMyLocation}
        />
      </div>

      {/* Control Panels - Below Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrchardBoundaryPanel
          onUpload={handleUpload}
          onSubmit={handleSaveOrchard}
          orchardForm={orchardForm}
          onFormChange={values => setOrchardForm({ ...orchardForm, ...values })}
          fieldOptions={fields.map(field => ({ id: field.id, name: field.name }))}
          draftArea={draftArea}
          formError={formError}
          formSubmitting={formSubmitting}
        />
        <OrchardTreeTaggingPanel
          addingTree={addingTree}
          onToggleTagging={() => setAddingTree(!addingTree)}
          treePoints={orchardTreePoints}
          totalTrees={totalTreeCount}
          onFocusTree={handleFocusTree}
          onUseMyLocation={handleUseMyLocation}
          selectedOrchardName={selectedOrchard?.name}
          selectedOrchardFieldName={fields.find(f => f.id === selectedOrchard?.field_id)?.name}
        />
      </div>

      {/* Saved Orchards - Full Width Below */}
      <div className="bg-white border-2 border-gray-300 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">📍 Your Mapped Orchards</h3>
            <p className="text-xs text-gray-500 mt-1">Click an orchard to view on map and tag trees</p>
          </div>
          <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-semibold">
            {orchards.length} {orchards.length === 1 ? 'Orchard' : 'Orchards'}
          </span>
        </div>
        {orchards.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600 font-medium">No orchards mapped yet</p>
            <p className="text-sm text-gray-500 mt-1">Draw a boundary on the map or upload a KML file to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {orchards.map(orchard => {
              const linkedField = fields.find(f => f.id === orchard.field_id);
              const treeCountForOrchard = treePoints.filter(point => point.orchard_id === orchard.id).length;
              return (
                <button
                  key={orchard.id}
                  onClick={() => handleSelectOrchard(orchard.id)}
                  className={`text-left border-2 rounded-xl p-4 transition-all hover:shadow-md ${
                    orchard.id === selectedOrchard?.id 
                      ? 'border-green-500 bg-green-50 shadow-lg' 
                      : 'border-gray-200 hover:border-green-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-gray-900 text-base">{orchard.name}</h4>
                    {orchard.id === selectedOrchard?.id && (
                      <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">Active</span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">🌍 Area:</span>
                      <span>{orchard.area_hectares?.toFixed(2)} ha ({orchard.area_acres?.toFixed(2)} ac)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">🌳 Trees:</span>
                      <span className="font-bold text-green-700">{treeCountForOrchard} tagged</span>
                    </div>
                    {linkedField && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-blue-600 font-medium">🔗 Linked: {linkedField.name}</p>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {pendingPoint && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setPendingPoint(null)}></div>
          <div className="relative bg-white rounded-lg max-w-md w-full shadow-xl z-10">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Add Tree Tag</h3>
                <button onClick={() => setPendingPoint(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form className="space-y-4" onSubmit={handleTreeSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Variety</label>
                  <select
                    value={treeForm.variety}
                    onChange={event => setTreeForm({ ...treeForm, variety: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="Apple">Apple</option>
                    <option value="Ambri">Ambri</option>
                    <option value="Royal Delicious">Royal Delicious</option>
                    <option value="Red Delicious">Red Delicious</option>
                    <option value="Golden Delicious">Golden Delicious</option>
                    <option value="Gala">Gala</option>
                    <option value="Fuji">Fuji</option>
                    {availableVarieties.filter(v => !['Apple', 'Ambri', 'Royal Delicious', 'Red Delicious', 'Golden Delicious', 'Gala', 'Fuji'].includes(v)).map(variety => (
                      <option key={variety} value={variety}>{variety}</option>
                    ))}
                  </select>
                  {availableVarieties.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">Varieties available in this field&apos;s tree blocks</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link to Tree Block (optional)</label>
                  <select
                    value={treeForm.treeBlockId}
                    onChange={event => setTreeForm({ ...treeForm, treeBlockId: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">No tree block link</option>
                    {trees
                      .filter(tree => tree.field_id === selectedOrchard?.field_id)
                      .map(tree => (
                        <option key={tree.id} value={tree.id}>
                          {tree.variety} - Row {tree.row_number} ({tree.tree_count} trees)
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
                  <input
                    type="text"
                    value={treeForm.season}
                    onChange={event => setTreeForm({ ...treeForm, season: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Management Type</label>
                  <select
                    value={treeForm.managementType}
                    onChange={event => setTreeForm({ ...treeForm, managementType: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="tree">Tree Management</option>
                    <option value="field">Field Management</option>
                  </select>
                </div>
                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-700">
                    {formError}
                  </div>
                )}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-60"
                  >
                    {formSubmitting ? 'Saving...' : 'Save Tag'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingPoint(null)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
