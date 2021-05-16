import { clamp, flatten } from "lodash"
import { action, autorun, computed, makeObservable, observable } from "mobx"
import { IRect } from "../../common/geometry"
import { filterEventsWithScroll } from "../../common/helpers/filterEventsWithScroll"
import { BeatWithX, createBeatsInRange } from "../../common/helpers/mapBeats"
import { getMBTString } from "../../common/measure/mbt"
import { emptySelection } from "../../common/selection/Selection"
import { isNoteEvent, TrackEvent } from "../../common/track"
import { NoteCoordTransform } from "../../common/transform"
import { LoadSoundFontEvent } from "../../synth/synth"
import { ControlMode } from "../components/ControlPane/ControlPane"
import { InstrumentSetting } from "../components/InstrumentBrowser/InstrumentBrowser"
import { Layout } from "../Constants"
import RootStore from "./RootStore"

export type PianoRollMouseMode = "pencil" | "selection"

export type PianoNoteItem = IRect & {
  id: number
  velocity: number
  isSelected: boolean
  isDrum: boolean
}

// trackId to trackId[] (not contains itself)
type GhostTrackIdMap = { [index: number]: number[] }

export default class PianoRollStore {
  private rootStore: RootStore

  scrollLeftTicks = 0
  scrollTopKeys = 70 // 中央くらいの音程にスクロールしておく
  SCALE_X_MIN = 0.15
  SCALE_X_MAX = 15
  controlHeight = 0
  notesCursor = "auto"
  controlMode: ControlMode = "velocity"
  mouseMode: PianoRollMouseMode = "pencil"
  scaleX = 1
  scaleY = 1
  autoScroll = true
  quantize = 0
  selection = emptySelection
  lastNoteDuration: number | null = null
  openInstrumentBrowser = false
  instrumentBrowserSetting: InstrumentSetting = {
    isRhythmTrack: false,
    programNumber: 0,
  }
  presetNames: LoadSoundFontEvent["presetNames"] = [[]]
  ghostTracks: GhostTrackIdMap = {}
  canvasWidth: number = 0
  canvasHeight: number = 0
  showEventList = false

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore

    makeObservable(this, {
      scrollLeftTicks: observable,
      scrollTopKeys: observable,
      controlHeight: observable,
      notesCursor: observable,
      controlMode: observable,
      mouseMode: observable,
      scaleX: observable,
      scaleY: observable,
      autoScroll: observable,
      quantize: observable,
      selection: observable,
      lastNoteDuration: observable,
      openInstrumentBrowser: observable,
      instrumentBrowserSetting: observable,
      presetNames: observable,
      ghostTracks: observable,
      canvasWidth: observable,
      canvasHeight: observable,
      showEventList: observable,
      contentWidth: computed,
      contentHeight: computed,
      scrollLeft: computed,
      scrollTop: computed,
      transform: computed,
      windowedEvents: computed,
      notes: computed,
      currentVolume: computed,
      currentPan: computed,
      currentTempo: computed,
      currentMBTTime: computed,
      mappedBeats: computed,
      cursorX: computed,
      setScrollLeftInPixels: action,
      setScrollTopInPixels: action,
      setScrollLeftInTicks: action,
      scaleAroundPointX: action,
      scrollBy: action,
      toggleTool: action,
    })
  }

  setUpAutorun() {
    autorun(() => {
      const { isPlaying, position } = this.rootStore.services.player
      const { autoScroll, scrollLeftTicks, transform, canvasWidth } = this

      // keep scroll position to cursor
      if (autoScroll && isPlaying) {
        const screenX = transform.getX(position - scrollLeftTicks)
        if (screenX > canvasWidth * 0.7 || screenX < 0) {
          this.scrollLeftTicks = position
        }
      }
    })
  }

  get contentWidth(): number {
    const { scrollLeft, transform, canvasWidth } = this
    const trackEndTick = this.rootStore.song.endOfSong
    const startTick = scrollLeft / transform.pixelsPerTick
    const widthTick = transform.getTicks(canvasWidth)
    const endTick = startTick + widthTick
    return Math.max(trackEndTick, endTick) * transform.pixelsPerTick
  }

  get contentHeight(): number {
    const { transform } = this
    return transform.getMaxY()
  }

  get scrollLeft(): number {
    return this.transform.getX(this.scrollLeftTicks)
  }

  get scrollTop(): number {
    return this.transform.getY(this.scrollTopKeys)
  }

  setScrollLeftInPixels(x: number) {
    const { canvasWidth, contentWidth } = this
    const maxX = contentWidth - canvasWidth
    const scrollLeft = clamp(x, 0, maxX)
    this.scrollLeftTicks = this.transform.getTicks(scrollLeft)
  }

  setScrollTopInPixels(y: number) {
    const { transform, canvasHeight } = this
    const contentHeight = transform.getMaxY()
    const scrollTop = clamp(y, 0, contentHeight - canvasHeight)
    this.scrollTopKeys = this.transform.getNoteNumber(scrollTop)
  }

  setScrollLeftInTicks(tick: number) {
    this.setScrollLeftInPixels(this.transform.getX(tick))
  }

  scrollBy(x: number, y: number) {
    this.setScrollLeftInPixels(this.scrollLeft - x)
    this.setScrollTopInPixels(this.scrollTop - y)
  }

  scaleAroundPointX(scaleXDelta: number, pixelX: number) {
    const pixelXInTicks0 = this.transform.getTicks(this.scrollLeft + pixelX)
    if (this.scaleX < 1) {
      scaleXDelta *= this.scaleX * this.scaleX // to not zoom too fast when zooomed out
    }
    this.scaleX = clamp(
      this.scaleX + scaleXDelta,
      this.SCALE_X_MIN,
      this.SCALE_X_MAX
    )
    const pixelXInTicks1 = this.transform.getTicks(this.scrollLeft + pixelX)
    const scrollInTicks = pixelXInTicks1 - pixelXInTicks0
    this.setScrollLeftInTicks(this.scrollLeftTicks - scrollInTicks)
  }

  toggleTool() {
    this.mouseMode === "pencil" ? "selection" : "pencil"
  }

  get transform(): NoteCoordTransform {
    return new NoteCoordTransform(
      Layout.pixelsPerTick * this.scaleX,
      Layout.keyHeight * this.scaleY,
      127
    )
  }

  get windowedEvents(): TrackEvent[] {
    const { transform, scrollLeft, canvasWidth } = this
    const track = this.rootStore.song.selectedTrack
    if (track === undefined) {
      return []
    }

    return filterEventsWithScroll(
      track.events,
      transform.pixelsPerTick,
      scrollLeft,
      canvasWidth
    )
  }

  get notes(): [PianoNoteItem[], PianoNoteItem[]] {
    const song = this.rootStore.song
    const { selectedTrackId } = song
    const {
      transform,
      windowedEvents,
      ghostTracks,
      selection,
      scrollLeft,
      canvasWidth,
    } = this

    const track = song.selectedTrack
    if (track === undefined) {
      return [[], []]
    }
    const ghostTrackIds = ghostTracks[selectedTrackId] ?? []
    const isRhythmTrack = track.isRhythmTrack

    const noteEvents = windowedEvents.filter(isNoteEvent)

    const getGhostNotes = () =>
      flatten(
        ghostTrackIds.map((id) => {
          const track = song.getTrack(id)
          if (track === undefined) {
            return []
          }
          return filterEventsWithScroll(
            track.events.filter(isNoteEvent),
            transform.pixelsPerTick,
            scrollLeft,
            canvasWidth
          ).map((e): PianoNoteItem => {
            const rect = track.isRhythmTrack
              ? transform.getDrumRect(e)
              : transform.getRect(e)
            return {
              ...rect,
              id: e.id,
              velocity: 127, // draw opaque when ghost
              isSelected: false,
              isDrum: track.isRhythmTrack,
            }
          })
        })
      )

    return [
      noteEvents.map((e): PianoNoteItem => {
        const rect = isRhythmTrack
          ? transform.getDrumRect(e)
          : transform.getRect(e)
        const isSelected = selection.noteIds.includes(e.id)
        return {
          ...rect,
          id: e.id,
          velocity: e.velocity,
          isSelected,
          isDrum: isRhythmTrack,
        }
      }),
      getGhostNotes(),
    ]
  }

  get currentVolume(): number {
    return (
      this.rootStore.song.selectedTrack?.getVolume(
        this.rootStore.services.player.position
      ) ?? 0
    )
  }

  get currentPan(): number {
    return (
      this.rootStore.song.selectedTrack?.getPan(
        this.rootStore.services.player.position
      ) ?? 0
    )
  }

  get currentTempo(): number {
    return (
      this.rootStore.song.conductorTrack?.getTempo(
        this.rootStore.services.player.position
      ) ?? 1
    )
  }

  get currentMBTTime(): string {
    return getMBTString(
      this.rootStore.song.measures,
      this.rootStore.services.player.position,
      this.rootStore.services.player.timebase
    )
  }

  get cursorX(): number {
    return this.transform.getX(this.rootStore.services.player.position)
  }

  get mappedBeats(): BeatWithX[] {
    const { scrollLeft, transform, canvasWidth } = this

    const startTick = scrollLeft / transform.pixelsPerTick

    return createBeatsInRange(
      this.rootStore.song.measures,
      transform.pixelsPerTick,
      this.rootStore.song.timebase,
      startTick,
      canvasWidth
    )
  }
}
