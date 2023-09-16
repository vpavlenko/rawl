import { maxBy, min, minBy } from "lodash"
import { isNotUndefined } from "../../common/helpers/array"
import { isSetTempoEvent } from "../../common/track"
import {
  isTempoEventsClipboardData,
  TempoEventsClipboardData,
} from "../clipboard/clipboardTypes"
import clipboard from "../services/Clipboard"
import RootStore from "../stores/RootStore"

export const deleteTempoSelection =
  ({
    song: { conductorTrack },
    tempoEditorStore,
    tempoEditorStore: { selectedEventIds },
    pushHistory,
  }: RootStore) =>
  () => {
    if (conductorTrack === undefined || selectedEventIds.length === 0) {
      return
    }

    pushHistory()

    // 選択範囲と選択されたノートを削除
    // Remove selected notes and selected notes
    conductorTrack.removeEvents(selectedEventIds)
    tempoEditorStore.selection = null
  }

export const resetTempoSelection =
  ({ tempoEditorStore }: RootStore) =>
  () => {
    tempoEditorStore.selection = null
    tempoEditorStore.selectedEventIds = []
  }

export const copyTempoSelection =
  ({
    song: { conductorTrack },
    tempoEditorStore: { selectedEventIds },
  }: RootStore) =>
  () => {
    if (conductorTrack === undefined || selectedEventIds.length === 0) {
      return
    }

    // Copy selected events
    const events = selectedEventIds
      .map((id) => conductorTrack.getEventById(id))
      .filter(isNotUndefined)
      .filter(isSetTempoEvent)

    const minTick = min(events.map((e) => e.tick))

    if (minTick === undefined) {
      return
    }

    const relativePositionedEvents = events.map((note) => ({
      ...note,
      tick: note.tick - minTick,
    }))

    const data: TempoEventsClipboardData = {
      type: "tempo_events",
      events: relativePositionedEvents,
    }

    clipboard.writeText(JSON.stringify(data))
  }

export const pasteTempoSelection =
  ({ song: { conductorTrack }, player, pushHistory }: RootStore) =>
  () => {
    if (conductorTrack === undefined) {
      return
    }

    const text = clipboard.readText()
    if (!text || text.length === 0) {
      return
    }

    const obj = JSON.parse(text)
    if (!isTempoEventsClipboardData(obj)) {
      return
    }

    pushHistory()

    const events = obj.events.map((e) => ({
      ...e,
      tick: e.tick + player.position,
    }))
    conductorTrack.transaction((it) => {
      events.forEach((e) => it.createOrUpdate(e))
    })
  }

export const duplicateTempoSelection =
  ({
    song: { conductorTrack },
    tempoEditorStore,
    tempoEditorStore: { selectedEventIds },
    pushHistory,
  }: RootStore) =>
  () => {
    if (conductorTrack === undefined || selectedEventIds.length === 0) {
      return
    }

    pushHistory()

    const selectedEvents = selectedEventIds
      .map((id) => conductorTrack.getEventById(id))
      .filter(isNotUndefined)

    // move to the end of selection
    let deltaTick =
      (maxBy(selectedEvents, (e) => e.tick)?.tick ?? 0) -
      (minBy(selectedEvents, (e) => e.tick)?.tick ?? 0)

    const events = selectedEvents.map((note) => ({
      ...note,
      tick: note.tick + deltaTick,
    }))

    const addedEvents = conductorTrack.transaction((it) =>
      events.map((e) => it.createOrUpdate(e)),
    )

    // select the created events
    tempoEditorStore.selectedEventIds = addedEvents.map((e) => e.id)
  }
