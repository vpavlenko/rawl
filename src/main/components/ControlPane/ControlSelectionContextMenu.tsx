import React, { FC, useCallback } from "react"
import { localized } from "../../../common/localize/localizedString"
import {
  copyControlSelection,
  deleteControlSelection,
  duplicateControlSelection,
  pasteControlSelection,
} from "../../actions/control"
import { useStores } from "../../hooks/useStores"
import {
  ContextMenu,
  ContextMenuHotKey as HotKey,
  ContextMenuItem as Item,
  ContextMenuProps,
} from "../ContextMenu/ContextMenu"

export const ControlSelectionContextMenu: FC<ContextMenuProps> = React.memo(
  (props) => {
    const { handleClose } = props
    const rootStore = useStores()
    const isEventSelected =
      rootStore.pianoRollStore.selectedControllerEventIds.length > 0

    const onClickCut = useCallback(() => {
      copyControlSelection(rootStore)()
      deleteControlSelection(rootStore)()
      handleClose()
    }, [])

    const onClickCopy = useCallback(() => {
      copyControlSelection(rootStore)()
      handleClose()
    }, [])

    const onClickPaste = useCallback(() => {
      pasteControlSelection(rootStore)()
      handleClose()
    }, [])

    const onClickDuplicate = useCallback(() => {
      duplicateControlSelection(rootStore)()
      handleClose()
    }, [])

    const onClickDelete = useCallback(() => {
      deleteControlSelection(rootStore)()
      handleClose()
    }, [])

    return (
      <ContextMenu {...props}>
        <Item onClick={onClickCut} disabled={!isEventSelected}>
          {localized("cut", "Cut")}
          <HotKey>Ctrl+X</HotKey>
        </Item>
        <Item onClick={onClickCopy} disabled={!isEventSelected}>
          {localized("copy", "Copy")}
          <HotKey>Ctrl+C</HotKey>
        </Item>
        <Item onClick={onClickPaste}>
          {localized("paste", "Paste")}
          <HotKey>Ctrl+V</HotKey>
        </Item>
        <Item onClick={onClickDuplicate} disabled={!isEventSelected}>
          {localized("duplicate", "Duplicate")}
          <HotKey>Ctrl+D</HotKey>
        </Item>
        <Item onClick={onClickDelete} disabled={!isEventSelected}>
          {localized("delete", "Delete")}
          <HotKey>Del</HotKey>
        </Item>
      </ContextMenu>
    )
  }
)
