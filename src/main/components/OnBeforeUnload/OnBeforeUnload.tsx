import { useEffect } from "react"
import { localized } from "../../../common/localize/localizedString"

export const OnBeforeUnload = () => {
  useEffect(() => {
    const listener = (e: BeforeUnloadEvent) => {
      e.returnValue = localized(
        "confirm-close",
        "Your edits have not been saved. Be sure to download it before exiting. Do you really want to close it?"
      )
    }
    window.addEventListener("beforeunload", listener)

    return () => {
      window.removeEventListener("beforeunload", listener)
    }
  }, [])
  return <></>
}
