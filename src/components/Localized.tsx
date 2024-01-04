import { observer } from "mobx-react-lite"
import { FC } from "react"
import { useLocalized } from "../common/localize/useLocalized"

export interface LocalizedProps {
  children: string
  default: string
}

export const Localized: FC<LocalizedProps> = observer(
  ({ children, default: defaultValue }) => {
    const localized = useLocalized()
    return <>{localized(children, defaultValue)}</>
  },
)
