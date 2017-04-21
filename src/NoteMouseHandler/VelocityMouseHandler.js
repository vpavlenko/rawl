export default class VelocityMouseHandler {
  constructor(track) {
    this.track = track
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
  }

  changeVelocity(items, velocity) {
    this.track.transaction(it => {
      items.forEach(item => {
        it.updateEvent(item.id, { velocity })
      })
    })
  }

  onMouseDown(e) {

    const items = e.items
    if (items.length === 0) {
      return
    }

    const rect = e.currentTarget.getBoundingClientRect()

    function calcValue(e) {
      return Math.round(Math.max(0, Math.min(1, (1 - (e.clientY - rect.top) / rect.height))) * 127)
    }

    this.changeVelocity(items, calcValue(e))

    const onMouseMove = e => {
      this.changeVelocity(items, calcValue(e))
    }

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }

  onMouseMove(e) {

  }

  onMouseUp(e) {

  }
}
