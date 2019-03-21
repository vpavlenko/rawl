import React, { Component, StatelessComponent, ReactNode } from "react"
import Button from "components/inputs/Button"
import Icon from "components/Icon"

import "./Section.css"
import { Omit } from "recompose"

interface SectionContentProps {
  hidden: boolean
  onClickHeader: (e: any) => void
  title: string
  children?: ReactNode
}

const SectionContent: StatelessComponent<SectionContentProps> = ({
  hidden,
  onClickHeader,
  title,
  children
}) => {
  return (
    <section className="Section">
      <Button component="header" onClick={onClickHeader}>
        <p className="title">{title}</p>
        <Icon>{hidden ? "chevron-down" : "chevron-up"}</Icon>
      </Button>
      {!hidden && <div className="content">{children}</div>}
    </section>
  )
}

export type SectionProps = Omit<SectionContentProps, "onClickHeader" | "hidden">

export interface SectionState {
  hidden: boolean
}

export default class Section extends Component<SectionProps, SectionState> {
  constructor(props: SectionProps) {
    super(props)

    this.state = {
      hidden: false
    }
  }

  render() {
    const onClickHeader = () => {
      this.setState({ hidden: !this.state.hidden })
    }
    return (
      <SectionContent
        {...this.props}
        hidden={this.state.hidden}
        onClickHeader={onClickHeader}
      />
    )
  }
}
