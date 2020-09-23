import NoteMouseHandler, { MouseGesture } from "./NoteMouseHandler"
import { createNote, moveNote } from "main/actions"
import RootStore from "../../../stores/RootStore"
import { PianoNotesMouseEvent } from "../PianoRollStage"

export default class PencilMouseHandler extends NoteMouseHandler {
  protected actionForMouseDown(e: PianoNotesMouseEvent): MouseGesture | null {
    const original = super.actionForMouseDown(e)
    if (original) {
      return original
    }

    if (e.nativeEvent.button !== 0) {
      return null
    }

    return createNoteAction(this.rootStore)
  }
}

export const createNoteAction = (rootStore: RootStore): MouseGesture => (
  onMouseDown,
  onMouseMove
) => {
  let noteId: number | undefined

  onMouseDown((e) => {
    noteId = createNote(rootStore)(e.tick, e.noteNumber)
  })

  onMouseMove((e) => {
    if (noteId === undefined) {
      return
    }
    moveNote(rootStore)({
      id: noteId,
      tick: e.tick,
      noteNumber: e.noteNumber,
      quantize: "floor",
    })
  })
}
