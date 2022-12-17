import { observer } from "mobx-react-lite"
import { FC } from "react"
import { Language } from "../../../common/localize/localizedString"
import { DialogContent, DialogTitle } from "../../../components/Dialog"
import { Localized } from "../../../components/Localized"
import { Select } from "../../../components/Select"
import { useStores } from "../../hooks/useStores"

const LanguageSelect: FC = observer(() => {
  const { settingStore } = useStores()
  return (
    <Select
      value={settingStore.language ?? "en"}
      onChange={(e) => (settingStore.language = e.target.value as Language)}
    >
      <option value="en">English</option>
      <option value="ja">Japanese</option>
      <option value="zh">Chinese</option>
    </Select>
  )
})

export const GeneralSettingsView: FC = observer(() => {
  return (
    <>
      <DialogTitle>
        <Localized default="General">general</Localized>
      </DialogTitle>
      <DialogContent>
        <LanguageSelect />
      </DialogContent>
    </>
  )
})
