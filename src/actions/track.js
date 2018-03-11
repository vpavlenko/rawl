import {
  panMidiEvent,
  volumeMidiEvent,
  setTempoMidiEvent,
  pitchBendMidiEvent,
  modulationMidiEvent,
  expressionMidiEvent
} from "../midi/MidiEvent"

export default (rootStore) => {
  const { song, pianoRollStore, services: { player, quantizer } } = rootStore
  const { tracks, selectedTrack } = song

  const saveHistory = () => {
    rootStore.pushHistory()
  }

  const createOrUpdate = (typeProp, type, tick = player.position, valueProp, value, createEvent, track = selectedTrack) => {
    const e = createEvent()
    e[valueProp] = Math.round(value)
    e.tick = quantizer.round(tick)
    track.createOrUpdate(e)
  }

  return {

    /* conductor track */

    "CHANGE_TEMPO": ({ id, microsecondsPerBeat }) => {
      saveHistory()
      song.conductorTrack.updateEvent(id, {
        microsecondsPerBeat: microsecondsPerBeat
      })
    },
    "CREATE_TEMPO": ({ tick, microsecondsPerBeat }) => {
      saveHistory()
      const e = setTempoMidiEvent(0, Math.round(microsecondsPerBeat))
      e.tick = quantizer.round(tick)
      song.conductorTrack.createOrUpdate(e)
    },

    /* events */

    "CHANGE_NOTES_VELOCITY": ({ notes, velocity }) => {
      saveHistory()
      selectedTrack.updateEvents(notes.map(item => ({ id: item.id, velocity })))
    },
    "CREATE_PITCH_BEND": ({ tick, value }) => {
      saveHistory()
      return createOrUpdate("subtype", "pitchBend", tick, "value", value, () =>
        pitchBendMidiEvent()
      )
    },
    "CREATE_VOLUME": ({ tick, value }) => {
      saveHistory()
      return createOrUpdate("controllerType", 0x07, tick, "value", value, () =>
        volumeMidiEvent()
      )
    },
    "CREATE_PAN": ({ tick, value }) => {
      saveHistory()
      return createOrUpdate("controllerType", 0x0a, tick, "value", value, () =>
        panMidiEvent()
      )
    },
    "CREATE_MODULATION": ({ tick, value }) => {
      saveHistory()
      return createOrUpdate("controllerType", 0x01, tick, "value", value, () =>
        modulationMidiEvent()
      )
    },
    "CREATE_EXPRESSION": ({ tick, value }) => {
      saveHistory()
      return createOrUpdate("controllerType", 0x0b, tick, "value", value, () =>
        expressionMidiEvent()
      )
    },
    "REMOVE_EVENT": ({ eventId }) => {
      saveHistory()
      selectedTrack.removeEvent(eventId)
    },

    /* note */

    "CREATE_NOTE": ({ tick, noteNumber }) => {
      saveHistory()
      tick = quantizer.floor(tick)
      const note = {
        type: "channel",
        subtype: "note",
        noteNumber: noteNumber,
        tick,
        velocity: 127,
        duration: pianoRollStore.lastNoteDuration || quantizer.unit,
        channel: selectedTrack.channel
      }
      selectedTrack.addEvent(note)
      player.playNote(note)
      return note.id
    },
    "MOVE_NOTE": ({ id, tick, noteNumber, quantize }) => {
      const note = selectedTrack.getEventById(id)
      tick = quantizer[quantize || "floor"](tick)
      const tickChanged = tick !== note.tick
      const pitchChanged = noteNumber !== note.noteNumber

      if (pitchChanged || tickChanged) {
        saveHistory()

        const n = selectedTrack.updateEvent(note.id, {
          tick,
          noteNumber: noteNumber
        })

        if (pitchChanged) {
          player.playNote(n)
        }
      }
    },
    "RESIZE_NOTE_LEFT": ({ id, tick }) => { // 右端を固定して長さを変更
      tick = quantizer.round(tick)
      const note = selectedTrack.getEventById(id)
      const duration = note.duration + (note.tick - tick)
      if (note.tick !== tick && duration >= quantizer.unit) {
        saveHistory()
        pianoRollStore.lastNoteDuration = duration
        selectedTrack.updateEvent(note.id, { tick, duration })
      }
    },
    "RESIZE_NOTE_RIGHT": ({ id, tick }) => {
      const note = selectedTrack.getEventById(id)
      const right = tick
      const duration = Math.max(quantizer.unit,
        quantizer.round(right - note.tick))
      if (note.duration !== duration) {
        saveHistory()
        pianoRollStore.lastNoteDuration = duration
        selectedTrack.updateEvent(note.id, { duration })
      }
    },

    /* track meta */

    "SET_TRACK_NAME": ({ trackId, name }) => {
      saveHistory()
      selectedTrack.setName(name)
    },
    "SET_TRACK_VOLUME": ({ trackId, volume }) => {
      saveHistory()
      tracks[trackId].volume = volume
    },
    "SET_TRACK_PAN": ({ trackId, pan }) => {
      saveHistory()
      tracks[trackId].pan = pan
    },
    "SET_TRACK_INSTRUMENT": ({ trackId, programNumber }) => {
      saveHistory()
      tracks[trackId].programNumber = programNumber
    },
  }
}