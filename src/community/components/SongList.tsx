import { observer } from "mobx-react-lite"
import { FC } from "react"
import { useToast } from "../../main/hooks/useToast"
import { playSong } from "../actions/song"
import { useAsyncEffect } from "../hooks/useAsyncEffect"
import { useStores } from "../hooks/useStores"
import { SongListItem } from "./SongListItem"

export const SongList: FC = observer(() => {
  const rootStore = useStores()
  const {
    player,
    communitySongStore,
    songStore: { currentSong },
  } = rootStore
  const toast = useToast()

  useAsyncEffect(async () => {
    try {
      await communitySongStore.load()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }, [])

  const { songs } = communitySongStore

  if (songs.length === 0) {
    return <div>No songs</div>
  }

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
