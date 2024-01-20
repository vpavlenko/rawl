import { observer } from "mobx-react-lite"
import { FC } from "react"
import { CloudSong } from "../../repositories/ICloudSongRepository"
import { SongListItem } from "./SongListItem"

export interface SongListProps {
  songs: CloudSong[]
}

export const SongList: FC<SongListProps> = observer(({ songs }) => {
  if (songs.length === 0) {
    return <div>No songs</div>
  }

  return (
    <>
      {songs.map((song) => (
        <SongListItem key={song.id} song={song} />
      ))}
    </>
  )
})
