import React from "react"
import _ from "lodash"

export default function Button(props) {
  return <button 
    {..._.omit(props, "selected")}
    className={props.selected && "selected"} 
    onMouseDown={e => e.preventDefault()} />
}
