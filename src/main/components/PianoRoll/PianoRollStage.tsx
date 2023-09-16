import styled from "@emotion/styled"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { Layout } from "../../Constants"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import CanvasPianoRuler from "./CanvasPianoRuler"
import PianoKeys from "./PianoKeys"
import { PianoRollCanvas } from "./PianoRollCanvas/PianoRollCanvas"

export interface PianoRollStageProps {
  width: number
  height: number
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
    const { scrollTop, transform } = pianoRollStore

    const theme = useTheme()

    return (
      <Container>
        <ContentPosition style={{ top: Layout.rulerHeight }}>
          <PianoRollCanvas width={width} height={height - Layout.rulerHeight} />
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
          <CanvasPianoRuler rulerStore={pianoRollStore.rulerStore} />
        </RulerPosition>
      </Container>
    )
  },
)
