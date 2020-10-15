import PianoRollStore from "main/stores/PianoRollStore"
import RootStore from "main/stores/RootStore"
import { pointSub, pointAdd } from "../../../../common/geometry"
import { moveNote, resizeNoteLeft, resizeNoteRight } from "../../../actions"
import { getPositionType, isPianoNote, mousePositionToCursor } from "../PianoNotes/PianoNote"
import { PianoNotesMouseEvent } from "../PianoRollStage"
import { observeDrag } from "./observeDrag"

export type MouseAction = (e: PianoNotesMouseEvent) => void

export type MouseGesture = (
  onMouseDown: (action: MouseAction) => void,
  onMouseMove: (action: MouseAction) => void,
  onMouseUp: (action: MouseAction) => void
) => void

export default class NoteMouseHandler {
  protected readonly rootStore: RootStore
  private action: MouseGesture | null
  private actionMouseMove: MouseAction
  private actionMouseUp: MouseAction

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
  }

  // mousedown 以降に行う MouseAction を返す
  protected actionForMouseDown(e: PianoNotesMouseEvent): MouseGesture | null {
    // 共通の action

    // wheel drag to start scrolling
    if (e.nativeEvent.button === 1) {
      return dragScrollAction(this.rootStore.pianoRollStore)
    }

    // 右ダブルクリック
    if (e.nativeEvent.button === 2 && e.nativeEvent.detail % 2 === 0) {
      return changeToolAction(this.rootStore.pianoRollStore)
    }

    if (isPianoNote(e.pixiEvent.target)) {
      return dragNoteAction(this.rootStore)
    }

    // サブクラスで残りを実装
    return null
  }

  protected getCursorForMouseMove(ev: PianoNotesMouseEvent): string {
    const e = ev.pixiEvent
    if (isPianoNote(e.target)) {
      const offset = e.data.getLocalPosition(e.target.parent)
      const { item } = e.target
      const local = {
        x: offset.x - item.x,
        y: offset.y - item.y,
      }
      const position = getPositionType(local.x, item.width)
      return mousePositionToCursor(position)
    }

    // サブクラスで実装
    return "auto"
  }

  onMouseDown(e: PianoNotesMouseEvent) {
    this.action = this.actionForMouseDown(e)
    if (!this.action) {
      return
    }
    this.actionMouseMove = () => {}
    this.actionMouseUp = () => {}
    this.action(
      (mouseDown) => mouseDown(e),
      (f) => (this.actionMouseMove = f),
      (f) => (this.actionMouseUp = f)
    )
  }

  onMouseMove(e: PianoNotesMouseEvent) {
    if (this.action) {
      this.actionMouseMove(e)
    } else {
      const cursor = this.getCursorForMouseMove(e)
      this.rootStore.pianoRollStore.notesCursor = cursor
    }
  }

  onMouseUp(e: PianoNotesMouseEvent) {
    if (this.action) {
      this.actionMouseUp(e)
    }
    this.action = null
  }
}

const dragNoteAction = (rootStore: RootStore): MouseGesture => (
  onMouseDown
) => {
  onMouseDown((ev) => {
    const e = ev.pixiEvent
    if (!(e.data.originalEvent instanceof MouseEvent)) {
      return
    }
    if (!isPianoNote(e.target)) {
      return
    }
    const { transform } = ev
    const { item } = e.target
    const offset = e.data.getLocalPosition(e.target.parent)
    const startClientPos = {
      x: e.data.originalEvent.offsetX,
      y: e.data.originalEvent.offsetY,
    }
    const local = e.target.toLocal(startClientPos)
    const position = getPositionType(local.x, item.width)

    observeDrag({
      onMouseMove: (e) => {
        const clientPos = { x: e.offsetX, y: e.offsetY }
        const delta = pointSub(clientPos, startClientPos)
        const newOffset = pointAdd(delta, offset)
        const tick = transform.getTicks(newOffset.x)

        switch (position) {
          case "center": {
            const position = pointAdd(item, delta)
            moveNote(rootStore)({
              id: item.id,
              tick: transform.getTicks(position.x),
              noteNumber: Math.round(transform.getNoteNumber(position.y)),
              quantize: "round",
            })
            break
          }
          case "left":
            resizeNoteLeft(rootStore)(item.id, tick)
            break
          case "right":
            resizeNoteRight(rootStore)(item.id, tick)
            break
        }
        e.stopPropagation()
      },
    })
  })
}

const dragScrollAction = (pianoRollStore: PianoRollStore): MouseGesture => (
  onMouseDown
) => {
  onMouseDown(() => {
    observeDrag({
      onMouseMove: (e: MouseEvent) => {
        pianoRollStore.scrollBy(e.movementX, e.movementY)
      },
    })
  })
}

const changeToolAction = (pianoRollStore: PianoRollStore): MouseGesture => (
  onMouseDown
) => {
  onMouseDown(() => {
    pianoRollStore.toggleTool()
    pianoRollStore.notesCursor = "crosshair"
  })
}
