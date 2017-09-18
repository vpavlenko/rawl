import Song from "../model/Song"
import Track from "../model/Track"
import { read as readSong, write as writeSong } from "../midi/SongFile"

export default (app, history) => {
  const { song } = app

  const saveHistory = () => {
    history.push({}, song)
  }

  return {
    "CREATE_SONG": () => {
      app.song = Song.emptySong()
    },
    "SAVE_SONG": ({ filepath }) => {
      writeSong(song, filepath, e => {
        if (e) {
          console.error(e)
        } else {
          song.filepath = filepath
        }
      })
    },
    "OPEN_SONG": ({ filepath }) => {
      readSong(filepath, (e, song) => {
        if (e) {
          console.error(e)
        } else {
          app.song = song
          history.clear()
          history.push({}, song)
        }
      })
    },
    "ADD_TRACK": () => {
      saveHistory()
      song.addTrack(Track.emptyTrack(song.tracks.length - 1))
    },
    "REMOVE_TRACK": ({ trackId }) => {
      saveHistory()
      song.removeTrack(trackId)
    },
    "SELECT_TRACK": ({ trackId }) => {
      song.selectTrack(trackId)
    },
    "SET_TEMPO": ({ tempo }) => {
      saveHistory()
      song.getTrack(0).tempo = tempo
    }
  }
}