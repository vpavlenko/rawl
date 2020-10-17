import { observe } from "mobx"
import { resetSelection } from "../actions"
import RootStore from "./RootStore"

export const registerReactions = (rootStore: RootStore) => {
  // reset selection when tool changed
  observe(rootStore.pianoRollStore, "mouseMode", resetSelection(rootStore))
}
