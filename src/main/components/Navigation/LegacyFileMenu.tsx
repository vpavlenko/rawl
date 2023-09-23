import { observer } from "mobx-react-lite"
import { ChangeEvent, FC } from "react"
import { Localized } from "../../../components/Localized"
import { MenuDivider, MenuItem } from "../../../components/Menu"
import { createSong, openSong, saveSong } from "../../actions"
import { useLocalization } from "../../hooks/useLocalization"
import { useStores } from "../../hooks/useStores"
import { useToast } from "../../hooks/useToast"

const fileInputID = "OpenButtonInputFile"

export const FileInput: FC<
  React.PropsWithChildren<{
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
    accept?: string
  }>
> = ({ onChange, children, accept }) => (
  <>
    <input
      accept={accept}
      style={{ display: "none" }}
      id={fileInputID}
      type="file"
      onChange={onChange}
    />
    <label htmlFor={fileInputID}>{children}</label>
  </>
)

export const LegacyFileMenu: FC<{ close: () => void }> = observer(
  ({ close }) => {
    const rootStore = useStores()
    const toast = useToast()
    const localized = useLocalization()

    const onClickNew = () => {
      const { song } = rootStore
      close()
      if (
        song.isSaved ||
        confirm(localized("confirm-new", "Are you sure you want to continue?"))
      ) {
        createSong(rootStore)()
      }
    }

    const onClickOpen = async (e: ChangeEvent<HTMLInputElement>) => {
      close()
      try {
        await openSong(rootStore)(e.currentTarget)
      } catch (e) {
        toast.error((e as Error).message)
      }
    }

    const onClickSave = () => {
      close()
      saveSong(rootStore)()
    }

    return (
      <>
        <MenuItem onClick={onClickNew}>
          <Localized default="New">new-song</Localized>
        </MenuItem>

        <MenuDivider />

        <FileInput onChange={onClickOpen} accept="audio/midi">
          <MenuItem>
            <Localized default="Open">open-song</Localized>
          </MenuItem>
        </FileInput>

        <MenuItem onClick={onClickSave}>
          <Localized default="Save">save-song</Localized>
        </MenuItem>
      </>
    )
  },
)
