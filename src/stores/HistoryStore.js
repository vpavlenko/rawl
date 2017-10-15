import { observable } from "mobx"

export default class HistoryStore {
  @observable undoHistory = []
  @observable redoHistory = []

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
