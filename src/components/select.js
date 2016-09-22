import React from "react"

export default function Select(props) {
  function handleChange(e) {
    e.target.blur()
    props.onChange(e.target.value)
  }
  
  function handleWheel(e) {
    const index = e.target.selectedIndex
    const size = e.target.options.length
    const movement = e.deltaY > 0 ? 1 : -1
    const nextIndex = Math.max(0, Math.min(size - 1, index + movement))
    props.onChange(e.target.options[nextIndex].value)
  }

  return <div className="select-container">
    <select value={props.value} onChange={handleChange} onWheel={handleWheel}>
      {props.options.map(o => 
        <option key={o.value} value={o.value}>
          {o.name}
        </option>
      )}
    </select>
  </div>
}
