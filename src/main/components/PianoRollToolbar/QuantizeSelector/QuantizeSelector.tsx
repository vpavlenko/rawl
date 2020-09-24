import React from "react"
import Icon from "components/outputs/Icon"
import QuantizePopup from "./QuantizePopup"

import "./QuantizeSelector.css"
import { Button } from "@material-ui/core"
import { MusicNote } from "@material-ui/icons"

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
  onSelect: (value: number) => void
}

function QuantizeSelector({ value, onSelect }: QuantizeSelectorProps) {
  // 整数ではなく 1.5 をかけると整数になるとき付点
  const dot = value % 1 !== 0 && (value * 1.5) % 1 === 0

  // 1.5 で割ると整数になるとき3連符
  const triplet = (value / 1.5) % 1 === 0

  // 逆算するために triplet と dot を逆にする
  const denominator = calcQuantize(value, triplet, dot)

  const list = [1, 2, 4, 8, 16, 32, 64, 128]

  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null)

  return (
    <div
      className="QuantizeSelector"
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
      <Button
        size="small"
        className="content"
        onClick={(e) => {
          setAnchorEl(e.currentTarget)
        }}
      >
        <MusicNote />
        <div className="value">
          <span className="denominator">{denominator}</span>
          {triplet && <span className="triplet-label">3</span>}
          {dot && <Icon className="dot-label">circle</Icon>}
        </div>
      </Button>
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
    </div>
  )
}

export default React.memo(QuantizeSelector)
