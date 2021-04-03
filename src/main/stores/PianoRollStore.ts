import { flatten } from "lodash"
import { action, computed, makeObservable, observable } from "mobx"
import { IRect } from "../../common/geometry"
import { filterEventsWithScroll } from "../../common/helpers/filterEventsWithScroll"
import { emptySelection } from "../../common/selection/Selection"
import { isNoteEvent, NoteEvent } from "../../common/track"
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

  scrollLeft = 0
  scrollTop = 700 // 中央くらいの音程にスクロールしておく
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
  canvasWidth: number
  showEventList = false

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore

    makeObservable(this, {
      scrollLeft: observable,
      scrollTop: observable,
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
      showEventList: observable,
      transform: computed,
      notes: computed,
      scrollBy: action,
      toggleTool: action,
    })
  }

  scrollBy(x: number, y: number) {
    this.scrollLeft = Math.max(0, this.scrollLeft - x)
    this.scrollTop = Math.max(0, this.scrollTop - y)
  }

  toggleTool() {
    this.mouseMode === "pencil" ? "selection" : "pencil"
  }

  get transform(): NoteCoordTransform {
    return new NoteCoordTransform(
      Layout.pixelsPerTick * this.scaleX,
      Layout.keyHeight,
      127
    )
  }

  get notes(): [PianoNoteItem[], PianoNoteItem[]] {
    const song = this.rootStore.song
    const transform = this.transform

    const track = song.tracks[song.selectedTrackId]
    if (track === undefined) {
      return [[], []]
    }
    const ghostTrackIds = this.ghostTracks[song.selectedTrackId] ?? []
    const isRhythmTrack = track.isRhythmTrack

    const windowNotes = (notes: NoteEvent[]): NoteEvent[] =>
      filterEventsWithScroll(
        notes,
        transform.pixelsPerTick,
        this.scrollLeft,
        this.canvasWidth
      )

    const getGhostNotes = () =>
      flatten(
        ghostTrackIds.map((id) => {
          const track = song.getTrack(id)
          if (track === undefined) {
            return []
          }
          return windowNotes(track.events.filter(isNoteEvent)).map(
            (e): PianoNoteItem => {
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
            }
          )
        })
      )

    return [
      windowNotes(track.events.filter(isNoteEvent)).map(
        (e): PianoNoteItem => {
          const rect = isRhythmTrack
            ? transform.getDrumRect(e)
            : transform.getRect(e)
          const isSelected = this.selection.noteIds.includes(e.id)
          return {
            ...rect,
            id: e.id,
            velocity: e.velocity,
            isSelected,
            isDrum: isRhythmTrack,
          }
        }
      ),
      getGhostNotes(),
    ]
  }
}
