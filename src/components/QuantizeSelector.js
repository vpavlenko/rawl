import React from "react"
import Icon from "components/Icon"

import "./QuantizeSelector.css"

function calcQuantize(num, dot, triplet) {
  let val = num
  if (dot) {
    val /= 1.5
  }
  if (triplet) {
    val *= 1.5
  }
  return val
}

function DotButton({ selected, onClick }) {
  return <div className={`dot button ${selected ? "selected" : ""}`} onClick={onClick}>
    <Icon>{selected ? "checkbox-blank-circle" : "checkbox-blank-circle-outline"}</Icon>
  </div>
}

function TripletButton({ selected, onClick }) {
  return <div className={`triplet button ${selected ? "selected" : ""}`} onClick={onClick}>3</div>
}

export default function QuantizeSelector({ value, onSelect }) {
  // 整数ではなく 1.5 をかけると整数になるとき付点
  const dot = (value % 1 !== 0) && ((value * 1.5) % 1 === 0)

  // 1.5 で割ると整数になるとき3連符
  const triplet = (value / 1.5) % 1 === 0

  // 逆算するために triplet と dot を逆にする
  const denominator = calcQuantize(value, triplet, dot)

  const list = [1, 2, 4, 8, 16, 32]

  return <div className="QuantizeSelector" onWheel={e => {
    const currentIndex = list.indexOf(denominator)
    const delta = e.deltaY < 0 ? 1 : -1
    const index = Math.min(list.length - 1, Math.max(0, currentIndex + delta))
    onSelect(calcQuantize(list[index], dot, triplet))
  }}>
    <label className="label">
      <Icon>music-note</Icon>
    </label>
    <select
      className="denominator-select"
      value={denominator}
      onChange={e => onSelect(calcQuantize(parseInt(e.target.value, 10), dot, triplet))}>
      {list.map(num =>
        <option key={num} value={num}>{num}</option>
      )}
    </select>
    <div className="updown-mark">
      <Icon>chevron-down</Icon>
    </div>
    <div className="options">
      <DotButton selected={dot} onClick={() => onSelect(calcQuantize(denominator, !dot, false))} />
      <TripletButton selected={triplet} onClick={() => onSelect(calcQuantize(denominator, false, !triplet))} />
    </div>
  </div>
}
