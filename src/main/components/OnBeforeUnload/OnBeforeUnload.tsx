import { observer } from "mobx-react-lite"
import { useEffect } from "react"
import { localized } from "../../../common/localize/localizedString"
import { useStores } from "../../hooks/useStores"

export const OnBeforeUnload = observer(() => {
  const rootStore = useStores()

  useEffect(() => {
    const listener = (e: BeforeUnloadEvent) => {
      if (!rootStore.song.isSaved) {
        e.returnValue = localized(
          "confirm-close",
          "Your edits have not been saved. Be sure to download it before exiting. Do you really want to close it?"
        )
      }
    }
    window.addEventListener("beforeunload", listener)

    return () => {
      window.removeEventListener("beforeunload", listener)
    }
  }, [])
  return <></>
})
