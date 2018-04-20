import React, { StatelessComponent, ReactNode } from "react"
import Icon from "components/Icon"
import f from "helpers/flatJoin"

import "./NavigationBar.css"

export interface NavigationBarProps {
  title?: string
  children?: ReactNode
  className?: string
  onClickBack?: (e: any) => void
}

const NavigationBar: StatelessComponent<NavigationBarProps> = ({
  title,
  children,
  className,
  onClickBack
}) => {
  return <nav className={f("NavigationBar", className)}>
    <div className="title">
      {onClickBack && <Icon onClick={onClickBack}>chevron-left</Icon>}
      <span>{title}</span>
    </div>
    {children}
  </nav>
}

NavigationBar.defaultProps = {
  title: ""
}

export default NavigationBar
