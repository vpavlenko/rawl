import React from "react"

export default function Select(props) {
  return <div className="select-container">
    <select onChange={props.onChange} value={props.value}>
      {props.options.map(o => <option key={o.value} value={o.value}>{o.name}</option>)}
    </select>
  </div>
}
