import { observer } from "mobx-react-lite"
import { FC, useEffect } from "react"
import { playSong } from "../actions/song"
import { useStores } from "../hooks/useStores"
import { SongListItem } from "./SongListItem"

export const SongList: FC = observer(() => {
  const rootStore = useStores()
  const {
    player,
    communitySongStore,
    songStore: { currentSong },
  } = rootStore

  useEffect(() => {
    ;(async () => {
      await communitySongStore.load()
    })()
  }, [])

  const { songs } = communitySongStore

  return (
    <>
      {songs.map((song) => (
        <SongListItem
          song={{
            name: song.name,
            updatedAt: song.updatedAt,
          }}
          user={{
            name: song.userId,
            photoURL: "",
          }}
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
