import { Menu } from "@material-ui/core"
import { FC } from "react"
import { IPoint } from "../../../common/geometry"
import { localized } from "../../../common/localize/localizedString"
import {
  arrangeCopySelection,
  arrangeDeleteSelection,
  arrangePasteSelection,
  arrangeTransposeSelection,
} from "../../actions/arrangeView"
import { useStores } from "../../hooks/useStores"
import {
  ContextMenuHotKey as HotKey,
  ContextMenuItem as Item,
} from "../ContextMenu/ContextMenu"

export interface ArrangeContextMenuProps {
  isOpen: boolean
  position: IPoint
  handleClose: () => void
}

export const ArrangeContextMenu: FC<ArrangeContextMenuProps> = ({
  isOpen,
  position,
  handleClose,
}) => {
  const rootStore = useStores()
  const isNoteSelected = Object.values(
    rootStore.arrangeViewStore.selectedEventIds
  ).some((e) => e.length > 0)

  return (
    <Menu
      keepMounted
      open={isOpen}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={{ top: position.y, left: position.x }}
    >
      <Item
        onClick={(e) => {
          e.stopPropagation()
          handleClose()
          arrangeCopySelection(rootStore)()
          arrangeDeleteSelection(rootStore)()
        }}
        disabled={!isNoteSelected}
      >
        {localized("cut", "Cut")}
        <HotKey>Ctrl+X</HotKey>
      </Item>
      <Item
        onClick={(e) => {
          e.stopPropagation()
          handleClose()
          arrangeCopySelection(rootStore)()
        }}
        disabled={!isNoteSelected}
      >
        {localized("copy", "Copy")}
        <HotKey>Ctrl+C</HotKey>
      </Item>
      <Item
        onClick={(e) => {
          e.stopPropagation()
          handleClose()
          arrangePasteSelection(rootStore)()
        }}
      >
        {localized("paste", "Paste")}
        <HotKey>Ctrl+V</HotKey>
      </Item>
      <Item
        onClick={(e) => {
          e.stopPropagation()
          handleClose()
          arrangeDeleteSelection(rootStore)()
        }}
        disabled={!isNoteSelected}
      >
        {localized("delete", "Delete")}
        <HotKey>Del</HotKey>
      </Item>
      <Item
        onClick={() => {
          arrangeTransposeSelection(rootStore)(12)
        }}
        disabled={!isNoteSelected}
      >
        {localized("one-octave-up", "+1 Oct")}
      </Item>
      <Item
        onClick={() => {
          arrangeTransposeSelection(rootStore)(-12)
        }}
        disabled={!isNoteSelected}
      >
        {localized("one-octave-down", "-1 Oct")}
      </Item>
    </Menu>
  )
}
