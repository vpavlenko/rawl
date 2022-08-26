import { FC } from "react"
import mock from "./MOCK_DATA.json"
import { SongListItem } from "./SongListItem"

export const SongList: FC = () => {
  const songs = mock.map((d) => ({
    song: {
      id: d.id,
      name: d.song_name,
      updatedAt: new Date(d.created_at),
    },
    user: {
      name: d.name,
      photoURL: d.avatar,
    },
  }))

  return (
    <>
      {songs.map((s) => (
        <SongListItem song={s.song} user={s.user} />
      ))}
    </>
  )
}
