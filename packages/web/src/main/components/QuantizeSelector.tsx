import React from "react"
import Icon from "components/Icon"
import QuantizePopup from "components/QuantizePopup"

import "./QuantizeSelector.css"
import { compose, withState, withHandlers, Omit } from "recompose"

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

interface DotButtonProps {
  selected: boolean
  onClick: () => void
}

function DotButton({ selected, onClick }: DotButtonProps) {
  return (
    <div
      className={`dot button ${selected ? "selected" : ""}`}
      onClick={onClick}
    >
      <Icon>
        {selected ? "checkbox-blank-circle" : "checkbox-blank-circle-outline"}
      </Icon>
    </div>
  )
}

interface TripletButtonProps {
  selected: boolean
  onClick: () => void
}

function TripletButton({ selected, onClick }: TripletButtonProps) {
  return (
    <div
      className={`triplet button ${selected ? "selected" : ""}`}
      onClick={onClick}
    >
      3
    </div>
  )
}

export interface QuantizeSelectorProps {
  value: number
  onSelect: (value: number) => void
  popupHidden: boolean
  togglePopup: () => void
}

function QuantizeSelector({
  value,
  onSelect,
  popupHidden,
  togglePopup
}: QuantizeSelectorProps) {
  // 整数ではなく 1.5 をかけると整数になるとき付点
  const dot = value % 1 !== 0 && (value * 1.5) % 1 === 0

  // 1.5 で割ると整数になるとき3連符
  const triplet = (value / 1.5) % 1 === 0

  // 逆算するために triplet と dot を逆にする
  const denominator = calcQuantize(value, triplet, dot)

  const list = [1, 2, 4, 8, 16, 32, 64, 128]

  return (
    <div
      className="QuantizeSelector"
      onWheel={e => {
        const currentIndex = list.indexOf(denominator)
        const delta = e.deltaY < 0 ? 1 : -1
        const index = Math.min(
          list.length - 1,
          Math.max(0, currentIndex + delta)
        )
        onSelect(calcQuantize(list[index], dot, triplet))
      }}
    >
      <div className="content" onClick={togglePopup}>
        <Icon className="label">music-note</Icon>
        <div className="value">
          <span className="denominator">{denominator}</span>
          {triplet && <span className="triplet-label">3</span>}
          {dot && <Icon className="dot-label">circle</Icon>}
        </div>
      </div>
      <QuantizePopup
        hidden={popupHidden}
        value={denominator}
        values={list}
        dotted={dot}
        triplet={triplet}
        onChangeValue={d => onSelect(calcQuantize(d, dot, triplet))}
        onChangeDotted={d => onSelect(calcQuantize(denominator, d, false))}
        onChangeTriplet={t => onSelect(calcQuantize(denominator, false, t))}
      />
    </div>
  )
}

export default compose<
  QuantizeSelectorProps,
  Omit<QuantizeSelectorProps, "togglePopup" | "popupHidden">
>(
  withState("popupHidden", "updatePopupHidden", true),
  withHandlers({
    togglePopup: ({ updatePopupHidden }) => () =>
      updatePopupHidden((v: boolean) => !v)
  })
)(QuantizeSelector)
