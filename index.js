const byline = require('byline')
const fetch = require('node-fetch')
const zlib = require('zlib')
const vtpbf = require('vt-pbf')
const geojsonvt = require('geojson-vt')

if (process.argv.length !== 3) {
  console.log('usage: node index.js nrpt | node hst2mbtiles.js nrpt.mbtiles')
  process.exit()
}
const t = process.argv[2]
const stratify = require(`./stratify/${t}.js`)
let count = 0

const refuel = (t, z, x, y, ttl) => {
  fetch(`https://maps.gsi.go.jp/xyz/experimental_${t}/${z}/${x}/${y}.geojson`)
    .then(res => res.json())
    .then(json => {
      // console.log(JSON.stringify(json))
      let o = stratify(json)
      // console.log(JSON.stringify(o))
      for (let i in o) {
        o[i] = geojsonvt(o[i], {maxZoom: 18}).getTile(z, x, y)
      }
      // if (!o[t]) return
      console.log(JSON.stringify({
        z: z,
        x: x,
        y: y,
        buffer: zlib.gzipSync(vtpbf.fromGeojsonVt(o, {version: 2}))
          .toString('base64')
      }))
      count++
    })
    .catch(err => {
      // console.error(err)
      ttl--
      if (ttl == -1) return
      console.error(`#${count}: retrying ttl=${ttl} ${t}/${z}/${x}/${y}`)
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
      refuel(t, z, x, y, 20)
    })
  })
