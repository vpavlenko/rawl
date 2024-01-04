import { observer } from "mobx-react-lite"
import { FC, PropsWithChildren } from "react"
import { LocalizedContext } from "../../common/localize/useLocalization"

export const LocalizationProvider: FC<PropsWithChildren<{}>> = observer(
  ({ children }) => {
    return (
      <LocalizedContext.Provider
        value={{
          language: null, // Use the browser's language
        }}
      >
        {children}
      </LocalizedContext.Provider>
    )
  },
)
