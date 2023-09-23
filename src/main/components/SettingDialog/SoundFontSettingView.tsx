import styled from "@emotion/styled"
import Color from "color"
import RemoveIcon from "mdi-react/RemoveIcon"
import { observer } from "mobx-react-lite"
import { ChangeEvent, FC, useState } from "react"
import { Alert } from "../../../components/Alert"
import { Button } from "../../../components/Button"
import { CircularProgress } from "../../../components/CircularProgress"
import { DialogContent, DialogTitle } from "../../../components/Dialog"
import { Localized } from "../../../components/Localized"
import { RadioButton } from "../../../components/RadioButton"
import { useStores } from "../../hooks/useStores"
import { useToast } from "../../hooks/useToast"
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
  const toast = useToast()

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
                try {
                  await soundFontStore.load(file.id)
                } catch (e) {
                  toast.error((e as Error).message)
                } finally {
                  setIsLoading(false)
                }
              }}
              onClickDelete={async () => {
                await soundFontStore.removeSoundFont(file.id)
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
        <Alert severity="info" style={{ marginTop: "1rem" }}>
          <Localized default="SoundFont will be saved in the browser.">
            soundfont-save-notice
          </Localized>
        </Alert>
      </DialogContent>
    </>
  )
})

interface SoundFontRowProps {
  item: SoundFontFile
  isSelected: boolean
  onClick: () => void
  onClickDelete: () => void
}

const Remove = styled(RemoveIcon)`
  width: 1rem;
  color: ${({ theme }) => theme.secondaryTextColor};
`

const RowWrapper = styled.div`
  display: flex;
  align-items: center;
`

const SoundFontRow: FC<SoundFontRowProps> = ({
  item,
  isSelected,
  onClick,
  onClickDelete,
}) => {
  return (
    <RowWrapper>
      <RadioButton
        label={item.name}
        isSelected={isSelected}
        onClick={onClick}
      />
      {item.id >= 0 && (
        <Button
          style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}
          onClick={onClickDelete}
        >
          <Remove />
        </Button>
      )}
    </RowWrapper>
  )
}
