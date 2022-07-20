import * as fs from "fs"
import { AnyEvent } from "midifile-ts"
import * as path from "path"
import { serialize } from "serializr"
import { emptySong } from "../song/SongFactory"
import { NoteEvent } from "../track"
import Track from "../track/Track"
import { songFromMidi, songToMidi, songToMidiEvents } from "./midiConversion"

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
  describe("songToMidiEvents", () => {
    const expectEveryTrackHaveEndOfTrackEvent = (tracks: AnyEvent[][]) => {
      for (const track of tracks) {
        expect(
          track.findIndex(
            (e) => e.type === "meta" && e.subtype === "endOfTrack"
          )
        ).toBe(track.length - 1)
      }
    }

    const openFile = (fileName: string): AnyEvent[][] => {
      const song = songFromMidi(
        fs.readFileSync(path.join(__dirname, "../../../testdata/", fileName))
          .buffer
      )
      return songToMidiEvents(song)
    }

    describe("format 1", () => {
      const rawTracks = openFile("tracks.mid")

      it("every tracks have endOfTrack event", () => {
        expect(rawTracks.length).toBe(18)
        expectEveryTrackHaveEndOfTrackEvent(rawTracks)
      })
    })

    describe("format 0", () => {
      const rawTracks = openFile("format0.mid")

      it("every tracks have endOfTrack event", () => {
        expect(rawTracks.length).toBe(17)
        expectEveryTrackHaveEndOfTrackEvent(rawTracks)
      })
    })
  })
})
