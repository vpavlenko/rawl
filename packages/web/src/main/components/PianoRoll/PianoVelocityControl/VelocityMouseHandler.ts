import { StageMouseEvent } from "components/Stage/Stage"
import Item from "components/Stage/Item"

export default class VelocityMouseHandler {
  private changeVelocity: (notes: Item[], velocity: number) => void

  constructor(changeVelocity: (notes: Item[], velocity: number) => void) {
    this.changeVelocity = changeVelocity
  }

  onMouseDown = (e: StageMouseEvent<MouseEvent>) => {
    const items = e.items
    if (items.length === 0) {
      return
    }

    const rect = (e.nativeEvent
      .currentTarget as HTMLElement).getBoundingClientRect()

    function calcValue(e: MouseEvent) {
      return Math.round(
        Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height)) * 127
      )
    }

    this.changeVelocity(items, calcValue(e.nativeEvent))

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
