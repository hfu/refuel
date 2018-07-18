const byline = require('byline')
const fetch = require('node-fetch')
const zlib = require('zlib')
const vtpbf = require('vt-pbf')
const geojsonvt = require('geojson-vt')
// const stratify = require('./stratify.js')

// for debug
const VectorTile = require('@mapbox/vector-tile').VectorTile
const Pbf = require('pbf')

if (process.argv.length !== 3) {
  console.log('usage: node index.js nrpt | node hst2mbtiles.js nrpt.mbtiles')
  process.exit()
}
const t = process.argv[2]

const refuel = (t, z, x, y, ttl) => {
  fetch(`https://maps.gsi.go.jp/xyz/experimental_${t}/${z}/${x}/${y}.geojson`)
    .then(res => res.json())
    .then(json => {
      // console.log(JSON.stringify(json))
      let o = {}
      o[t] = geojsonvt(json, {maxZoom: 18}).getTile(z, x, y)
      if (!o[t]) return
      /*
      const vt = new VectorTile(new Pbf(
        vtpbf.fromGeojsonVt(o, {version: 1}))) /////
      console.log(JSON.stringify(vt))
      console.log(o)
      */
      console.log(JSON.stringify({
        z: z,
        x: x,
        y: y,
        buffer: zlib.gzipSync(vtpbf.fromGeojsonVt(o, {version: 1})) ////
          .toString('base64')
      }))
    })
    .catch(err => {
      console.error(err)
      ttl--
      console.error(`retrying ttl=${ttl} ${t}/${z}/${z}/${y}`)
      refuel(t, z, x, y, ttl)
    })
}

fetch(`https://maps.gsi.go.jp/xyz/experimental_${t}/mokuroku.csv.gz`)
  .then(res => {
    const s = byline(res.body.pipe(zlib.createGunzip()))
    s.on('data', line => {
      zxy = line.toString().split('/').map(v => parseInt(v))
      if (zxy.length !== 3) return
      const [z, x, y] = zxy
      if (isNaN(z)) return
      refuel(t, z, x, y, 10)
    })
  })
