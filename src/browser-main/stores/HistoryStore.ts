export default class HistoryStore {
  undoHistory = []
  redoHistory = []

  push(currentState) {
    this.undoHistory.push(currentState)
    this.redoHistory = []
  }

  undo(currentState) {
    const state = this.undoHistory.pop()
    if (state) {
      this.redoHistory.push(currentState)
    }
    return state
  }

  redo(currentState) {
    const state = this.redoHistory.pop()
    if (state) {
      this.undoHistory.push(currentState)
    }
    return state
  }

  clear() {
    this.undoHistory = []
    this.redoHistory = []
  }
}
