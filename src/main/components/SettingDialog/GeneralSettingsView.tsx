import { observer } from "mobx-react-lite"
import { FC } from "react"
import { Language, getLanguage } from "../../../common/localize/localizedString"
import { DialogContent, DialogTitle } from "../../../components/Dialog"
import { Localized } from "../../../components/Localized"
import { Select } from "../../../components/Select"
import { useStores } from "../../hooks/useStores"

interface LanguageItem {
  label: string
  language: Language
}

const LanguageSelect: FC = observer(() => {
  const { settingStore } = useStores()
  const items: LanguageItem[] = [
    { label: "English", language: "en" },
    { label: "Japanese", language: "ja" },
    { label: "Chinese (Simplified)", language: "zh-Hans" },
    { label: "Chinese (Traditional)", language: "zh-Hant" },
  ]
  return (
    <Select
      value={settingStore.language ?? getLanguage() ?? "en"}
      onChange={(e) => (settingStore.language = e.target.value as Language)}
    >
      {items.map((item) => (
        <option key={item.language} value={item.language}>
          {item.label}
        </option>
      ))}
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
