import { Dispatcher } from "main/createDispatcher"
import { CHANGE_NOTES_VELOCITY } from "main/actions"
import { NoteEvent } from "src/common/track"
import { ItemEvent } from "src/main/components/Stage/Stage"
import Item from "src/main/components/Stage/Item"

export default class VelocityMouseHandler {
  dispatch: Dispatcher

  changeVelocity(notes: Item[], velocity: number) {
    this.dispatch(CHANGE_NOTES_VELOCITY, notes, velocity)
  }

  onMouseDown = (e: MouseEvent & ItemEvent) => {
    const items = e.items
    if (items.length === 0) {
      return
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()

    function calcValue(e: MouseEvent) {
      return Math.round(
        Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height)) * 127
      )
    }

    this.changeVelocity(items, calcValue(e))

    const onMouseMove = (e: MouseEvent) => {
      this.changeVelocity(items, calcValue(e))
    }

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }
}
