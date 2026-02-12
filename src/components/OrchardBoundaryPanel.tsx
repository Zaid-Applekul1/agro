import { Upload } from 'lucide-react';

type Orchard = {
  id: string;
  name: string;
  area_hectares: number | null;
  tree_count: number | null;
  field_id: string | null;
};

type OrchardBoundaryPanelProps = {
  onUpload: (file: File) => void;
  onSubmit: (event: React.FormEvent) => void;
  orchardForm: { name: string; fieldId: string };
  onFormChange: (values: { name?: string; fieldId?: string }) => void;
  fieldOptions: { id: string; name: string }[];
  draftArea: { hectares: number; acres: number } | null;
  formError: string | null;
  formSubmitting: boolean;
};

export function OrchardBoundaryPanel({
  onUpload,
  onSubmit,
  orchardForm,
  onFormChange,
  fieldOptions,
  draftArea,
  formError,
  formSubmitting,
}: OrchardBoundaryPanelProps) {
  return (
    <div className="space-y-4 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-5 shadow-sm">
      <div className="mb-2">
        <h3 className="text-base font-bold text-gray-900">🗺️ Draw or Upload Boundary</h3>
        <p className="text-xs text-gray-500 mt-1">Create GPS-mapped orchards independently or link to existing fields</p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <label className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 cursor-pointer shadow-sm">
          <Upload size={16} />
          <span className="font-medium">Upload KML</span>
          <input
            type="file"
            accept=".kml"
            onChange={event => {
              const file = event.target.files?.[0];
              if (file) onUpload(file);
            }}
            className="hidden"
          />
        </label>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-800">Save Orchard Boundary</h4>
        <form className="mt-3 space-y-3" onSubmit={onSubmit}>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Orchard Name</label>
            <input
              type="text"
              value={orchardForm.name}
              onChange={event => onFormChange({ name: event.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Link to Field (optional)</label>
            <select
              value={orchardForm.fieldId}
              onChange={event => onFormChange({ fieldId: event.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">🌍 Stand-alone orchard (no field link)</option>
              {fieldOptions.map(field => (
                <option key={field.id} value={field.id}>🔗 Link to: {field.name}</option>
              ))}
            </select>
          </div>
          {draftArea && (
            <div className="text-xs text-gray-600">
              Area: {draftArea.hectares.toFixed(2)} ha / {draftArea.acres.toFixed(2)} ac
            </div>
          )}
          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-700">
              {formError}
            </div>
          )}
          <button
            type="submit"
            disabled={formSubmitting}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-60"
          >
            {formSubmitting ? 'Saving...' : 'Save Orchard'}
          </button>
        </form>
      </div>
    </div>
  );
};

