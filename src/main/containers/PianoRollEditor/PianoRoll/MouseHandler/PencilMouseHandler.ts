import NoteMouseHandler, { MouseGesture } from "./NoteMouseHandler"
import { NoteCoordTransform } from "common/transform"
import { createNote, moveNote } from "main/actions"
import { Dispatcher } from "createDispatcher"
import { PianoNotesMouseEvent } from "components/PianoRoll/PianoNotes/PianoNotes"

export default class PencilMouseHandler extends NoteMouseHandler {
  protected actionForMouseDown(e: PianoNotesMouseEvent): MouseGesture | null {
    const original = super.actionForMouseDown(e)
    if (original) {
      return original
    }

    const { dispatch } = this

    if (e.nativeEvent.button !== 0) {
      return null
    }

    return createNoteAction(dispatch)
  }
}

export const createNoteAction = (dispatch: Dispatcher): MouseGesture => (
  onMouseDown,
  onMouseMove
) => {
  let noteId: number

  onMouseDown((e) => {
    noteId = dispatch(createNote(e.tick, e.noteNumber))
  })

  onMouseMove((e) => {
    dispatch(
      moveNote({
        id: noteId,
        tick: e.tick,
        noteNumber: e.noteNumber,
        quantize: "floor",
      })
    )
  })
}
