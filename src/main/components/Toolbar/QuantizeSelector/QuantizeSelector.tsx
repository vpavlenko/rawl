import styled from "@emotion/styled"
import { FiberManualRecord, MusicNote } from "@mui/icons-material"
import { Tooltip } from "@mui/material"
import React from "react"
import { localized } from "../../../../common/localize/localizedString"
import {
  ToolbarButtonGroup,
  ToolbarButtonGroupItem,
} from "../ToolbarButtonGroup"
import { QuantizePopup } from "./QuantizePopup"

const Container = styled(ToolbarButtonGroup)`
  margin-right: 1em;
  align-items: stretch;
`

const Switch = styled(ToolbarButtonGroupItem)`
  padding: 0.4rem;
`

const DotLabel = styled(FiberManualRecord)`
  top: -0.2rem;
  left: 0.1rem;
  position: relative;
  width: 0.6rem;
  font-size: 1.1rem;
`

const TripletLabel = styled.span`
  opacity: 0.6;
  font-size: 70%;
  padding: 0 0.24em;
`

const Content = styled(ToolbarButtonGroupItem)`
  padding: 0;
`

const Value = styled.div`
  min-width: 3em;
  pointer-events: none;
  font-size: 0.9rem;
`

const Note = styled(MusicNote)`
  font-size: 1.1rem;
`

function calcQuantize(num: number, dot: boolean, triplet: boolean): number {
  let val = num
  if (dot) {
    val /= 1.5
  }
  if (triplet) {
    val *= 1.5
  }
  return val
}

export interface QuantizeSelectorProps {
  value: number
  enabled: boolean
  onSelect: (value: number) => void
  onClickSwitch: () => void
}

function QuantizeSelector({
  value,
  enabled,
  onSelect,
  onClickSwitch,
}: QuantizeSelectorProps) {
  // 整数ではなく 1.5 をかけると整数になるとき付点
  // When it is not integer and multiply 1.5 becomes integer, it becomes a dotted note

  const dot = value % 1 !== 0 && (value * 1.5) % 1 === 0

  // 1.5 で割ると整数になるとき3連符
  // When divided by 1.5, when it becomes an it becomes a triplet (here triplet is a musical term)
  const triplet = (value / 1.5) % 1 === 0

  // 逆算するために triplet と dot を逆にする
  // Reverse TRIPLET and DOT to reverse
  const denominator = calcQuantize(value, triplet, dot)

  const list = [1, 2, 4, 8, 16, 32, 64, 128]

  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)

  return (
    <Container>
      <Switch selected={enabled} onClick={onClickSwitch}>
        <Tooltip title={localized("snap-to-grid", "Snap to Grid")}>
          <Note />
        </Tooltip>
      </Switch>
      <Content
        onClick={(e) => {
          setAnchorEl(e.currentTarget)
        }}
        onWheel={(e) => {
          const currentIndex = list.indexOf(denominator)
          const delta = e.deltaY < 0 ? 1 : -1
          const index = Math.min(
            list.length - 1,
            Math.max(0, currentIndex + delta)
          )
          onSelect(calcQuantize(list[index], dot, triplet))
        }}
      >
        <Value>
          <span className="denominator">{denominator}</span>
          {triplet && <TripletLabel>3</TripletLabel>}
          {dot && <DotLabel />}
        </Value>
      </Content>
      <QuantizePopup
        anchorEl={anchorEl}
        isOpen={anchorEl !== null}
        onClose={() => setAnchorEl(null)}
        value={denominator}
        values={list}
        dotted={dot}
        triplet={triplet}
        onChangeValue={(d) => onSelect(calcQuantize(d, dot, triplet))}
        onChangeDotted={(d) => onSelect(calcQuantize(denominator, d, false))}
        onChangeTriplet={(t) => onSelect(calcQuantize(denominator, false, t))}
      />
    </Container>
  )
}

export default React.memo(QuantizeSelector)
