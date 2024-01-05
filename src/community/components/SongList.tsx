import { observer } from "mobx-react-lite"
import { FC, useEffect } from "react"
import { playSong } from "../actions/song"
import { useStores } from "../hooks/useStores"
import { SongListItem } from "./SongListItem"

export const SongList: FC = observer(() => {
  const rootStore = useStores()
  const { communitySongStore } = rootStore

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
          onClick={() => playSong(rootStore)(song)}
        />
      ))}
    </>
  )
})
