import { FC } from "react"
import { localized } from "../../../common/localize/localizedString"
import { ContextMenu, ContextMenuProps } from "../../../components/ContextMenu"
import { MenuItem } from "../../../components/Menu"
import { duplicateTrack, insertTrack, removeTrack } from "../../actions"
import { useStores } from "../../hooks/useStores"

export const ArrangeTrackContextMenu: FC<ContextMenuProps> = (props) => {
  const { handleClose } = props
  const rootStore = useStores()
  const {
    song: { tracks },
    arrangeViewStore: { selectedTrackId },
  } = rootStore

  return (
    <ContextMenu {...props}>
      <MenuItem
        onClick={(e) => {
          e.stopPropagation()
          insertTrack(rootStore)(selectedTrackId + 1)
          handleClose()
        }}
      >
        {localized("add-track", "Add track")}
      </MenuItem>
      {selectedTrackId > 0 && tracks.length > 2 && (
        <MenuItem
          onClick={(e) => {
            e.stopPropagation()
            removeTrack(rootStore)(selectedTrackId)
            handleClose()
          }}
        >
          {localized("delete-track", "Delete track")}
        </MenuItem>
      )}
      {selectedTrackId > 0 && (
        <MenuItem
          onClick={(e) => {
            e.stopPropagation()
            duplicateTrack(rootStore)(selectedTrackId)
            handleClose()
          }}
        >
          {localized("duplicate-track", "Duplicate track")}
        </MenuItem>
      )}
    </ContextMenu>
  )
}
