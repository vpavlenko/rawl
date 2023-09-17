import styled from "@emotion/styled"
import { observer } from "mobx-react-lite"
import { ChangeEvent, FC } from "react"
import { Button } from "../../../components/Button"
import { DialogContent, DialogTitle } from "../../../components/Dialog"
import { Localized } from "../../../components/Localized"
import { useStores } from "../../hooks/useStores"
import { SoundFontFile } from "../../stores/SoundFontStore"
import { FileInput } from "../Navigation/LegacyFileMenu"

const OpenFileButton = styled(Button)`
  display: inline-flex;
`

export const SoundFontSettingsView: FC = observer(() => {
  const { soundFontStore } = useStores()
  const { files, selectedSoundFontId } = soundFontStore
  // TODO: add open local file dialog and put it to SoundFontStore
  const onOpenSoundFont = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const file = e.currentTarget.files?.item(0)
    if (file) {
      const arrayBuffer = await file.arrayBuffer()
      soundFontStore.addSoundFont(arrayBuffer, file.name)
    }
  }

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
        <FileInput onChange={onOpenSoundFont} accept=".sf2">
          <OpenFileButton as="div">
            <Localized default="Add">add</Localized>
          </OpenFileButton>
        </FileInput>
      </DialogContent>
    </>
  )
})

interface SoundFontRowProps {
  item: SoundFontFile
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
