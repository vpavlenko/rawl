import Song from "../stores/Song.ts"
import Track from "../stores/Track.ts"
import { emptyTrack } from "../stores/TrackFactory"
import { read as readSong, write as writeSong } from "../midi/SongFile.ts"

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
      setSong(Song.emptySong())
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