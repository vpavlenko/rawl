import { DocumentReference } from "firebase/firestore"
import { useStores } from "./useStores"

export const usePlayer = () => {
  const rootStore = useStores()

  return {
    play: async (ref: DocumentReference) => {
      await rootStore.songStore.loadSong(ref)
      rootStore.player.reset()
      rootStore.player.play()
    },
  }
}
