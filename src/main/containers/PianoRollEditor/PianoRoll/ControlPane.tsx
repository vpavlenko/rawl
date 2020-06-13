import React, { SFC, useCallback } from "react"
import { withSize } from "react-sizeme"
import { useObserver } from "mobx-react"
import ControlPane, { ControlMode } from "main/components/PianoRoll/ControlPane"
import { useStores } from "main/hooks/useStores"
import { useTheme } from "main/hooks/useTheme"
import { NoteCoordTransform } from "common/transform"
import { changeNotesVelocity, createControlEvent } from "main/actions"
import { createBeatsInRange } from "common/helpers/mapBeats"
import { ISize } from "common/geometry"
import { toJS } from "mobx"

const ControlPaneWrapper_: SFC<{ size: ISize }> = ({ size }) => {
  const { rootStore } = useStores()
  const {
    events,
    measures,
    timebase,
    scaleX,
    scrollLeft,
    controlMode,
  } = useObserver(() => ({
    events: toJS(rootStore.song.selectedTrack?.events ?? []),
    measures: rootStore.song.measures,
    timebase: rootStore.services.player.timebase,
    scaleX: rootStore.pianoRollStore.scaleX,
    scrollLeft: rootStore.pianoRollStore.scrollLeft,
    controlMode: rootStore.pianoRollStore.controlMode,
  }))

  const theme = useTheme()
  const transform = new NoteCoordTransform(0.1 * scaleX, theme.keyHeight, 127)
  const startTick = scrollLeft / transform.pixelsPerTick

  const mappedBeats = createBeatsInRange(
    measures,
    transform.pixelsPerTick,
    timebase,
    startTick,
    size.width
  )

  const onSelectTab = useCallback(
    (m: ControlMode) => (rootStore.pianoRollStore.controlMode = m),
    []
  )
  const changeVelocity = useCallback(changeNotesVelocity(rootStore), [])
  const onCreateControlEvent = useCallback(createControlEvent(rootStore), [])

  return (
    <ControlPane
      size={size}
      transform={transform}
      events={events}
      scrollLeft={scrollLeft}
      mode={controlMode}
      theme={theme}
      onSelectTab={onSelectTab}
      changeVelocity={changeVelocity}
      createControlEvent={onCreateControlEvent}
      paddingBottom={0}
      beats={mappedBeats}
    />
  )
}

export const ControlPaneWrapper = withSize({ monitorHeight: true })(
  ControlPaneWrapper_
)
