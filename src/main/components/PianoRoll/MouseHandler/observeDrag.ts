export interface DragHandler {
  onMouseMove?: (e: MouseEvent) => void
  onMouseUp?: (e: MouseEvent) => void
  onClick?: (e: MouseEvent) => void
}

export const observeDrag = ({
  onMouseMove,
  onMouseUp,
  onClick,
}: DragHandler) => {
  let isMoved = false

  const onGlobalMouseMove = (e: MouseEvent) => {
    isMoved = true
    onMouseMove?.(e)
  }

  const onGlobalMouseUp = (e: MouseEvent) => {
    onMouseUp?.(e)

    if (!isMoved) {
      onClick?.(e)
    }

    document.removeEventListener("mousemove", onGlobalMouseMove)
    document.removeEventListener("mouseup", onGlobalMouseUp)
  }

  document.addEventListener("mousemove", onGlobalMouseMove)
  document.addEventListener("mouseup", onGlobalMouseUp)
}
