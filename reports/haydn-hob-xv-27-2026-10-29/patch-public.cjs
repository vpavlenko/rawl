const fs = require('fs'), path = require('path'), crypto = require('crypto');
const parser = require('../../node_modules/@babel/parser');
const traverse = require('../../node_modules/@babel/traverse').default;
const { SourceMapConsumer, SourceMapGenerator } = require('../../node_modules/source-map');
const release = '/private/tmp/rawl-haydn-release';
const slug = 'haydn-piano-trio-hob-xv-27-iii-finale-presto';
const assets = JSON.parse(fs.readFileSync(release + '/asset-manifest.json'));
const oldUrl = assets['main.js'], oldPath = oldUrl.split('?')[0];
const code = fs.readFileSync(release + oldPath, 'utf8');
if (code.includes(slug)) throw Error('Already installed');
const ast = parser.parse(code, { sourceType: 'script' });
const matches = [];
traverse(ast, { ObjectExpression(p) {
  if (p.node.properties.some(prop => prop.key?.name === 'slug' && prop.value?.value === 'haydn')) matches.push(p.node);
} });
if (matches.length !== 1) throw Error('Ambiguous Haydn corpus');
const array = matches[0].properties.find(prop => prop.key?.name === 'midis').value;
if (array.type !== 'ArrayExpression') throw Error('Expected MIDI array');
const pos = array.end - 1, insertion = ',' + JSON.stringify(slug);
let patched = code.slice(0, pos) + insertion + code.slice(pos);
const hash = crypto.createHash('sha256').update(patched.replace(/\n?\/\/# sourceMappingURL=.*$/, '')).digest('hex').slice(0, 8);
const newUrl = '/static/js/main.' + hash + '.js';
patched = patched.replace(/sourceMappingURL=[^\n]+/, 'sourceMappingURL=' + path.basename(newUrl) + '.map');
parser.parse(patched, { sourceType: 'script' });
const consumer = new SourceMapConsumer(JSON.parse(fs.readFileSync(release + assets['main.js.map'].split('?')[0])));
const gen = new SourceMapGenerator({ file: path.basename(newUrl) });
const prefix = code.slice(0, pos), line = prefix.split('\n').length, column = prefix.length - prefix.lastIndexOf('\n') - 1;
consumer.eachMapping(m => {
  const item = { generated: { line: m.generatedLine, column: m.generatedColumn + (m.generatedLine === line && m.generatedColumn >= column ? insertion.length : 0) } };
  if (m.originalLine !== null && m.source !== null) {
    item.original = { line: m.originalLine, column: m.originalColumn }; item.source = m.source;
    if (m.name) item.name = m.name;
  }
  gen.addMapping(item);
});
for (const source of consumer.sources) {
  const text = consumer.sourceContentFor(source, true);
  if (text !== null) gen.setSourceContent(source, text);
}
const unpatched = patched.replace(insertion, '').replace('sourceMappingURL=' + path.basename(newUrl) + '.map', 'sourceMappingURL=' + path.basename(oldPath) + '.map');
if (unpatched !== code) throw Error('Unexpected changes outside catalog insertion');
const html = fs.readFileSync(release + '/index.html', 'utf8');
if (!html.includes(oldUrl)) throw Error('Unexpected HTML entrypoint');
fs.writeFileSync(release + newUrl, patched);
fs.writeFileSync(release + newUrl + '.map', gen.toString());
assets['main.js'] = newUrl; assets['main.js.map'] = newUrl + '.map';
fs.writeFileSync(release + '/asset-manifest.json', JSON.stringify(assets, null, 2));
fs.writeFileSync(release + '/index.html', html.replaceAll(oldUrl, newUrl));
const result = { oldUrl, newUrl, slug, insertedBytes: insertion.length, sha256: crypto.createHash('sha256').update(patched).digest('hex') };
fs.writeFileSync(__dirname + '/public-release.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
