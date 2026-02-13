declare module '@tmcw/togeojson' {
  const toGeoJSON: {
    kml: (doc: Document) => GeoJSON.FeatureCollection;
  };
  export = toGeoJSON;
}
