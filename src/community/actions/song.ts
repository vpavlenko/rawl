import { CloudSong } from "../../repositories/ICloudSongRepository"
import RootStore from "../stores/RootStore"

export const playSong =
  ({ songStore, player }: RootStore) =>
  async (song: CloudSong) => {
    await songStore.loadSong(song)
    player.reset()
    player.play()
  }

const playSongAt =
  (indexDelta: number) => (rootStore: RootStore) => async () => {
    const { songStore, communitySongStore } = rootStore
    const currentSong = songStore.currentSong
    if (currentSong === null) {
      return
    }
    const index = communitySongStore.songs.findIndex(
      (s) => s.id === currentSong.metadata.id,
    )
    const nextIndex =
      index + indexDelta < 0
        ? communitySongStore.songs.length - 1
        : (index + indexDelta) % communitySongStore.songs.length
    const nextSong = communitySongStore.songs[nextIndex]
    await playSong(rootStore)(nextSong)
  }

export const playPreviousSong = playSongAt(-1)
export const playNextSong = playSongAt(1)
