import { autorun, computed, makeObservable, observable } from "mobx"
import Quantizer from "../../common/quantizer"
import { TempoCoordTransform } from "../../common/transform"
import { DisplayEvent } from "../components/PianoRoll/ControlMark"
import { transformEvents } from "../components/TempoGraph/transformEvents"
import { Layout } from "../Constants"
import RootStore from "./RootStore"
import { RulerStore } from "./RulerStore"

export default class TempoEditorStore {
  readonly rootStore: RootStore
  readonly rulerStore: RulerStore

  scrollLeft: number = 0
  scaleX: number = 1
  autoScroll: boolean = true
  canvasWidth: number = 0
  canvasHeight: number = 0
  quantize = 4
  isQuantizeEnabled = true

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    this.rulerStore = new RulerStore(this)

    makeObservable(this, {
      scrollLeft: observable,
      scaleX: observable,
      autoScroll: observable,
      canvasWidth: observable,
      canvasHeight: observable,
      transform: computed,
      items: computed,
      cursorX: computed,
      contentWidth: computed,
      quantize: observable,
      isQuantizeEnabled: observable,
    })
  }

  setUpAutorun() {
    autorun(() => {
      const { isPlaying, position } = this.rootStore.services.player
      const { autoScroll, scrollLeft, transform, canvasWidth } = this

      // keep scroll position to cursor
      if (autoScroll && isPlaying) {
        const x = transform.getX(position)
        const screenX = x - scrollLeft
        if (screenX > canvasWidth * 0.7 || screenX < 0) {
          this.scrollLeft = x
        }
      }
    })
  }

  get transform() {
    const pixelsPerTick = Layout.pixelsPerTick * this.scaleX
    return new TempoCoordTransform(pixelsPerTick, this.canvasHeight)
  }

  get cursorX(): number {
    return this.transform.getX(this.rootStore.services.player.position)
  }

  get items() {
    const { transform, canvasWidth, scrollLeft } = this

    const sourceEvents =
      this.rootStore.song.conductorTrack !== undefined
        ? this.rootStore.song.conductorTrack.events
        : []

    const events = sourceEvents.filter(
      (e) => (e as any).subtype === "setTempo"
    ) as DisplayEvent[]

    return transformEvents(events, transform, canvasWidth + scrollLeft)
  }

  get contentWidth() {
    const { scrollLeft, transform, canvasWidth } = this
    const trackEndTick = this.rootStore.song.endOfSong
    const startTick = scrollLeft / transform.pixelsPerTick
    const widthTick = transform.getTicks(canvasWidth)
    const endTick = startTick + widthTick

    return Math.max(trackEndTick, endTick) * transform.pixelsPerTick
  }

  get quantizer(): Quantizer {
    return new Quantizer(this.rootStore, this.quantize, this.isQuantizeEnabled)
  }
}
