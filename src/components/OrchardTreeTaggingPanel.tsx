import { AlertTriangle, MapPin } from 'lucide-react';

type TreePoint = {
  id: string;
  variety: string;
  season: string;
  management_type: string;
  location_geojson: unknown;
};

type OrchardTreeTaggingPanelProps = {
  addingTree: boolean;
  onToggleTagging: () => void;
  treePoints: TreePoint[];
  totalTrees: number;
  onFocusTree: (treePoint: TreePoint) => void;
  onUseMyLocation: (coords: [number, number]) => void;
  selectedOrchardName?: string;
  selectedOrchardFieldName?: string;
};

export function OrchardTreeTaggingPanel({
  addingTree,
  onToggleTagging,
  treePoints,
  totalTrees,
  onFocusTree,
  onUseMyLocation,
  selectedOrchardName,
  selectedOrchardFieldName,
}: OrchardTreeTaggingPanelProps) {
  const hasOrchard = !!selectedOrchardName;
  const isTaggingEnabled = hasOrchard && !addingTree;
  
  return (
    <div className="space-y-4 bg-gradient-to-br from-green-50 to-white border-2 border-green-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold text-gray-900">🌳 Tree Tagging</h3>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
          {totalTrees} tagged
        </span>
      </div>
      
      {selectedOrchardName && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs font-medium text-blue-900">Active Orchard</p>
          <p className="text-sm font-semibold text-blue-800">{selectedOrchardName}</p>
          {selectedOrchardFieldName && (
            <p className="text-xs text-blue-600 mt-1">📍 Field: {selectedOrchardFieldName}</p>
          )}
        </div>
      )}
      
      {!selectedOrchardName && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-amber-900">No Orchard Selected</p>
          <p className="text-xs text-amber-700 mt-1">
            Draw or upload a boundary on the map, then save it as an orchard to enable tree tagging.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-2">
        <button
          type="button"
          onClick={onToggleTagging}
          disabled={!hasOrchard}
          className={`w-full px-3 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
            addingTree 
              ? 'bg-green-600 text-white' 
              : !hasOrchard
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              : 'bg-white border border-green-200 text-green-700 hover:bg-green-50 font-medium'
          }`}
        >
          <MapPin size={16} />
          <span>
            {addingTree 
              ? 'Click map to tag tree' 
              : hasOrchard 
              ? 'Enable Tree Tagging' 
              : 'Draw & Save Orchard First'}
          </span>
        </button>
        {addingTree && (
          <div className="text-xs text-gray-600 text-center p-2 bg-green-50 border border-green-200 rounded-lg">
            💡 Click on the map or use the &quot;📍 Use My Location&quot; button (bottom-left) to tag a tree
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-800">Tree Tags</h4>
          <span className="text-xs text-gray-500">{totalTrees}</span>
        </div>
        <div className="mt-3 space-y-2 text-xs text-gray-600">
          {treePoints.length === 0 && <p>No tagged trees yet.</p>}
          {treePoints.slice(0, 5).map(point => (
            <button
              key={point.id}
              type="button"
              onClick={() => onFocusTree(point)}
              className="w-full text-left border border-gray-200 rounded-lg p-2 hover:bg-gray-50"
            >
              <p className="font-medium text-gray-900">{point.variety}</p>
              <p>{point.season} · {point.management_type}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
