function findMap(arr, func) {
  for (const item of arr) {
    const result = func(item)
    if (result) return result
  }
  return null
}

export default class MouseHandler {
  constructor(emitter, actionFactories, cursorHandler) {
    this.emitter = emitter
    this.actionFactories = actionFactories
    this.cursorHandler = cursorHandler
  }

  onMouseDown(local, ctx, e) {
    this.action = findMap(this.actionFactories, f => f(local, ctx, e))
    if (!this.action) {
      return
    }
    let actionMouseDown = () => {}
    this.actionMouseMove = () => {}
    this.actionMouseUp = () => {}
    const registerMouseDown = f => {
      actionMouseDown = f
    }
    const registerMouseMove = f => {
      this.actionMouseMove = f
    }
    const registerMouseUp = f => {
      this.actionMouseUp = f
    }
    this.action(
      registerMouseDown,
      registerMouseMove,
      registerMouseUp)
    actionMouseDown(local)
  }

  onMouseMove(local, ctx) {
    if (this.action) {
      this.actionMouseMove(local)
    } else {
      let cursor = "auto"
      if (this.cursorHandler) {
        cursor = this.cursorHandler(local, ctx)
      }
      this.emitter.trigger("change-cursor", cursor)
    }
  }

  onMouseUp(local) {
    if (this.action) {
      this.actionMouseUp(local)
    }
    this.action = null
  }
}

export function defaultActionFactory(local, ctx, e) {
  if (e.nativeEvent.button == 1) {
    // wheel drag to start scrolling
    return dragScrollAction
  }

  if (e.nativeEvent.button == 2 && e.nativeEvent.detail == 2) {
    return changeToolAction
  }

  return null
}

function dragScrollAction(emitter, onMouseDown, onMouseMove) {
  onMouseMove((local, ctx, e) => {
    emitter.trigger("drag-scroll", {movement: {
      x: e.nativeEvent.movementX,
      y: e.nativeEvent.movementY
    }})
  })
}

function changeToolAction(emitter, onMouseDown) {
  onMouseDown(() => {
    emitter.trigger("change-tool")
  })
}
