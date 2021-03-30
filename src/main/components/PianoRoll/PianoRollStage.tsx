import { useObserver } from "mobx-react-lite"
import React, { FC, useMemo } from "react"
import styled from "styled-components"
import { IPoint } from "../../../common/geometry"
import { createBeatsInRange } from "../../../common/helpers/mapBeats"
import { NoteCoordTransform } from "../../../common/transform"
import { Layout } from "../../Constants"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import { PianoNoteItem } from "../../stores/PianoRollStore"
import PianoLines from "./CanvasPianoLines"
import CanvasPianoRuler from "./CanvasPianoRuler"
import PianoKeys from "./PianoKeys"
import { PianoNotes } from "./PianoNotes"

export interface PianoRollStageProps {
  width: number
  height: number
}

export interface PianoNotesMouseEvent {
  nativeEvent: MouseEvent
  tick: number
  noteNumber: number
  local: IPoint
  transform: NoteCoordTransform
  item: PianoNoteItem | null
}

const Container = styled.div``

const ContentPosition = styled.div`
  position: absolute;
  left: ${Layout.keyWidth}px;
`

const RulerPosition = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  padding-left: ${Layout.keyWidth}px;
  height: ${Layout.rulerHeight}px;
`

const PianoKeyPosition = styled.div`
  position: absolute;
  left: 0;
  top: 0;
`

export const PianoRollStage: FC<PianoRollStageProps> = ({ width, height }) => {
  const rootStore = useStores()
  const { measures, timebase, scrollLeft, scrollTop, transform } = useObserver(
    () => {
      return {
        measures: rootStore.song.measures,
        timebase: rootStore.services.player.timebase,
        scrollLeft: rootStore.pianoRollStore.scrollLeft,
        scrollTop: rootStore.pianoRollStore.scrollTop,
        transform: rootStore.pianoRollStore.transform,
      }
    }
  )
  const theme = useTheme()

  const startTick = scrollLeft / transform.pixelsPerTick

  const mappedBeats = useMemo(
    () =>
      createBeatsInRange(
        measures,
        transform.pixelsPerTick,
        timebase,
        startTick,
        width
      ),
    [measures, transform, timebase, startTick, width]
  )

  return (
    <Container>
      <ContentPosition style={{ top: -scrollTop + Layout.rulerHeight }}>
        <PianoLines
          theme={theme}
          width={width}
          pixelsPerKey={transform.pixelsPerKey}
          numberOfKeys={transform.numberOfKeys}
        />
      </ContentPosition>
      <ContentPosition style={{ top: Layout.rulerHeight }}>
        <PianoNotes width={width} height={height} />
      </ContentPosition>
      <PianoKeyPosition style={{ top: -scrollTop + Layout.rulerHeight }}>
        <PianoKeys
          keyHeight={transform.pixelsPerKey}
          numberOfKeys={transform.numberOfKeys}
        />
      </PianoKeyPosition>
      <RulerPosition
        style={{
          background: theme.backgroundColor,
          borderBottom: `1px solid ${theme.dividerColor}`,
        }}
      >
        <CanvasPianoRuler
          width={width}
          beats={mappedBeats}
          scrollLeft={scrollLeft}
          pixelsPerTick={transform.pixelsPerTick}
        />
      </RulerPosition>
    </Container>
  )
}
