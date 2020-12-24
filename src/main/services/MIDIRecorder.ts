import { makeObservable, observable, observe } from "mobx"
import { parseMessage } from "../../common/midi/parseMessage"
import Player from "../../common/player"
import Song from "../../common/song"
import { NoteEvent } from "../../common/track"

export class MIDIRecorder {
  private player: Player
  private recordedNotes: NoteEvent[] = []
  song: Song | null = null
  isRecording: boolean = false

  constructor(player: Player) {
    this.player = player

    makeObservable(this, {
      isRecording: observable,
    })

    // extend duration while key press
    observe(player, "position", () => {
      if (!this.isRecording) {
        return
      }

      const track = this.song?.selectedTrack
      if (track === undefined) {
        return
      }

      const tick = this.player.position

      this.recordedNotes.forEach((n) => {
        track.updateEvent<NoteEvent>(n.id, {
          duration: tick - n.tick,
        })
      })
    })

    observe(this, "isRecording", () => {
      this.recordedNotes = []
    })
  }

  onMessage(e: WebMidi.MIDIMessageEvent) {
    if (!this.isRecording) {
      return
    }

    const track = this.song?.selectedTrack
    if (track === undefined) {
      return
    }

    const tick = this.player.position

    const message = parseMessage(e.data)

    if (message.subtype === "noteOn") {
      const note = track.addEvent<NoteEvent>({
        type: "channel",
        subtype: "note",
        noteNumber: message.noteNumber,
        tick,
        velocity: message.velocity,
        duration: 0,
      })
      this.recordedNotes.push(note)
    }

    if (message.subtype === "noteOff") {
      this.recordedNotes = this.recordedNotes.filter(
        (n) => n.noteNumber !== message.noteNumber
      )
    }
  }
}
