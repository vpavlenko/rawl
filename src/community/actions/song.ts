import { debounce } from "lodash"
import {
  CloudSong,
  ICloudSongRepository,
} from "../../repositories/ICloudSongRepository"
import RootStore from "../stores/RootStore"

const debouncedIncrementPlayCount = debounce(
  (cloudSongRepository: ICloudSongRepository, songId: string) =>
    cloudSongRepository.incrementPlayCount(songId),
  5000,
)

export const playSong =
  ({ songStore, player, cloudSongRepository }: RootStore) =>
  async (song: CloudSong) => {
    await songStore.loadSong(song)
    player.reset()
    player.play()

    try {
      await debouncedIncrementPlayCount(cloudSongRepository, song.id)
    } catch (e) {
      console.error(e)
    }
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
