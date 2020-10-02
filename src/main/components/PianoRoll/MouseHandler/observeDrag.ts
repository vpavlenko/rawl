export interface DragHandler {
  onMouseMove?: (e: MouseEvent) => void
  onMouseUp?: (e: MouseEvent) => void
}

export const observeDrag = ({ onMouseMove, onMouseUp }: DragHandler) => {
  const onGlobalMouseMove = (e: MouseEvent) => {
    onMouseMove?.(e)
  }

  const onGlobalMouseUp = (e: MouseEvent) => {
    onMouseUp?.(e)
    document.removeEventListener("mousemove", onGlobalMouseMove)
    document.removeEventListener("mouseup", onGlobalMouseUp)
  }

  document.addEventListener("mousemove", onGlobalMouseMove)
  document.addEventListener("mouseup", onGlobalMouseUp)
}
