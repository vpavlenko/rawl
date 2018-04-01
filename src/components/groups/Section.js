import React, { Component } from "react"
import Button from "components/inputs/Button.tsx"
import Icon from "components/Icon.tsx"

import "./Section.css"

function SectionContent({
  hidden,
  onClickHeader,
  title,
  children
}) {
  return <section className="Section">
    <Button component="header" onClick={onClickHeader}>
      <p className="title">{title}</p>
      <Icon>{hidden ? "chevron-down" : "chevron-up"}</Icon>
    </Button>
    {!hidden &&
      <div className="content">
        {children}
      </div>
    }
  </section>
}

export default class Section extends Component {
  constructor(props) {
    super(props)

    this.state = {
      hidden: false
    }
  }

  render() {
    const onClickHeader = () => {
      this.setState({ hidden: !this.state.hidden })
    }
    return <SectionContent {...this.props}
      hidden={this.state.hidden}
      onClickHeader={onClickHeader}
    />
  }
}
