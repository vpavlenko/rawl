const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.resolve(__dirname, '../..');
const artifact = require.resolve('librawl/midi-output-worklet.js');
const destination = path.join(root, 'public/midi-output-worklet.js');
const source = fs.readFileSync(artifact);
const current = fs.readFileSync(destination);
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const baseline = 'c0d987933f339e99de72ad77b79f75fffb7dd82b6800cb2558387d6df88a6e13';
if (digest(current) !== baseline && !current.equals(source)) throw new Error('Rawl output worklet differs from reviewed source.');
if (!current.equals(source)) {
  if (process.argv.includes('--check')) throw new Error('Rawl output worklet needs synchronization.');
  fs.writeFileSync(destination, source);
}

const qanun = require('librawl/soundfonts/qanun.json');
const qanunBank = fs.readFileSync(require.resolve('librawl/soundfonts/qanun.sf2'));
if (qanunBank.length !== qanun.bytes || digest(qanunBank) !== qanun.sha256) {
  throw new Error('The librawl qanun SoundFont failed its checksum.');
}

function stageQanunSoundFont(directory) {
  fs.writeFileSync(path.join(directory, qanun.file), qanunBank);
}

module.exports = { stageQanunSoundFont };
if (require.main === module) console.log('librawl output worklet and qanun SoundFont verified');
