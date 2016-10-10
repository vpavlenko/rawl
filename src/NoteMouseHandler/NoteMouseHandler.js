function findMap(arr, func) {
  for (const item of arr) {
    const result = func(item)
    if (result) return result
  }
  return null
}

export default class MouseHandler {
  constructor(actionFactories, cursorHandler, defaultCursor) {
    this.actionFactories = actionFactories
    this.cursorHandler = cursorHandler
    this.defaultCursor = defaultCursor
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

  onMouseMove(local, ctx, e) {
    if (this.action) {
      this.actionMouseMove(local, e)
    } else {
      let cursor = "auto"
      if (this.cursorHandler) {
        cursor = this.cursorHandler(local, ctx)
      }
      ctx.changeCursor(cursor)
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
    return changeToolAction(ctx)
  }

  return null
}

function dragScrollAction(onMouseDown, onMouseMove) {
  onMouseMove((local, e) => {
    // FIXME
    // emitter.trigger("drag-scroll", {movement: {
    //   x: e.nativeEvent.movementX,
    //   y: e.nativeEvent.movementY
    // }})
  })
}

const changeToolAction = ctx => onMouseDown => {
  onMouseDown(() => {
    ctx.changeTool()
  })
}
