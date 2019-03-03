import React, { StatelessComponent } from "react"
import { pure } from "recompose"
import Icon from "components/Icon"
import "./Select.css"

export interface SelectProps<ValueType> {
  onChange: (e: any) => void
  value: ValueType
  options: ValueType[]
}

const Select: StatelessComponent<SelectProps<any>> = ({
  onChange,
  value,
  options
}) => {
  function handleChange(e) {
    e.target.blur()
    onChange(e)
  }

  function handleWheel(e) {
    const index = e.target.selectedIndex
    const size = e.target.options.length
    const movement = e.deltaY > 0 ? 1 : -1
    const nextIndex = Math.max(0, Math.min(size - 1, index + movement))
    e.target.value = e.target.options[nextIndex].value
    onChange(e)
  }

  return (
    <div className="select-container">
      <Icon className="arrow-down">menu-down</Icon>
      <select value={value} onChange={handleChange} onWheel={handleWheel}>
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default pure(Select)
