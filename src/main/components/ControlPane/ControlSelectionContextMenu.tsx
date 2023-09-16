import React, { FC, useCallback } from "react"
import { envString } from "../../../common/localize/envString"
import {
  ContextMenu,
  ContextMenuProps,
  ContextMenuHotKey as HotKey,
} from "../../../components/ContextMenu"
import { Localized } from "../../../components/Localized"
import { MenuItem } from "../../../components/Menu"
import {
  copyControlSelection,
  deleteControlSelection,
  duplicateControlSelection,
  pasteControlSelection,
} from "../../actions/control"
import { useStores } from "../../hooks/useStores"

export const ControlSelectionContextMenu: FC<ContextMenuProps> = React.memo(
  (props) => {
    const { handleClose } = props
    const rootStore = useStores()
    const { controlStore } = rootStore
    const isEventSelected = controlStore.selectedEventIds.length > 0

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
        <MenuItem onClick={onClickCut} disabled={!isEventSelected}>
          <Localized default="Cut">cut</Localized>
          <HotKey>{envString.cmdOrCtrl}+X</HotKey>
        </MenuItem>
        <MenuItem onClick={onClickCopy} disabled={!isEventSelected}>
          <Localized default="Copy">copy</Localized>
          <HotKey>{envString.cmdOrCtrl}+C</HotKey>
        </MenuItem>
        <MenuItem onClick={onClickPaste}>
          <Localized default="Paste">paste</Localized>
          <HotKey>{envString.cmdOrCtrl}+V</HotKey>
        </MenuItem>
        <MenuItem onClick={onClickDuplicate} disabled={!isEventSelected}>
          <Localized default="Duplicate">duplicate</Localized>
          <HotKey>{envString.cmdOrCtrl}+D</HotKey>
        </MenuItem>
        <MenuItem onClick={onClickDelete} disabled={!isEventSelected}>
          <Localized default="Delete">delete</Localized>
          <HotKey>Del</HotKey>
        </MenuItem>
      </ContextMenu>
    )
  },
)
