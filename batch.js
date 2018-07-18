// const ts = 'rdcl railcl rvrcl anno nrpt nnfpt pfpt jhj fgd dem10b dem5a landformclassification1 landformclassification2'.split(' ')
const ts = 'rdcl railcl rvrcl anno nrpt nnfpt pfpt jhj dem10b dem5a landformclassification1 landformclassification2'.split(' ')

for (let t of ts) {
  console.log(`node index.js ${t} | node hst2mbtiles.js ${t}.mbtiles`)
}
