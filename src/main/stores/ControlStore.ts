import { ControllerEvent, PitchBendEvent } from "midifile-ts"
import { computed, makeObservable, observable } from "mobx"
import { ControlSelection } from "../../common/selection/ControlSelection"
import {
  TrackEventOf,
  isControllerEventWithType,
  isPitchBendEvent,
} from "../../common/track"
import { ControlMode } from "../components/ControlPane/ControlPane"
import PianoRollStore from "./PianoRollStore"

export class ControlStore {
  controlMode: ControlMode = { type: "velocity" }
  selection: ControlSelection | null = null
  selectedEventIds: number[] = []

  constructor(private readonly pianoRollStore: PianoRollStore) {
    makeObservable(this, {
      controlMode: observable,
      selection: observable,
      selectedEventIds: observable,
      scrollLeft: computed,
      cursorX: computed,
      transform: computed,
      rulerStore: computed,
      selectedTrack: computed,
      quantizer: computed,
      mouseMode: computed,
      cursor: computed,
    })
  }

  get controlValueEvents(): (
    | TrackEventOf<ControllerEvent>
    | TrackEventOf<PitchBendEvent>
  )[] {
    const { controlMode } = this
    switch (controlMode.type) {
      case "velocity":
        throw new Error("don't use this method for velocity")
      case "pitchBend":
        return this.pianoRollStore.filteredEvents(isPitchBendEvent)
      case "controller":
        return this.pianoRollStore.filteredEvents(
          isControllerEventWithType(controlMode.controllerType)
        )
    }
  }

  get scrollLeft() {
    return this.pianoRollStore.scrollLeft
  }

  get cursorX() {
    return this.pianoRollStore.cursorX
  }

  get transform() {
    return this.pianoRollStore.transform
  }

  get rulerStore() {
    return this.pianoRollStore.rulerStore
  }

  get selectedTrack() {
    return this.pianoRollStore.selectedTrack
  }

  get quantizer() {
    return this.pianoRollStore.quantizer
  }

  get mouseMode() {
    return this.pianoRollStore.mouseMode
  }

  get cursor() {
    return this.pianoRollStore.controlCursor
  }
}
