import { serialize } from "serializr"
import { emptySong } from "../song/SongFactory"
import { NoteEvent } from "../track"
import Track from "../track/Track"
import { songFromMidi, songToMidi } from "./midiConversion"

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
    const note = song.tracks[1].addEvent<NoteEvent>({
      type: "channel",
      subtype: "note",
      noteNumber: 57,
      tick: 960,
      velocity: 127,
      duration: 240,
    })
    song.tracks.forEach(reassignIDs)
    const bytes = songToMidi(song)
    const song2 = songFromMidi(bytes)
    song2.filepath = song.filepath // filepath will not be serialized
    expect(serialize(song2)).toStrictEqual(serialize(song))
  })
})
