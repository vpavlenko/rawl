import { ControllerEvent, PitchBendEvent } from "midifile-ts"
import { isNotUndefined } from "../../common/helpers/array"
import RootStore from "../stores/RootStore"
import { pushHistory } from "./history"

export const removeSelectedControlEvents = (rootStore: RootStore) => () => {
  const { selectedControllerEventIds } = rootStore.pianoRollStore
  pushHistory(rootStore)()
  selectedControllerEventIds.forEach((id) =>
    rootStore.song.selectedTrack?.removeEvent(id)
  )
  resetControlSelection(rootStore)()
}

export const createOrUpdateControlEventsValue =
  (rootStore: RootStore) =>
  <T extends ControllerEvent | PitchBendEvent>(event: T) => {
    pushHistory(rootStore)()
    const {
      pianoRollStore: { selectedControllerEventIds },
      song: { selectedTrack },
    } = rootStore

    if (selectedTrack === undefined) {
      return
    }

    pushHistory(rootStore)()

    const controllerEvents = selectedControllerEventIds
      .map((id) => selectedTrack.getEventById(id))
      .filter(isNotUndefined)

    if (controllerEvents.length > 0) {
      controllerEvents.forEach((e) =>
        selectedTrack.updateEvent(e.id, { value: event.value })
      )
    } else {
      selectedTrack.createOrUpdate({
        ...event,
        tick: rootStore.services.player.position,
      })
    }
  }

export const deleteControlSelection = (rootStore: RootStore) => () => {
  const {
    song: { selectedTrack },
    pianoRollStore,
    pianoRollStore: { selectedControllerEventIds },
  } = rootStore

  if (selectedTrack === undefined || selectedControllerEventIds.length === 0) {
    return
  }

  pushHistory(rootStore)()

  // 選択範囲と選択されたノートを削除
  // Remove selected notes and selected notes
  selectedTrack.removeEvents(selectedControllerEventIds)
  pianoRollStore.controlSelection = null
}

export const resetControlSelection = (rootStore: RootStore) => () => {
  rootStore.pianoRollStore.controlSelection = null
  rootStore.pianoRollStore.selectedControllerEventIds = []
}
