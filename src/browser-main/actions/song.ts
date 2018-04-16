import Song, { emptySong } from "common/song"
import Track, { emptyTrack } from "common/track"
import { read as readSong, write as writeSong } from "midi/SongFile"

export default (rootStore) => {
  const { song, historyStore: history, services: { player } } = rootStore

  const saveHistory = () => {
    rootStore.pushHistory()
  }

  const setSong = song => {
    rootStore.song = song
    player.song = song
    player.reset()
    rootStore.trackMute.reset()
  }

  return {
    "CREATE_SONG": () => {
      setSong(emptySong())
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
          setSong(song)
          history.clear()
          rootStore.pushHistory()
        }
      })
    },
    "ADD_TRACK": () => {
      saveHistory()
      song.addTrack(emptyTrack(song.tracks.length - 1))
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