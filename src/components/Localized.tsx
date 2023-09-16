import { observer } from "mobx-react-lite"
import { FC } from "react"
import { localized } from "../common/localize/localizedString"
import { useStores } from "../main/hooks/useStores"

export interface LocalizedProps {
  children: string
  default: string
}

export const Localized: FC<LocalizedProps> = observer(
  ({ children, default: defaultValue }) => {
    const { settingStore } = useStores()
    return (
      <>
        {localized(
          children,
          defaultValue,
          settingStore.language ?? undefined,
        ) ?? defaultValue}
      </>
    )
  },
)
