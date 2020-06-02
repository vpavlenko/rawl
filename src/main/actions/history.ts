import { Action, Mutator } from "../createDispatcher"

export interface Undo {
  type: "undo"
}
export const undo = (): Undo => ({ type: "undo" })

export interface Redo {
  type: "redo"
}
export const redo = (): Redo => ({ type: "redo" })

export type HistoryAction = Undo | Redo

export default (action: Action): Mutator | null => {
  switch (action.type) {
    case "undo":
      return (store) => store.undo()
    case "redo":
      return (store) => store.redo()
  }
  return null
}
