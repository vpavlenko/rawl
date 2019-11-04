export default class HistoryStore<State> {
  undoHistory: State[] = []
  redoHistory: State[] = []

  push(currentState: State) {
    this.undoHistory.push(currentState)
    this.redoHistory = []
  }

  undo(currentState: State) {
    const state = this.undoHistory.pop()
    if (state) {
      this.redoHistory.push(currentState)
    }
    return state
  }

  redo(currentState: State) {
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
