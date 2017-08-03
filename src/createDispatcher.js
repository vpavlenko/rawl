import {
  PitchBendMidiEvent,
  VolumeMidiEvent,
  PanMidiEvent,
  ModulationMidiEvent
} from "./midi/MidiEvent"
import Track from "./model/Track"

export default (app) => (type, params) => {
  const { player, quantizer, song } = app
  const { tracks, selectedTrack } = song

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
        player.position += params.tick
      }
      break
    case "MUTE_TRACK": {
      const channel = tracks[params.trackId].channel
      const muted = player.isChannelMuted(channel)
      player.muteChannel(channel, !muted)
      break}
    case "SOLO_TRACK":{
      const channel = tracks[params.trackId].channel
      song.tracks.forEach((t, i) => {
        player.muteChannel(t.channel, t.channel !== channel)
      })
      break}
    case "CHANGE_NOTES_VELOCITY":
      return selectedTrack.transaction(it => {
        params.notes.forEach(item => {
          it.updateEvent(item.id, { velocity: params.velocity })
        })
      })
    case "CREATE_PITCH_BEND":
      return createOrUpdate("subtype", "pitchBend", params.tick, "value", params.value, () =>
        new PitchBendMidiEvent()
      )
    case "CREATE_VOLUME":
      return createOrUpdate("controllerType", 0x07, params.tick, "value", params.value, () =>
        new VolumeMidiEvent()
      )
    case "CREATE_PAN":
      return createOrUpdate("controllerType", 0x0a, params.tick, "value", params.value, () =>
        new PanMidiEvent()
      )
    case "CREATE_MODULATION":
      return createOrUpdate("controllerType", 0x01, params.tick, "value", params.value, () =>
        new ModulationMidiEvent()
      )
    case "SET_QUANTIZE_DENOMINATOR":
      quantizer.denominator = params.denominator
      break
    case "SET_TRACK_NAME":
      selectedTrack.setName(params.name)
      break
    case "SET_TRACK_VOLUME":
      tracks[params.trackId].volume = params.volume
      break
    case "SET_TRACK_PAN":
      tracks[params.trackId].pan = params.pan
      break
    case "SET_TRACK_INSTRUMENT":
      tracks[params.trackId].programNumber = params.programNumber
      break
    case "ADD_TRACK":
      song.addTrack(Track.emptyTrack(song.tracks.length - 1))
      break
    case "REMOVE_TRACK":
      song.removeTrack(params.trackId)
      break
    case "SELECT_TRACK":
      song.selectTrack(params.trackId)
      break
    case "SET_TEMPO":
      song.getTrack(0).tempo = params.tempo
      break
    case "REMOVE_EVENT":
      selectedTrack.removeEvent(params.eventId)
      break
    case "CREATE_NOTE": {
      const note = {
        type: "channel",
        subtype: "note",
        noteNumber: params.noteNumber,
        tick: quantizer.floor(params.tick),
        velocity: 127,
        duration: quantizer.unit,
        channel: selectedTrack.channel
      }
      selectedTrack.addEvent(note)
      player.playNote(note)
      return note.id
    }
    case "MOVE_NOTE": {
      const note = selectedTrack.getEventById(params.id)
      const pitchChanged = params.noteNumber !== note.noteNumber
      const n = selectedTrack.updateEvent(note.id, {
        tick: quantizer[params.quantize || "floor"](params.tick),
        noteNumber: params.noteNumber
      })

      if (pitchChanged) {
        player.playNote(n)
      }
      break
    }
    case "RESIZE_NOTE_LEFT": { // 右端を固定して長さを変更
      const tick = quantizer.round(params.tick)
      const note = selectedTrack.getEventById(params.id)
      const duration = note.duration + (note.tick - tick)
      if (note.tick !== params.tick && duration >= quantizer.unit) {
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
        selectedTrack.updateEvent(note.id, { duration })
      }
      break
    default:
      console.log(type, params)
      break
  }
}
