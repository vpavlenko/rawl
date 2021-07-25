import { FC } from "react"
import { localized } from "../../../common/localize/localizedString"
import { duplicateTrack, insertTrack, removeTrack } from "../../actions"
import { useStores } from "../../hooks/useStores"
import {
  ContextMenu,
  ContextMenuItem as Item,
  ContextMenuProps,
} from "../ContextMenu/ContextMenu"

export const ArrangeTrackContextMenu: FC<ContextMenuProps> = (props) => {
  const { handleClose } = props
  const rootStore = useStores()
  const {
    song: { tracks },
    arrangeViewStore: { selectedTrackId },
  } = rootStore

  return (
    <ContextMenu {...props}>
      <Item
        onClick={(e) => {
          e.stopPropagation()
          insertTrack(rootStore)(selectedTrackId + 1)
          handleClose()
        }}
      >
        {localized("add-track", "Add track")}
      </Item>
      {selectedTrackId > 0 && tracks.length > 2 && (
        <Item
          onClick={(e) => {
            e.stopPropagation()
            removeTrack(rootStore)(selectedTrackId)
            handleClose()
          }}
        >
          {localized("delete-track", "Delete track")}
        </Item>
      )}
      {selectedTrackId > 0 && (
        <Item
          onClick={(e) => {
            e.stopPropagation()
            duplicateTrack(rootStore)(selectedTrackId)
            handleClose()
          }}
        >
          {localized("duplicate-track", "Duplicate track")}
        </Item>
      )}
    </ContextMenu>
  )
}
