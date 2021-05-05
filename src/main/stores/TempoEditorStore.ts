import Color from "color"
import { autorun, computed, makeObservable, observable } from "mobx"
import { createBeatsInRange } from "../../common/helpers/mapBeats"
import { defaultTheme, Theme } from "../../common/theme/Theme"
import { TempoCoordTransform } from "../../common/transform"
import { DisplayEvent } from "../components/PianoRoll/ControlMark"
import { transformEvents } from "../components/TempoGraph/transformEvents"
import { Layout } from "../Constants"
import RootStore from "./RootStore"

export default class TempoEditorStore {
  private rootStore: RootStore

  scrollLeft: number = 0
  scaleX: number = 1
  autoScroll: boolean = true
  canvasWidth: number = 0
  canvasHeight: number = 0
  theme: Theme = defaultTheme

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore

    makeObservable(this, {
      scrollLeft: observable,
      scaleX: observable,
      autoScroll: observable,
      canvasWidth: observable,
      canvasHeight: observable,
      theme: observable,
      transform: computed,
      mappedBeats: computed,
      items: computed,
      cursorX: computed,
      contentWidth: computed,
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

  get mappedBeats() {
    const measures = this.rootStore.song.measures
    const startTick = this.scrollLeft / this.transform.pixelsPerTick

    return createBeatsInRange(
      measures,
      this.transform.pixelsPerTick,
      this.rootStore.song.timebase,
      startTick,
      this.canvasWidth
    )
  }

  get items() {
    const { transform, canvasWidth, theme } = this

    const sourceEvents =
      this.rootStore.song.conductorTrack !== undefined
        ? this.rootStore.song.conductorTrack.events
        : []

    const events = sourceEvents.filter(
      (e) => (e as any).subtype === "setTempo"
    ) as DisplayEvent[]

    return transformEvents(
      events,
      transform,
      canvasWidth,
      theme.themeColor,
      Color(theme.themeColor).alpha(0.1).string()
    )
  }

  get contentWidth() {
    const { scrollLeft, transform, canvasWidth } = this
    const trackEndTick = this.rootStore.song.endOfSong
    const startTick = scrollLeft / transform.pixelsPerTick
    const widthTick = transform.getTicks(canvasWidth)
    const endTick = startTick + widthTick

    return Math.max(trackEndTick, endTick) * transform.pixelsPerTick
  }
}
