import {
  PanMidiEvent,
  VolumeMidiEvent,
  SetTempoMidiEvent,
  PitchBendMidiEvent,
  ModulationMidiEvent,
  ExpressionMidiEvent
} from "./midi/MidiEvent"

import Song from "./model/Song"
import Track from "./model/Track"
import { read as readSong, write as writeSong } from "./midi/SongFile"

const dispatch = (app, history) => (type, params) => {
  const { player, quantizer, song, trackMute, state } = app
  const { tracks, selectedTrack } = song

  const saveHistory = () => {
    history.push({ type, params }, song)
  }

  const createOrUpdate = (typeProp, type, tick = player.position, valueProp, value, createEvent) => {
    const value2 = Math.round(value)
    const tick2 = quantizer.round(tick)
    const events = selectedTrack.events.filter(e => e[typeProp] === type && e.tick === tick2)
    if (events.length > 0) {
      selectedTrack.transaction(it => {
        events.forEach(e => {
          it.updateEvent(e.id, { [valueProp]: value2 })
        })
      })
      return events[0]
    } else {
      const e = createEvent()
      e[valueProp] = value2
      e.tick = tick2
      return selectedTrack.addEvent(e)
    }
  }

  switch(type) {
    case "PLAY":
      player.play()
      break
    case "STOP":
      if (player.isPlaying) {
        player.stop()
      } else {
        player.stop()
        player.position = 0
      }
      break
    case "SET_PLAYER_POSITION":
      if (!player.isPlaying) {
        player.position = quantizer.round(params.tick)
      }
      break
    case "MOVE_PLAYER_POSITION":
      if (!player.isPlaying) {
        player.position = quantizer.round(player.position + params.tick)
      }
      break
    case "TOGGLE_MUTE_TRACK":
      if (trackMute.isMuted(params.trackId)) {
        trackMute.unmute(params.trackId)
      } else {
        trackMute.mute(params.trackId)
      }
      break
    case "TOGGLE_SOLO_TRACK":
      if (trackMute.isSolo(params.trackId)) {
        trackMute.unsolo(params.trackId)
      } else {
        trackMute.solo(params.trackId)
      }
      break
    case "CHANGE_NOTES_VELOCITY":
      saveHistory()
      return selectedTrack.transaction(it => {
        params.notes.forEach(item => {
          it.updateEvent(item.id, { velocity: params.velocity })
        })
      })
    case "CREATE_PITCH_BEND":
      saveHistory()
      return createOrUpdate("subtype", "pitchBend", params.tick, "value", params.value, () =>
        new PitchBendMidiEvent()
      )
    case "CREATE_VOLUME":
      saveHistory()
      return createOrUpdate("controllerType", 0x07, params.tick, "value", params.value, () =>
        new VolumeMidiEvent()
      )
    case "CREATE_PAN":
      saveHistory()
      return createOrUpdate("controllerType", 0x0a, params.tick, "value", params.value, () =>
        new PanMidiEvent()
      )
    case "CREATE_MODULATION":
      saveHistory()
      return createOrUpdate("controllerType", 0x01, params.tick, "value", params.value, () =>
        new ModulationMidiEvent()
      )
    case "CREATE_EXPRESSION":
      saveHistory()
      return createOrUpdate("controllerType", 0x0b, params.tick, "value", params.value, () =>
        new ExpressionMidiEvent()
      )
    case "SET_QUANTIZE_DENOMINATOR":
      quantizer.denominator = params.denominator
      break
    case "SET_TRACK_NAME":
      saveHistory()
      selectedTrack.setName(params.name)
      break
    case "SET_TRACK_VOLUME":
      saveHistory()
      tracks[params.trackId].volume = params.volume
      break
    case "SET_TRACK_PAN":
      saveHistory()
      tracks[params.trackId].pan = params.pan
      break
    case "SET_TRACK_INSTRUMENT":
      saveHistory()
      tracks[params.trackId].programNumber = params.programNumber
      break
    case "ADD_TRACK":
      saveHistory()
      song.addTrack(Track.emptyTrack(song.tracks.length - 1))
      break
    case "REMOVE_TRACK":
      saveHistory()
      song.removeTrack(params.trackId)
      break
    case "SELECT_TRACK":
      song.selectTrack(params.trackId)
      break
    case "SET_TEMPO":
      saveHistory()
      song.getTrack(0).tempo = params.tempo
      break
    case "CHANGE_TEMPO":
      saveHistory()
      song.conductorTrack.updateEvent(params.id, {
        microsecondsPerBeat: params.microsecondsPerBeat
      })
      break
    case "CREATE_TEMPO": {
      saveHistory()
      const event = new SetTempoMidiEvent(params.tick, params.microsecondsPerBeat)
      song.conductorTrack.addEvent(event)
      break}
    case "REMOVE_EVENT":
      saveHistory()
      selectedTrack.removeEvent(params.eventId)
      break
    case "CREATE_NOTE": {
      saveHistory()
      const tick = selectedTrack.isRhythmTrack ? 
        quantizer.round(params.tick) : quantizer.floor(params.tick)
      const note = {
        type: "channel",
        subtype: "note",
        noteNumber: params.noteNumber,
        tick,
        velocity: 127,
        duration: state.lastNoteDuration || quantizer.unit,
        channel: selectedTrack.channel
      }
      selectedTrack.addEvent(note)
      player.playNote(note)
      return note.id
    }
    case "MOVE_NOTE": {
      const note = selectedTrack.getEventById(params.id)
      const tick = quantizer[params.quantize || "floor"](params.tick)
      const tickChanged = tick !== note.tick
      const pitchChanged = params.noteNumber !== note.noteNumber

      if (pitchChanged || tickChanged) {
        saveHistory()
        
        const n = selectedTrack.updateEvent(note.id, {
          tick,
          noteNumber: params.noteNumber
        })

        if (pitchChanged) {
          player.playNote(n)
        }
      }
      break
    }
    case "RESIZE_NOTE_LEFT": { // 右端を固定して長さを変更
      const tick = quantizer.round(params.tick)
      const note = selectedTrack.getEventById(params.id)
      const duration = note.duration + (note.tick - tick)
      if (note.tick !== params.tick && duration >= quantizer.unit) {
        saveHistory()
        state.lastNoteDuration = duration
        selectedTrack.updateEvent(note.id, { tick, duration })
      }
      break
    }
    case "RESIZE_NOTE_RIGHT":
      const note = selectedTrack.getEventById(params.id)
      const right = params.tick
      const duration = Math.max(quantizer.unit,
        quantizer.round(right - note.tick))
      if (note.duration !== duration) {
        saveHistory()
        state.lastNoteDuration = duration
        selectedTrack.updateEvent(note.id, { duration })
      }
      break
    case "CREATE_SONG":
      app.song = Song.emptySong()
      break
    case "SAVE_SONG":
      writeSong(song, params.filepath, e => {
        if (e) {
          console.error(e)
        }
      })
      break
    case "OPEN_SONG":
      readSong(params.filepath, (e, song) => {
        if (e) {
          console.error(e)
        }
        app.song = song
      })
      break
    case "UNDO":
      history.undo()
      break
    case "REDO":
      history.redo()
      break
    default:
      console.log(type, params)
      break
  }
}

export default dispatch
