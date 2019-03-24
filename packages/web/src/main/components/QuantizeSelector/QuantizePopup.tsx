import React, { SFC } from "react"
import Icon from "components/outputs/Icon"

import "./QuantizePopup.css"

interface NumberPickerProps {
  value: number
  prevValue: () => number
  nextValue: () => number
  className: string
  onChange: (v: number) => void
}

const NumberPicker: SFC<NumberPickerProps> = ({
  value,
  prevValue,
  nextValue,
  className,
  onChange
}) => {
  function handleWheel(e: React.WheelEvent) {
    e.preventDefault()
    onChange(e.deltaY < 0 ? prevValue() : nextValue())
  }

  return (
    <div className={`NumberPicker ${className}`}>
      <div className="button-up" onClick={() => onChange(nextValue())}>
        <Icon>chevron-up</Icon>
      </div>
      <div className="value" onWheel={handleWheel}>
        {value}
      </div>
      <div className="button-down" onClick={() => onChange(prevValue())}>
        <Icon>chevron-down</Icon>
      </div>
    </div>
  )
}

export interface QuantizePopupProps {
  value: number
  values: number[]
  triplet: boolean
  dotted: boolean
  left?: number
  top?: number
  hidden: boolean
  onChangeValue: (value: number) => void
  onChangeTriplet: (value: boolean) => void
  onChangeDotted: (value: boolean) => void
}

export default function QuantizePopup({
  value = 8,
  values,
  triplet,
  dotted,
  left,
  top,
  hidden,
  onChangeValue,
  onChangeTriplet,
  onChangeDotted
}: QuantizePopupProps) {
  const prevValue = () => {
    const index = Math.max(values.indexOf(value) - 1, 0)
    return values[index]
  }
  const nextValue = () => {
    const index = Math.min(values.indexOf(value) + 1, values.length - 1)
    return values[index]
  }
  return (
    <div
      className="QuantizePopup"
      style={{ left, top, visibility: hidden ? "hidden" : "visible" }}
    >
      <div className="content">
        <NumberPicker
          className="left"
          value={value}
          prevValue={prevValue}
          nextValue={nextValue}
          onChange={onChangeValue}
        />
        <div className="right">
          <div className="field">
            <input
              type="checkbox"
              onChange={e => onChangeTriplet(e.target.checked)}
              checked={triplet}
            />
            <label>Triplet</label>
          </div>
          <div className="field">
            <input
              type="checkbox"
              onChange={e => onChangeDotted(e.target.checked)}
              checked={dotted}
            />
            <label>Dotted</label>
          </div>
        </div>
      </div>
    </div>
  )
}
