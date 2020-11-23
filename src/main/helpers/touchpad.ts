export const isTouchPadEvent = (e: WheelEvent) => {
  if (e.deltaX !== 0) {
    return true
  }
  const { wheelDeltaY } = e as any
  return (
    Number.isInteger(e.deltaX) &&
    Number.isInteger(e.deltaY) &&
    Math.abs(wheelDeltaY) % 120 !== 0
  )
}
