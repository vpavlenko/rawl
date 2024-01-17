import { observer } from "mobx-react-lite"
import { FC, PropsWithChildren } from "react"
import { LocalizedContext } from "../../../common/localize/useLocalization"
import { useStores } from "../../hooks/useStores"

export const LocalizationProvider: FC<PropsWithChildren<{}>> = observer(
  ({ children }) => {
    const { settingStore } = useStores()
    return (
      <LocalizedContext.Provider value={{ language: settingStore.language }}>
        {children}
      </LocalizedContext.Provider>
    )
  },
)
