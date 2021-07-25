import { FC } from "react"
import { localized } from "../../../common/localize/localizedString"
import {
  arrangeCopySelection,
  arrangeDeleteSelection,
  arrangePasteSelection,
  arrangeTransposeSelection,
} from "../../actions/arrangeView"
import { useStores } from "../../hooks/useStores"
import {
  ContextMenu,
  ContextMenuHotKey as HotKey,
  ContextMenuItem as Item,
  ContextMenuProps,
} from "../ContextMenu/ContextMenu"

export const ArrangeContextMenu: FC<ContextMenuProps> = (props) => {
  const { handleClose } = props
  const rootStore = useStores()
  const isNoteSelected = Object.values(
    rootStore.arrangeViewStore.selectedEventIds
  ).some((e) => e.length > 0)

  return (
    <ContextMenu {...props}>
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
        onClick={(e) => {
          e.stopPropagation()
          handleClose()
          arrangeTransposeSelection(rootStore)(12)
        }}
        disabled={!isNoteSelected}
      >
        {localized("one-octave-up", "+1 Oct")}
      </Item>
      <Item
        onClick={(e) => {
          e.stopPropagation()
          handleClose()
          arrangeTransposeSelection(rootStore)(-12)
        }}
        disabled={!isNoteSelected}
      >
        {localized("one-octave-down", "-1 Oct")}
      </Item>
    </ContextMenu>
  )
}
