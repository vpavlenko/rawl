import { observer } from "mobx-react-lite"
import { FC } from "react"
import { DialogContent, DialogTitle } from "../../../components/Dialog"
import { Localized } from "../../../components/Localized"
import { useStores } from "../../hooks/useStores"
import { Metadata } from "../../services/IndexedDBStorage"

export const SoundFontSettingsView: FC = observer(() => {
  const { soundFontStore } = useStores()
  const { files, selectedSoundFontId } = soundFontStore
  // TODO: add open local file dialog and put it to SoundFontStore
  return (
    <>
      <DialogTitle>
        <Localized default="SoundFont">soundfont</Localized>
      </DialogTitle>
      <DialogContent>
        {files.map((file) => (
          <SoundFontRow
            key={file.id}
            isSelected={file.id === selectedSoundFontId}
            item={file}
            onClick={async () => {
              await soundFontStore.load(file.id)
            }}
          />
        ))}
      </DialogContent>
    </>
  )
})

interface SoundFontRowProps {
  item: Metadata
  isSelected: boolean
  onClick: () => void
}

const SoundFontRow: FC<SoundFontRowProps> = ({ item, isSelected, onClick }) => {
  return (
    <div onClick={onClick}>
      {isSelected ? "✓" : "○"}
      {item.name}
    </div>
  )
}
