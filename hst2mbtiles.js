const MBTiles = require('@mapbox/mbtiles')
const readline = require('readline')

if (process.argv.length !== 3) {
  console.log('usage: cat some.hst | node hst2mbtiles.js some.mbtiles')
  process.exit()
}
const path = process.argv[2]

const writeTiles = mbtiles => {
  readline.createInterface({
    input: process.stdin, output: process.stdout, terminal: false
  }).on('line', line => {
    const r = JSON.parse(line)
    const buffer = Buffer.from(r.buffer, 'base64')
    mbtiles.putTile(r.z, r.x, r.y, buffer, err => {
      if (err) throw err
    })
  }).on('close', () => {
    mbtiles.stopWriting(err => {
      if (err) throw err
    })
  })
}

new MBTiles(path, (err, mbtiles) => {
  if (err) throw err
  mbtiles.startWriting(err => {
    if (err) throw err
    writeTiles(mbtiles)
  })
})
