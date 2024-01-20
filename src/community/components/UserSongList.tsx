import { observer } from "mobx-react-lite"
import { FC, useState } from "react"
import { CircularProgress } from "../../components/CircularProgress"
import { useToast } from "../../main/hooks/useToast"
import { CloudSong } from "../../repositories/ICloudSongRepository"
import { useAsyncEffect } from "../hooks/useAsyncEffect"
import { useStores } from "../hooks/useStores"
import { SongList } from "./SongList"

export interface UserSongListProps {
  userId: string
}

export const UserSongList: FC<UserSongListProps> = observer(({ userId }) => {
  const rootStore = useStores()
  const {
    communitySongStore,
    cloudSongRepository,
    authStore: { authUser },
  } = rootStore
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [songs, setSongs] = useState<CloudSong[]>([])

  useAsyncEffect(async () => {
    try {
      let songs: CloudSong[]
      if (userId === authUser?.uid) {
        songs = await cloudSongRepository.getMySongs()
      } else {
        songs = await cloudSongRepository.getPublicSongsByUser(userId)
      }
      communitySongStore.songs = songs
      setSongs(songs)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  if (isLoading) {
    return (
      <>
        <CircularProgress /> Loading...
      </>
    )
  }

  return <SongList songs={songs} />
})
