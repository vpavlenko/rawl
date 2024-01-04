import { createContext, useContext } from "react"
import { Language, localized } from "./localizedString"

type LocalizedContextType = {
  language: Language | null
}

export const LocalizedContext = createContext<LocalizedContextType>({
  language: null,
})

export const useLocalization = () => {
  const context = useContext(LocalizedContext)

  if (!context) {
    throw new Error(
      "useLocalized must be used within a LocalizedContextProvider",
    )
  }

  return (key: string, defaultValue: string) =>
    localized(key, defaultValue, context.language ?? undefined)
}
