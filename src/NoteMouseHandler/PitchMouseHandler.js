import { PitchBendMidiEvent } from "../midi/MidiEvent"

export default class VelocityMouseHandler {
  constructor(track) {
    this.track = track
  }

  changeValue(items, value) {
    console.log(items, value)
  }

  onMouseDown = e => {
    const { transform, track } = this
    if (!transform) {
      throw new Error("this.transform をセットすること")
    }

    const rect = e.currentTarget.getBoundingClientRect()

    function calcValue(e) {
      return Math.round(Math.max(0, Math.min(1, (1 - (e.clientY - rect.top) / rect.height))) * 0x4000)
    }

    const items = e.items

    if (items.length === 0) {
      // insert new pitchbend event
      const value = calcValue(e)
      const event = new PitchBendMidiEvent(0, value)
      event.tick = transform.getTick(e.local.x)
      track.addEvent(event)
      return
    }

    this.changeValue(items, calcValue(e))

    const onMouseMove = e => {
      this.changeValue(items, calcValue(e))
    }

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }

  onMouseMove() {
  }

  onMouseUp() {
  }
}
