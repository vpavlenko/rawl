import { observer } from "mobx-react-lite"
import { FC, PropsWithChildren } from "react"
import { LocalizedContext } from "../../common/localize/useLocalized"

export const LocalizationProvider: FC<PropsWithChildren<{}>> = observer(
  ({ children }) => {
    return (
      <LocalizedContext.Provider value={{ language: null }}>
        {children}
      </LocalizedContext.Provider>
    )
  },
)
