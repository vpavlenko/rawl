import { FC } from "react"
import { envString } from "../../../common/localize/envString"
import { localized } from "../../../common/localize/localizedString"
import {
  ContextMenu,
  ContextMenuHotKey as HotKey,
  ContextMenuProps,
} from "../../../components/ContextMenu"
import { MenuDivider, MenuItem } from "../../../components/Menu"
import {
  arrangeCopySelection,
  arrangeDeleteSelection,
  arrangePasteSelection,
  arrangeTransposeSelection,
} from "../../actions/arrangeView"
import { useStores } from "../../hooks/useStores"

export const ArrangeContextMenu: FC<ContextMenuProps> = (props) => {
  const { handleClose } = props
  const rootStore = useStores()
  const isNoteSelected = Object.values(
    rootStore.arrangeViewStore.selectedEventIds
  ).some((e) => e.length > 0)

  return (
    <ContextMenu {...props}>
      <MenuItem
        onClick={(e) => {
          e.stopPropagation()
          handleClose()
          arrangeCopySelection(rootStore)()
          arrangeDeleteSelection(rootStore)()
        }}
        disabled={!isNoteSelected}
      >
        {localized("cut", "Cut")}
        <HotKey>{envString.cmdOrCtrl}+X</HotKey>
      </MenuItem>
      <MenuItem
        onClick={(e) => {
          e.stopPropagation()
          handleClose()
          arrangeCopySelection(rootStore)()
        }}
        disabled={!isNoteSelected}
      >
        {localized("copy", "Copy")}
        <HotKey>{envString.cmdOrCtrl}+C</HotKey>
      </MenuItem>
      <MenuItem
        onClick={(e) => {
          e.stopPropagation()
          handleClose()
          arrangePasteSelection(rootStore)()
        }}
      >
        {localized("paste", "Paste")}
        <HotKey>{envString.cmdOrCtrl}+V</HotKey>
      </MenuItem>
      <MenuItem
        onClick={(e) => {
          e.stopPropagation()
          handleClose()
          arrangeDeleteSelection(rootStore)()
        }}
        disabled={!isNoteSelected}
      >
        {localized("delete", "Delete")}
        <HotKey>Del</HotKey>
      </MenuItem>
      <MenuDivider />
      <MenuItem
        onClick={(e) => {
          e.stopPropagation()
          handleClose()
          arrangeTransposeSelection(rootStore)(12)
        }}
        disabled={!isNoteSelected}
      >
        {localized("one-octave-up", "+1 Oct")}
      </MenuItem>
      <MenuItem
        onClick={(e) => {
          e.stopPropagation()
          handleClose()
          arrangeTransposeSelection(rootStore)(-12)
        }}
        disabled={!isNoteSelected}
      >
        {localized("one-octave-down", "-1 Oct")}
      </MenuItem>
      <MenuItem
        onClick={(e) => {
          e.stopPropagation()
          handleClose()
          rootStore.arrangeViewStore.openTransposeDialog = true
        }}
        disabled={!isNoteSelected}
      >
        {localized("transpose", "Transpose")}
        <HotKey>T</HotKey>
      </MenuItem>
    </ContextMenu>
  )
}
