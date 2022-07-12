import { Divider, MenuItem } from "@mui/material"
import { observer } from "mobx-react-lite"
import { ChangeEvent, FC } from "react"
import { localized } from "../../../common/localize/localizedString"
import { createSong, openSong, saveSong } from "../../actions"
import { useStores } from "../../hooks/useStores"

const fileInputID = "OpenButtonInputFile"

export const FileInput: FC<
  React.PropsWithChildren<{
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
  }>
> = ({ onChange, children }) => (
  <>
    <input
      accept="audio/midi"
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
      await openSong(rootStore)(e.currentTarget)
    }

    const onClickSave = () => {
      close()
      saveSong(rootStore)()
    }

    return (
      <>
        <MenuItem onClick={onClickNew}>{localized("new-song", "New")}</MenuItem>

        <Divider />

        <FileInput onChange={onClickOpen}>
          <MenuItem>{localized("open-song", "Open")}</MenuItem>
        </FileInput>

        <MenuItem onClick={onClickSave}>
          {localized("save-song", "Save")}
        </MenuItem>
      </>
    )
  }
)
