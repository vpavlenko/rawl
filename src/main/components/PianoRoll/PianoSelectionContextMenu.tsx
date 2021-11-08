import { Divider } from "@mui/material"
import React, { FC, useCallback } from "react"
import { localized } from "../../../common/localize/localizedString"
import {
  copySelection,
  deleteSelection,
  duplicateSelection,
  pasteSelection,
  quantizeSelectedNotes,
  transposeSelection,
} from "../../actions"
import { useStores } from "../../hooks/useStores"
import {
  ContextMenu,
  ContextMenuHotKey as HotKey,
  ContextMenuItem as Item,
  ContextMenuProps,
} from "../ContextMenu/ContextMenu"

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

    return (
      <ContextMenu {...props}>
        <Item onClick={onClickCut} disabled={!isNoteSelected}>
          {localized("cut", "Cut")}
          <HotKey>Ctrl+X</HotKey>
        </Item>
        <Item onClick={onClickCopy} disabled={!isNoteSelected}>
          {localized("copy", "Copy")}
          <HotKey>Ctrl+C</HotKey>
        </Item>
        <Item onClick={onClickPaste}>
          {localized("paste", "Paste")}
          <HotKey>Ctrl+V</HotKey>
        </Item>
        <Item onClick={onClickDuplicate} disabled={!isNoteSelected}>
          {localized("duplicate", "Duplicate")}
          <HotKey>Ctrl+D</HotKey>
        </Item>
        <Item onClick={onClickDelete} disabled={!isNoteSelected}>
          {localized("delete", "Delete")}
          <HotKey>Del</HotKey>
        </Item>
        <Divider />
        <Item onClick={onClickOctaveUp} disabled={!isNoteSelected}>
          {localized("one-octave-up", "+1 Oct")}
          <HotKey>Shift+↑</HotKey>
        </Item>
        <Item onClick={onClickOctaveDown} disabled={!isNoteSelected}>
          {localized("one-octave-down", "-1 Oct")}
          <HotKey>Shift+↓</HotKey>
        </Item>
        <Item onClick={onClickQuantize} disabled={!isNoteSelected}>
          {localized("quantize", "Quantize")}
          <HotKey>Q</HotKey>
        </Item>
      </ContextMenu>
    )
  }
)
