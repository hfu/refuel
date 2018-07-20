const byline = require('byline')
const fetch = require('node-fetch')
const zlib = require('zlib')
const vtpbf = require('vt-pbf')
const geojsonvt = require('geojson-vt')
const moment = require('moment')

if (process.argv.length !== 3) {
  console.log('usage: node index.js nrpt | node hst2mbtiles.js nrpt.mbtiles')
  process.exit()
}
const t = process.argv[2]
const stratify = require(`./stratify/${t}.js`)
let count = 0
let para = 0
const PARAMAX = 30

const show = (t, z, x, y) => {
  console.error(`${moment().format()}\t#${count}(${para})\t${t}/${z}/${x}/${y}`)
}

const refuel = (t, z, x, y, ttl, s) => {
  para++
  if (para > PARAMAX) s.pause()
  fetch(`https://maps.gsi.go.jp/xyz/experimental_${t}/${z}/${x}/${y}.geojson`)
    .then(res => res.json())
    .then(json => {
      // console.log(JSON.stringify(json))
      let o = stratify(json)
      // console.log(JSON.stringify(o))
      for (let i in o) {
        o[i] = geojsonvt(
	  o[i], 
	  {maxZoom: 18, buffer: 64}
	).getTile(z, x, y)
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
      para--
      if (para <= PARAMAX / 2) s.resume()
      if (count % 5000 === 0) show(t, z, x, y)
    })
    .catch(err => {
      // console.error(err)
      ttl--
      if (ttl == -1) {
        console.error(`GAVE UP ${t}/${z}/${x}/${y}`)
        para--
        if (para <= PARAMAX / 2) s.resume()
        return
      }
      console.error(
        `#${count}: ${moment().format()} retrying ttl=${ttl} ` + 
	`${t}/${z}/${x}/${y}`
      )
      refuel(t, z, x, y, ttl, s)
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
      refuel(t, z, x, y, 20, s)
    })
    // s.on('pause', () => { process.stderr.write('p') })
    // s.on('resume', () => { process.stderr.write('r') })
  })
