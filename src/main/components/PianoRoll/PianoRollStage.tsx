import { observer } from "mobx-react-lite"
import { FC } from "react"
import styled from "styled-components"
import { IPoint } from "../../../common/geometry"
import { Layout } from "../../Constants"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import { PianoNoteItem } from "../../stores/PianoRollStore"
import CanvasPianoRuler from "./CanvasPianoRuler"
import PianoKeys from "./PianoKeys"
import { PianoNotes } from "./PianoNotes"

export interface PianoRollStageProps {
  width: number
  height: number
}

export interface PianoNotesMouseEvent {
  nativeEvent: MouseEvent
  local: IPoint
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

export const PianoRollStage: FC<PianoRollStageProps> = observer(
  ({ width, height }) => {
    const { pianoRollStore } = useStores()
    const {
      scrollLeft,
      scrollTop,
      transform,
      mappedBeats,
      timeSignatureEvents: timeSignatures,
    } = pianoRollStore
    const theme = useTheme()

    return (
      <Container>
        <ContentPosition style={{ top: Layout.rulerHeight }}>
          <PianoNotes width={width} height={height - Layout.rulerHeight} />
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
            timeSignatures={timeSignatures}
          />
        </RulerPosition>
      </Container>
    )
  }
)
