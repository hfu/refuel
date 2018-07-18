# refuel
Create mbtiles of vector tiles from GeoJSON tiles online, using mokuroku.csv.gz

## Background
This is a preliminary experiment. 

## Install
```console
$ git clone git@github.com:hfu/refuel.git
$ cd refuel
```

## Usage
```console
$ node index.js experimental_landformclassification1 | node hst2mbtiles.js
```

## See also
### Technical elements
- [binarian](https://github.com/hfu/binarian) is the basic code to convert a GeoJSON tile to vector tile.
- [stratify-spec](https://github.com/hfu/stratify-spec) is the specification to write a configuration for assigning a vector tile layer to a GeoJSON feature. This is necessary and data-dependent configuration when converting GeoJSON to vector tile.
- [mokuroku-stream](https://github.com/hfu/mokuroku-stream) is the basic code to get tile numbers from a mokuroku.csv.gz.
- [hst2mbtiles](https://github.com/hfu/hst2mbtiles) is a tool to convert [headless serialtiles](https://github.com/hfu/headless-serialtiles-spec) to mbtiles.
