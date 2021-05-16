import { Divider, Menu, MenuItem } from "@material-ui/core"
import React, { FC, useCallback } from "react"
import styled from "styled-components"
import { IPoint } from "../../../common/geometry"
import { localized } from "../../../common/localize/localizedString"
import {
  copySelection,
  deleteSelection,
  duplicateSelection,
  pasteSelection,
  transposeSelection,
} from "../../actions"
import { useStores } from "../../hooks/useStores"

export interface PianoSelectionContextMenuProps {
  isOpen: boolean
  position: IPoint
  handleClose: () => void
}

const Item = styled(MenuItem)`
  font-size: 0.8rem;
`

const HotKey = styled.div`
  font-size: 0.9em;
  flex-grow: 1;
  text-align: right;
  color: var(--secondary-text-color);
  margin-left: 2em;
`

export const PianoSelectionContextMenu: FC<PianoSelectionContextMenuProps> =
  React.memo(({ isOpen, position, handleClose }) => {
    const rootStore = useStores()
    const isNoteSelected = rootStore.pianoRollStore.selection.noteIds.length > 0

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

    return (
      <Menu
        keepMounted
        open={isOpen}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={{ top: position.y, left: position.x }}
        disableAutoFocusItem={true}
        transitionDuration={50}
      >
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
          <HotKey>Ctrl+P</HotKey>
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
      </Menu>
    )
  })
