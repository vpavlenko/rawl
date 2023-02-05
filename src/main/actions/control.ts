import { maxBy, min, minBy } from "lodash"
import { ControllerEvent, PitchBendEvent } from "midifile-ts"
import { isNotUndefined } from "../../common/helpers/array"
import {
  ControlEventsClipboardData,
  isControlEventsClipboardData,
} from "../clipboard/clipboardTypes"
import clipboard from "../services/Clipboard"
import RootStore from "../stores/RootStore"

export const createOrUpdateControlEventsValue =
  ({
    pianoRollStore: { selectedTrack, selectedControllerEventIds },
    player,
    pushHistory,
  }: RootStore) =>
  <T extends ControllerEvent | PitchBendEvent>(event: T) => {
    if (selectedTrack === undefined) {
      return
    }

    pushHistory()

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
        tick: player.position,
      })
    }
  }

export const deleteControlSelection =
  ({
    pianoRollStore,
    pianoRollStore: { selectedTrack, selectedControllerEventIds },
    pushHistory,
  }: RootStore) =>
  () => {
    if (
      selectedTrack === undefined ||
      selectedControllerEventIds.length === 0
    ) {
      return
    }

    pushHistory()

    // 選択範囲と選択されたノートを削除
    // Remove selected notes and selected notes
    selectedTrack.removeEvents(selectedControllerEventIds)
    pianoRollStore.controlSelection = null
  }

export const resetControlSelection =
  ({ pianoRollStore }: RootStore) =>
  () => {
    pianoRollStore.controlSelection = null
    pianoRollStore.selectedControllerEventIds = []
  }

export const copyControlSelection =
  ({
    pianoRollStore: { selectedTrack, selectedControllerEventIds },
  }: RootStore) =>
  () => {
    if (
      selectedTrack === undefined ||
      selectedControllerEventIds.length === 0
    ) {
      return
    }

    // Copy selected events
    const events = selectedControllerEventIds
      .map((id) => selectedTrack.getEventById(id))
      .filter(isNotUndefined)

    const minTick = min(events.map((e) => e.tick))

    if (minTick === undefined) {
      return
    }

    const relativePositionedEvents = events.map((note) => ({
      ...note,
      tick: note.tick - minTick,
    }))

    const data: ControlEventsClipboardData = {
      type: "control_events",
      events: relativePositionedEvents,
    }

    clipboard.writeText(JSON.stringify(data))
  }

export const pasteControlSelection =
  ({ pianoRollStore: { selectedTrack }, player, pushHistory }: RootStore) =>
  () => {
    if (selectedTrack === undefined) {
      return
    }

    const text = clipboard.readText()
    if (!text || text.length === 0) {
      return
    }

    const obj = JSON.parse(text)
    if (!isControlEventsClipboardData(obj)) {
      return
    }

    pushHistory()

    const events = obj.events.map((e) => ({
      ...e,
      tick: e.tick + player.position,
    }))
    selectedTrack.transaction((it) =>
      events.forEach((e) => it.createOrUpdate(e))
    )
  }

export const duplicateControlSelection =
  ({
    pianoRollStore,
    pianoRollStore: { selectedTrack, selectedControllerEventIds },
    pushHistory,
  }: RootStore) =>
  () => {
    if (
      selectedTrack === undefined ||
      selectedControllerEventIds.length === 0
    ) {
      return
    }

    pushHistory()

    const selectedEvents = selectedControllerEventIds
      .map((id) => selectedTrack.getEventById(id))
      .filter(isNotUndefined)

    // move to the end of selection
    let deltaTick =
      (maxBy(selectedEvents, (e) => e.tick)?.tick ?? 0) -
      (minBy(selectedEvents, (e) => e.tick)?.tick ?? 0)

    const notes = selectedEvents.map((note) => ({
      ...note,
      tick: note.tick + deltaTick,
    }))

    // select the created events
    const addedEvents = selectedTrack.transaction((it) =>
      notes.map((e) => it.createOrUpdate(e))
    )
    pianoRollStore.selectedControllerEventIds = addedEvents.map((e) => e.id)
  }
