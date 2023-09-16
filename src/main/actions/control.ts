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
    controlStore: { selectedEventIds, selectedTrack },
    player,
    pushHistory,
  }: RootStore) =>
  <T extends ControllerEvent | PitchBendEvent>(event: T) => {
    if (selectedTrack === undefined) {
      return
    }

    pushHistory()

    const controllerEvents = selectedEventIds
      .map((id) => selectedTrack.getEventById(id))
      .filter(isNotUndefined)

    if (controllerEvents.length > 0) {
      controllerEvents.forEach((e) =>
        selectedTrack.updateEvent(e.id, { value: event.value }),
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
    controlStore,
    controlStore: { selectedEventIds, selectedTrack },
    pushHistory,
  }: RootStore) =>
  () => {
    if (selectedTrack === undefined || selectedEventIds.length === 0) {
      return
    }

    pushHistory()

    // 選択範囲と選択されたノートを削除
    // Remove selected notes and selected notes
    selectedTrack.removeEvents(selectedEventIds)
    controlStore.selection = null
  }

export const resetControlSelection =
  ({ controlStore }: RootStore) =>
  () => {
    controlStore.selection = null
    controlStore.selectedEventIds = []
  }

export const copyControlSelection =
  ({ controlStore: { selectedEventIds, selectedTrack } }: RootStore) =>
  () => {
    if (selectedTrack === undefined || selectedEventIds.length === 0) {
      return
    }

    // Copy selected events
    const events = selectedEventIds
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
      events.forEach((e) => it.createOrUpdate(e)),
    )
  }

export const duplicateControlSelection =
  ({
    controlStore,
    controlStore: { selectedEventIds, selectedTrack },
    pushHistory,
  }: RootStore) =>
  () => {
    if (selectedTrack === undefined || selectedEventIds.length === 0) {
      return
    }

    pushHistory()

    const selectedEvents = selectedEventIds
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
      notes.map((e) => it.createOrUpdate(e)),
    )
    controlStore.selectedEventIds = addedEvents.map((e) => e.id)
  }
