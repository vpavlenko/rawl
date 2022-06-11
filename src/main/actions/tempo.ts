import { maxBy, min, minBy } from "lodash"
import { isNotUndefined } from "../../common/helpers/array"
import { isSetTempoEvent } from "../../common/track"
import {
  isTempoEventsClipboardData,
  TempoEventsClipboardData,
} from "../clipboard/clipboardTypes"
import clipboard from "../services/Clipboard"
import RootStore from "../stores/RootStore"
import { pushHistory } from "./history"

export const deleteTempoSelection = (rootStore: RootStore) => () => {
  const {
    song: { conductorTrack },
    tempoEditorStore,
    tempoEditorStore: { selectedEventIds },
  } = rootStore

  if (conductorTrack === undefined || selectedEventIds.length === 0) {
    return
  }

  pushHistory(rootStore)()

  // 選択範囲と選択されたノートを削除
  // Remove selected notes and selected notes
  conductorTrack.removeEvents(selectedEventIds)
  tempoEditorStore.selection = null
}

export const resetTempoSelection = (rootStore: RootStore) => () => {
  rootStore.tempoEditorStore.selection = null
  rootStore.tempoEditorStore.selectedEventIds = []
}

export const copyTempoSelection = (rootStore: RootStore) => () => {
  const {
    song: { conductorTrack },
    tempoEditorStore: { selectedEventIds },
  } = rootStore

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

export const pasteTempoSelection = (rootStore: RootStore) => () => {
  const {
    song: { conductorTrack },
    player,
  } = rootStore

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

  pushHistory(rootStore)()

  const events = obj.events.map((e) => ({
    ...e,
    tick: e.tick + player.position,
  }))
  conductorTrack.transaction((it) => {
    events.forEach((e) => it.createOrUpdate(e))
  })
}

export const duplicateTempoSelection = (rootStore: RootStore) => () => {
  const {
    song: { conductorTrack },
    tempoEditorStore,
    tempoEditorStore: { selectedEventIds },
  } = rootStore

  if (conductorTrack === undefined || selectedEventIds.length === 0) {
    return
  }

  pushHistory(rootStore)()

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
    events.map((e) => it.createOrUpdate(e))
  )

  // select the created events
  tempoEditorStore.selectedEventIds = addedEvents.map((e) => e.id)
}
