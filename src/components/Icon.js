import React from "react"

import "./Icon.css"
import "mdi/css/materialdesignicons.css"

export default function Icon(props) {
  const classes = ["AuiIcon", "mdi", `mdi-${props.children}`]
  const p = {
    ...props,
    children: undefined
  }
  return <span className={classes.join(" ")} {...p} />
}
