import React, { useState, SFC } from "react"
import Button from "components/inputs/Button"
import Icon from "components/outputs/Icon"

import "./Section.css"

export interface SectionProps {
  title: string
}

const Section: SFC<SectionProps> = ({ title, children }) => {
  const [hidden, setHidden] = useState(false)

  return (
    <section className="Section">
      <Button component="header" onClick={() => setHidden(!hidden)}>
        <p className="title">{title}</p>
        <Icon>{hidden ? "chevron-down" : "chevron-up"}</Icon>
      </Button>
      {!hidden && <div className="content">{children}</div>}
    </section>
  )
}

export default Section
