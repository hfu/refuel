module.exports = geojson => {
  r = {}
  for (f of geojson.features) {
    if (r[f.properties.class]) {
      r[f.properties.class].features.push(f)
    } else {
      r[f.properties.class] = {
        type: 'FeatureCollection',
        features: [f]
      }
    }
  }
  return r
}
