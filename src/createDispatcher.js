import { PitchBendMidiEvent } from "./midi/MidiEvent"
import Track from "./model/Track"

export default (app) => (type, params) => {
  const { player, quantizer, song } = app
  const { tracks, selectedTrack } = song

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
      const event = new PitchBendMidiEvent(0, params.value)
      event.tick = params.tick
      return selectedTrack.addEvent(event)
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
    default:
      console.log(type, params)
      break
  }
}
