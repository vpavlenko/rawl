import styled from "@emotion/styled"
import Color from "color"
import CircleIcon from "mdi-react/CircleIcon"
import { observer } from "mobx-react-lite"
import { ChangeEvent, FC, useState } from "react"
import { Button } from "../../../components/Button"
import { CircularProgress } from "../../../components/CircularProgress"
import { DialogContent, DialogTitle } from "../../../components/Dialog"
import { Localized } from "../../../components/Localized"
import { useStores } from "../../hooks/useStores"
import { SoundFontFile } from "../../stores/SoundFontStore"
import { FileInput } from "../Navigation/LegacyFileMenu"

const OpenFileButton = styled(Button)`
  display: inline-flex;
  align-items: center;
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  overflow-y: auto;
`

const Overlay = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  background-color: ${({ theme }) =>
    Color(theme.backgroundColor).alpha(0.5).toString()};
  color: ${({ theme }) => theme.textColor};
  width: 100%;
  height: 100%;
  z-index: 1;
`

export const SoundFontSettingsView: FC = observer(() => {
  const { soundFontStore } = useStores()
  const { files, selectedSoundFontId } = soundFontStore
  const [isLoading, setIsLoading] = useState(false)

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
        <List>
          {files.map((file) => (
            <SoundFontRow
              key={file.id}
              isSelected={file.id === selectedSoundFontId}
              item={file}
              onClick={async () => {
                setIsLoading(true)
                await soundFontStore.load(file.id)
                setIsLoading(false)
              }}
            />
          ))}
          {isLoading && (
            <Overlay>
              <CircularProgress />
            </Overlay>
          )}
        </List>
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

const RadioButton = styled.div`
  display: inline-flex;
  width: 1.25rem;
  height: 1.25rem;
  border: 1px solid ${({ theme }) => theme.dividerColor};
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
`

const CheckIcon = styled(CircleIcon)`
  fill: ${({ theme }) => theme.textColor};
  width: 0.7rem;
  height: 0.7rem;
`

const RowWrapper = styled.div`
  display: flex;
  padding: 0.5rem 0;
  align-items: center;
`

const RowLabel = styled.span`
  margin-left: 0.5rem;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.secondaryTextColor};
`

const SoundFontRow: FC<SoundFontRowProps> = ({ item, isSelected, onClick }) => {
  return (
    <RowWrapper onClick={onClick}>
      <RadioButton>{isSelected && <CheckIcon />}</RadioButton>
      <RowLabel>{item.name}</RowLabel>
    </RowWrapper>
  )
}
