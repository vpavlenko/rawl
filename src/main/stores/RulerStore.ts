import { computed, makeObservable, observable } from "mobx"
import { filterEventsWithScroll } from "../../common/helpers/filterEventsWithScroll"
import { BeatWithX, createBeatsInRange } from "../../common/helpers/mapBeats"
import Quantizer from "../../common/quantizer"
import Song from "../../common/song"
import { isTimeSignatureEvent } from "../../common/track"

interface CoordTransform {
  pixelsPerTick: number
}

interface RulerProvider {
  rootStore: { song: Song }
  transform: CoordTransform
  scrollLeft: number
  canvasWidth: number
  quantizer: Quantizer
}

export interface TimeSignature {
  id: number
  tick: number
  numerator: number
  denominator: number
  isSelected: boolean
}

export class RulerStore {
  readonly parent: RulerProvider
  selectedTimeSignatureEventIds: number[] = []

  constructor(parent: RulerProvider) {
    this.parent = parent

    makeObservable(this, {
      selectedTimeSignatureEventIds: observable.shallow,
      beats: computed,
      timeSignatures: computed,
      quantizer: computed,
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

  get timeSignatures(): TimeSignature[] {
    const { transform, scrollLeft, canvasWidth, rootStore } = this.parent
    const { selectedTimeSignatureEventIds } = this
    const track = rootStore.song.conductorTrack
    if (track === undefined) {
      return []
    }

    return filterEventsWithScroll(
      track.events,
      transform.pixelsPerTick,
      scrollLeft,
      canvasWidth
    )
      .filter(isTimeSignatureEvent)
      .map((e) => ({
        ...e,
        isSelected: selectedTimeSignatureEventIds.includes(e.id),
      }))
  }

  get quantizer(): Quantizer {
    return this.parent.quantizer
  }
}
