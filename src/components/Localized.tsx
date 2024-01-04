import { observer } from "mobx-react-lite"
import { FC } from "react"
import { useLocalization } from "../common/localize/useLocalization"

export interface LocalizedProps {
  children: string
  default: string
}

export const Localized: FC<LocalizedProps> = observer(
  ({ children, default: defaultValue }) => {
    const localized = useLocalization()
    return <>{localized(children, defaultValue)}</>
  },
)
