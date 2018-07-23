const byline = require('byline')
const fs = require('fs')
const fetch = require('node-fetch')
const zlib = require('zlib')
const vtpbf = require('vt-pbf')
const geojsonvt = require('geojson-vt')
const moment = require('moment')

if (process.argv.length !== 3 && process.argv.length !== 4) {
  console.log('usage: node index.js nrpt {mokuroku.csv.gz}| node hst2mbtiles.js nrpt.mbtiles')
  process.exit()
}
const t = process.argv[2]
const stratify = require(`./stratify/${t}.js`)
let count = 0
let para = 0
const PARAMAX = 300 // 60
const TTL = 20

const show = (t, z, x, y) => {
  console.error(`${moment().format()}\t#${count}(${para})\t${t}/${z}/${x}/${y}`)
}

const refuel = (t, z, x, y, ttl, s) => {
  para++
  if (para > PARAMAX) s.pause()
  fetch(`https://maps.gsi.go.jp/xyz/experimental_${t}/${z}/${x}/${y}.geojson`)
    .then(
      res => res.json(), 
      reason => { 
        console.error('** json parse error') 
        console.error(reason) 
	para--
      }
    )
    .then(
      json => {
        let o = stratify(json)
        for (let i in o) {
          o[i] = geojsonvt(
	    o[i], 
	    {maxZoom: 18, buffer: 64}
	  ).getTile(z, x, y)
        }
        try {
          console.log(JSON.stringify({
            z: z,
            x: x,
            y: y,
            buffer: zlib.gzipSync(vtpbf.fromGeojsonVt(o, {version: 2}))
              .toString('base64')
          }))
          count++
        } catch (e) {
	  console.error('** geojsonvt error')
          console.error(e)
        }
        para--
        if (para <= PARAMAX / 2) s.resume()
        if (count % 5000 === 0) show(t, z, x, y)
      },
      reason => {
        console.error('** network error')
        s.resume()
	ttl--
	para--
	if (ttl === -1) {
	  console.error(`GAVE UP ${t}/${z}/${x}/${y}`)
	} else {
          console.error(err)
          console.error(
            `#${count}: ${moment().format()} retrying ttl=${ttl} ` + 
	    `${t}/${z}/${x}/${y}`
          )
	  setTimeout(() => {
            refuel(t, z, x, y, ttl, s)
	  }, 5000)
        }
      }
    )
  }


const work = (stream) => {
  const s = byline(stream.pipe(zlib.createGunzip()))
  s.on('data', line => {
    zxy = line.toString().split('/').map(v => parseInt(v))
    if (zxy.length !== 3) return
    const [z, x, y] = zxy
    if (isNaN(z)) return
    refuel(t, z, x, y, TTL, s)
  })
}

if (process.argv.length === 3) {
  fetch(`https://maps.gsi.go.jp/xyz/experimental_${t}/mokuroku.csv.gz`)
    .then(res => {
      work(res.body)
    })
} else {
  work(fs.createReadStream(process.argv[3]))
}

/*
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
  }
  */
