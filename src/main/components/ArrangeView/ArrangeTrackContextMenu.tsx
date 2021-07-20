import { Menu, MenuItem } from "@material-ui/core"
import { FC } from "react"
import { IPoint } from "../../../common/geometry"
import { localized } from "../../../common/localize/localizedString"
import { duplicateTrack, insertTrack, removeTrack } from "../../actions"
import { useStores } from "../../hooks/useStores"

export interface ArrangeTrackContextMenuProps {
  isOpen: boolean
  position: IPoint
  handleClose: () => void
}

export const ArrangeTrackContextMenu: FC<ArrangeTrackContextMenuProps> = ({
  isOpen,
  position,
  handleClose,
}) => {
  const rootStore = useStores()
  const {
    song: { tracks },
    arrangeViewStore: { selectedTrackId },
  } = rootStore

  return (
    <Menu
      keepMounted
      open={isOpen}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={{ top: position.y, left: position.x }}
    >
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
    </Menu>
  )
}
