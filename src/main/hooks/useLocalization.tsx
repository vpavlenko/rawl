import { localized } from "../../common/localize/localizedString"
import { useStores } from "./useStores"

export const useLocalization = () => {
  const { settingStore } = useStores()
  return (key: string, defaultValue: string) =>
    localized(key, defaultValue, settingStore.language ?? undefined)
}
