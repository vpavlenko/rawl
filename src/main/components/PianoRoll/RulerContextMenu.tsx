import { maxBy } from "lodash"
import React, { FC, useCallback } from "react"
import { localized } from "../../../common/localize/localizedString"
import { timeSignatureMidiEvent } from "../../../common/midi/MidiEvent"
import { useStores } from "../../hooks/useStores"
import { RulerStore } from "../../stores/RulerStore"
import {
  ContextMenu,
  ContextMenuItem as Item,
  ContextMenuProps,
} from "../ContextMenu/ContextMenu"

export interface RulerContextMenuProps extends ContextMenuProps {
  rulerStore: RulerStore
}

export const RulerContextMenu: FC<RulerContextMenuProps> = React.memo(
  ({ rulerStore, ...props }) => {
    const { handleClose } = props
    const rootStore = useStores()
    const isTimeSignatureSelected =
      rulerStore.selectedTimeSignatureEventIds.length > 0

    const onClickAddTimeSignature = useCallback(() => {
      // get the nearest measure start
      const beat = maxBy(
        rulerStore.beats.filter(
          (m) => m.beat === 0 && m.tick <= rootStore.services.player.position
        ),
        (m) => m.tick
      )

      if (beat !== undefined) {
        rootStore.song.conductorTrack?.addEvent({
          ...timeSignatureMidiEvent(0, 4, 4),
          tick: beat.tick,
        })
      }

      handleClose()
    }, [])

    const onClickRemoveTimeSignature = useCallback(() => {
      rootStore.song.conductorTrack?.removeEvents(
        rulerStore.selectedTimeSignatureEventIds
      )
      handleClose()
    }, [])

    return (
      <ContextMenu {...props}>
        <Item onClick={onClickAddTimeSignature}>
          {localized("add-time-signature", "拍子を追加")}
        </Item>
        <Item
          onClick={onClickRemoveTimeSignature}
          disabled={!isTimeSignatureSelected}
        >
          {localized("remove-time-signature", "拍子を削除")}
        </Item>
      </ContextMenu>
    )
  }
)
