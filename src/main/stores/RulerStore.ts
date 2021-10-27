import { TimeSignatureEvent } from "midifile-ts"
import { computed, makeObservable } from "mobx"
import { filterEventsWithScroll } from "../../common/helpers/filterEventsWithScroll"
import { BeatWithX, createBeatsInRange } from "../../common/helpers/mapBeats"
import { isTimeSignatureEvent, TrackEventOf } from "../../common/track"
import RootStore from "./RootStore"

interface CoordTransform {
  pixelsPerTick: number
}

interface RulerProvider {
  rootStore: RootStore
  transform: CoordTransform
  scrollLeft: number
  canvasWidth: number
}

export class RulerStore {
  private parent: RulerProvider

  constructor(parent: RulerProvider) {
    this.parent = parent

    makeObservable(this, {
      beats: computed,
      timeSignatures: computed,
    })
  }

  get beats(): BeatWithX[] {
    const { scrollLeft, transform, canvasWidth, rootStore } = this.parent

    const startTick = scrollLeft / transform.pixelsPerTick

    return createBeatsInRange(
      rootStore.song.measures,
      transform.pixelsPerTick,
      rootStore.song.timebase,
      startTick,
      canvasWidth
    )
  }

  get timeSignatures(): TrackEventOf<TimeSignatureEvent>[] {
    const { transform, scrollLeft, canvasWidth, rootStore } = this.parent
    const track = rootStore.song.conductorTrack
    if (track === undefined) {
      return []
    }

    return filterEventsWithScroll(
      track.events,
      transform.pixelsPerTick,
      scrollLeft,
      canvasWidth
    ).filter(isTimeSignatureEvent)
  }
}
