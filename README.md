# refuel
Create mbtiles of vector tiles from GeoJSON tiles online, using mokuroku.csv.gz

## Background
This is a preliminary experiment. 

## Install
```console
$ git clone git@github.com:hfu/refuel.git
$ cd refuel
$ npm install
```

## Usage
```console
$ npm run refuel 
$ tile-join -o experimental.mbtiles *.mbtiles
```
You need to have [tippecanoe](https://github.com/mapbox/tippecanoe) installed to run tile-join.

package.json and batch.js explains the detail of the processing. In the case of large scale tileset, you may need to run the commands one by one. 

### index.js
index.js is the script to download GeoJSON vector tiles, convert them to vector tiles, and the store the vector tile to a line of [headless serialtiles](https://github.com/hfu/headless-serialtiles-spec).

The basic usage is:
```console
$ node index.js fgd
# this will download experimental_fgd tiles and convert them.
```

This will have a long-lasting connection to mokuroku.csv.gz. Therefore, in the case of large tileset, you may want to download mokuroku.csv.gz beforehand to avoid timeout to the connection to mokuroku.csv.gz.

If you have fgd.mokuroku which is a copy of https://maps.gsi.go.jp/xyz/experimental_fgd/mokuroku.csv.gz, index.js can take the mokuroku as a second parameter. So, you can do as:
```console
$ node index.js fgd fgd.mokuroku
```

### hst2mbtiles.js
hst2mbtiles.js is a script to create mbtiles from hst file. This is a product of a separate project called [hst2mbtiles](https://github.com/hfu/hst2mbtiles).

index.js and hst2mbtiles can be piped, or the stored and the redirected.

## See also
### Technical elements
- [binarian](https://github.com/hfu/binarian) is the basic code to convert a GeoJSON tile to vector tile.
- [stratify-spec](https://github.com/hfu/stratify-spec) is the specification to write a configuration for assigning a vector tile layer to a GeoJSON feature. This is necessary and data-dependent configuration when converting GeoJSON to vector tile.
- [mokuroku-stream](https://github.com/hfu/mokuroku-stream) is the basic code to get tile numbers from a mokuroku.csv.gz.
- [hst2mbtiles](https://github.com/hfu/hst2mbtiles) is a tool to convert [headless serialtiles](https://github.com/hfu/headless-serialtiles-spec) to mbtiles.
