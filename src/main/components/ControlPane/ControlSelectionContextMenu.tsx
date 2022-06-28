import React, { FC, useCallback } from "react"
import { envString } from "../../../common/localize/envString"
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
          <HotKey>{envString.cmdOrCtrl}+X</HotKey>
        </Item>
        <Item onClick={onClickCopy} disabled={!isEventSelected}>
          {localized("copy", "Copy")}
          <HotKey>{envString.cmdOrCtrl}+C</HotKey>
        </Item>
        <Item onClick={onClickPaste}>
          {localized("paste", "Paste")}
          <HotKey>{envString.cmdOrCtrl}+V</HotKey>
        </Item>
        <Item onClick={onClickDuplicate} disabled={!isEventSelected}>
          {localized("duplicate", "Duplicate")}
          <HotKey>{envString.cmdOrCtrl}+D</HotKey>
        </Item>
        <Item onClick={onClickDelete} disabled={!isEventSelected}>
          {localized("delete", "Delete")}
          <HotKey>Del</HotKey>
        </Item>
      </ContextMenu>
    )
  }
)
