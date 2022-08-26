import { observer } from "mobx-react-lite"
import { FC, useEffect } from "react"
import { useStores } from "../hooks/useStores"
import { SongListItem } from "./SongListItem"

export const SongList: FC = observer(() => {
  const { authStore, communitySongStore } = useStores()

  useEffect(() => {
    ;(async () => {
      if (authStore.user) {
        // TODO: Remove checking user is logged-in
        await communitySongStore.load()
      }
    })()
  }, [])

  const { songs } = communitySongStore

  const items = songs.map((d) => ({
    song: {
      id: d.id,
      name: d.data().name,
      updatedAt: new Date(d.data().updatedAt.toDate()),
    },
    user: {
      name: d.data().userId,
      photoURL: "",
    },
  }))

  return (
    <>
      {items.map((s) => (
        <SongListItem song={s.song} user={s.user} />
      ))}
    </>
  )
})
