import React, { FC, useCallback, useState } from "react"
import { localized } from "../../../common/localize/localizedString"
import { addTimeSignature, setLoopBegin, setLoopEnd } from "../../actions"
import { useStores } from "../../hooks/useStores"
import { RulerStore } from "../../stores/RulerStore"
import {
  ContextMenu,
  ContextMenuItem as Item,
  ContextMenuProps,
} from "../ContextMenu/ContextMenu"
import { TimeSignatureDialog } from "./TimeSignatureDialog"

export interface RulerContextMenuProps extends ContextMenuProps {
  rulerStore: RulerStore
  tick: number
}

export const RulerContextMenu: FC<RulerContextMenuProps> = React.memo(
  ({ rulerStore, tick, ...props }) => {
    const { handleClose } = props
    const rootStore = useStores()
    const [isOpenTimeSignatureDialog, setOpenTimeSignatureDialog] =
      useState(false)

    const isTimeSignatureSelected =
      rulerStore.selectedTimeSignatureEventIds.length > 0

    const onClickAddTimeSignature = useCallback(() => {
      setOpenTimeSignatureDialog(true)
      handleClose()
    }, [])

    const onClickRemoveTimeSignature = useCallback(() => {
      rootStore.song.conductorTrack?.removeEvents(
        rulerStore.selectedTimeSignatureEventIds
      )
      handleClose()
    }, [])

    const onClickSetLoopStart = useCallback(() => {
      setLoopBegin(rootStore)(tick)
      handleClose()
    }, [tick])

    const onClickSetLoopEnd = useCallback(() => {
      setLoopEnd(rootStore)(tick)
      handleClose()
    }, [tick])

    const closeOpenTimeSignatureDialog = useCallback(() => {
      setOpenTimeSignatureDialog(false)
    }, [])

    return (
      <>
        <ContextMenu {...props}>
          <Item onClick={onClickSetLoopStart}>
            {localized("set-loop-start", "Set Loop Start")}
          </Item>
          <Item onClick={onClickSetLoopEnd}>
            {localized("set-loop-end", "Set Loop End")}
          </Item>
          <Item onClick={onClickAddTimeSignature}>
            {localized("add-time-signature", "Add Time Signature")}
          </Item>
          <Item
            onClick={onClickRemoveTimeSignature}
            disabled={!isTimeSignatureSelected}
          >
            {localized("remove-time-signature", "Remove Time Signature")}
          </Item>
        </ContextMenu>
        <TimeSignatureDialog
          open={isOpenTimeSignatureDialog}
          onClose={closeOpenTimeSignatureDialog}
          onClickOK={({ numerator, denominator }) => {
            addTimeSignature(rootStore)(
              rootStore.services.player.position,
              numerator,
              denominator
            )
          }}
        />
      </>
    )
  }
)
