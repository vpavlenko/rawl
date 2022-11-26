import React, { FC, useCallback } from "react"
import { envString } from "../../../common/localize/envString"
import { localized } from "../../../common/localize/localizedString"
import {
  ContextMenu,
  ContextMenuHotKey as HotKey,
  ContextMenuProps,
} from "../../../components/ContextMenu"
import { MenuDivider, MenuItem } from "../../../components/Menu"
import {
  copySelection,
  deleteSelection,
  duplicateSelection,
  pasteSelection,
  quantizeSelectedNotes,
  transposeSelection,
} from "../../actions"
import { useStores } from "../../hooks/useStores"

export const PianoSelectionContextMenu: FC<ContextMenuProps> = React.memo(
  (props) => {
    const { handleClose } = props
    const rootStore = useStores()
    const isNoteSelected = rootStore.pianoRollStore.selectedNoteIds.length > 0

    const onClickCut = useCallback(() => {
      copySelection(rootStore)()
      deleteSelection(rootStore)()
      handleClose()
    }, [])

    const onClickCopy = useCallback(() => {
      copySelection(rootStore)()
      handleClose()
    }, [])

    const onClickPaste = useCallback(() => {
      pasteSelection(rootStore)()
      handleClose()
    }, [])

    const onClickDuplicate = useCallback(() => {
      duplicateSelection(rootStore)()
      handleClose()
    }, [])

    const onClickDelete = useCallback(() => {
      deleteSelection(rootStore)()
      handleClose()
    }, [])

    const onClickOctaveUp = useCallback(() => {
      transposeSelection(rootStore)(12)
      handleClose()
    }, [])

    const onClickOctaveDown = useCallback(() => {
      transposeSelection(rootStore)(-12)
      handleClose()
    }, [])

    const onClickQuantize = useCallback(() => {
      quantizeSelectedNotes(rootStore)()
      handleClose()
    }, [])

    const onClickTranspose = useCallback(() => {
      rootStore.pianoRollStore.openTransposeDialog = true
      handleClose()
    }, [])

    return (
      <ContextMenu {...props}>
        <MenuItem onClick={onClickCut} disabled={!isNoteSelected}>
          {localized("cut", "Cut")}
          <HotKey>{envString.cmdOrCtrl}+X</HotKey>
        </MenuItem>
        <MenuItem onClick={onClickCopy} disabled={!isNoteSelected}>
          {localized("copy", "Copy")}
          <HotKey>{envString.cmdOrCtrl}+C</HotKey>
        </MenuItem>
        <MenuItem onClick={onClickPaste}>
          {localized("paste", "Paste")}
          <HotKey>{envString.cmdOrCtrl}+V</HotKey>
        </MenuItem>
        <MenuItem onClick={onClickDuplicate} disabled={!isNoteSelected}>
          {localized("duplicate", "Duplicate")}
          <HotKey>{envString.cmdOrCtrl}+D</HotKey>
        </MenuItem>
        <MenuItem onClick={onClickDelete} disabled={!isNoteSelected}>
          {localized("delete", "Delete")}
          <HotKey>Del</HotKey>
        </MenuItem>
        <MenuDivider />
        <MenuItem onClick={onClickOctaveUp} disabled={!isNoteSelected}>
          {localized("one-octave-up", "+1 Oct")}
          <HotKey>Shift+↑</HotKey>
        </MenuItem>
        <MenuItem onClick={onClickOctaveDown} disabled={!isNoteSelected}>
          {localized("one-octave-down", "-1 Oct")}
          <HotKey>Shift+↓</HotKey>
        </MenuItem>
        <MenuItem onClick={onClickTranspose} disabled={!isNoteSelected}>
          {localized("transpose", "Transpose")}
          <HotKey>T</HotKey>
        </MenuItem>
        <MenuDivider />
        <MenuItem onClick={onClickQuantize} disabled={!isNoteSelected}>
          {localized("quantize", "Quantize")}
          <HotKey>Q</HotKey>
        </MenuItem>
      </ContextMenu>
    )
  }
)
