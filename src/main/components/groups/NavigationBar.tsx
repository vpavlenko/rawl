import React, { FC, ReactNode } from "react"
import f from "helpers/flatJoin"

import "./NavigationBar.css"
import { ChevronLeft } from "@material-ui/icons"

export interface NavigationBarProps {
  title?: string
  className?: string
  onClickBack?: () => void
}

const NavigationBar: FC<NavigationBarProps> = ({
  title,
  children,
  className,
  onClickBack,
}) => {
  return (
    <nav className={f("NavigationBar", className)}>
      <div className="title">
        {onClickBack && <ChevronLeft onClick={onClickBack} />}
        <span>{title}</span>
      </div>
      {children}
    </nav>
  )
}

NavigationBar.defaultProps = {
  title: "",
}

export default NavigationBar
