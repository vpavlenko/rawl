import { observer } from "mobx-react-lite"
import { FC, useState } from "react"
import { CircularProgress } from "../../components/CircularProgress"
import { useToast } from "../../main/hooks/useToast"
import { CloudSong } from "../../repositories/ICloudSongRepository"
import { useAsyncEffect } from "../hooks/useAsyncEffect"
import { useStores } from "../hooks/useStores"
import { SongList } from "./SongList"

export const RecentSongList: FC = observer(() => {
  const rootStore = useStores()
  const { communitySongStore, cloudSongRepository } = rootStore
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [songs, setSongs] = useState<CloudSong[]>([])

  useAsyncEffect(async () => {
    try {
      const songs = await cloudSongRepository.getPublicSongs()
      communitySongStore.songs = songs
      setSongs(songs)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  if (isLoading) {
    return (
      <>
        <CircularProgress /> Loading...
      </>
    )
  }

  return <SongList songs={songs} />
})
