import { serialize } from "serializr"
import { emptySong, songFromMidi } from "../song/SongFactory"
import Track from "../track/Track"
import { write } from "./MidiFileWriter"

// id for each event will not be serialized in midi file
// we change ids sorted by order in events array
const reassignIDs = (track: Track) => {
  track.events.forEach((e, i) => {
    track.events[i].id = i
  })
}

describe("SongFile", () => {
  it("write and read", () => {
    const song = emptySong()
    const note = song.tracks[1].addEvent({
      type: "channel",
      subtype: "note",
      noteNumber: 57,
      tick: 960,
      velocity: 127,
      duration: 240,
    })
    song.tracks.forEach(reassignIDs)
    const bytes = write(song.tracks)
    const song2 = songFromMidi(bytes)
    song2.filepath = song.filepath // filepath will not be serialized
    expect(serialize(song2)).toStrictEqual(serialize(song))
  })
})
