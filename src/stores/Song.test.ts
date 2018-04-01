import assert from "assert"
import fs from "fs"
import path from "path"
import { serialize, deserialize } from "serializr"

import { read } from "../midi/MidiFileReader"
import Song from "./Song"
import { songFromMidi } from "./SongFactory"
import Track from "./Track"

describe("Song", () => {
  const midi = read(fs.readFileSync(path.join(__dirname, "../../testdata/tracks.mid")))
  const song = songFromMidi(midi)

  it("fromMidi", () => {
    assert(song != null)
    const { tracks } = song
    assert.equal(tracks.length, 18)

    assert.equal(tracks[0].isConductorTrack, true)
    assert.equal(!tracks[1].isConductorTrack, true)
    assert.equal(tracks[1].channel, 0)
    assert.equal(tracks[2].channel, 1)
    assert.equal(tracks[3].channel, 1)
    assert.equal(tracks[17].channel, 15)

    assert.equal(tracks[0].tempo, 128)
    assert.equal(tracks[2].volume, 100)
    assert.equal(tracks[2].pan, 1)
    assert.equal(tracks[2].programNumber, 29)
  })

  it("should be serializable", () => {
    const song = new Song()
    song.filepath = "abc"
    song.addTrack(new Track())
    const x = serialize(song)
    const s = deserialize(Song, x)
    assert.equal(s.filepath, "abc")
    assert.equal(s.tracks.length, 1)
  })
})
