import { observer } from "mobx-react-lite"
import { FC } from "react"
import { CloudSong } from "../../repositories/ICloudSongRepository"
import { playSong } from "../actions/song"
import { useStores } from "../hooks/useStores"
import { SongListItem } from "./SongListItem"

export interface SongListProps {
  songs: CloudSong[]
}

export const SongList: FC<SongListProps> = observer(({ songs }) => {
  const rootStore = useStores()
  const {
    player,
    songStore: { currentSong },
  } = rootStore

  if (songs.length === 0) {
    return <div>No songs</div>
  }

  return (
    <>
      {songs.map((song) => (
        <SongListItem
          key={song.id}
          song={song}
          isPlaying={player.isPlaying && currentSong?.metadata.id === song.id}
          onClick={() => {
            if (player.isPlaying && currentSong?.metadata.id === song.id) {
              player.stop()
            } else {
              playSong(rootStore)(song)
            }
          }}
        />
      ))}
    </>
  )
})
