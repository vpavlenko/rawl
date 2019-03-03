import React, { StatelessComponent, ReactNode, CSSProperties } from "react"
import sizeMe from "react-sizeme"
import Icon from "components/Icon"
import { ScrollBar, BAR_WIDTH } from "./ScrollBar"
import { ISize } from "common/geometry"

import "./ScaleScrollBar.css"
import { Omit } from "recompose"

interface ScaleButtonProps {
  style?: CSSProperties
  children?: ReactNode
  onClick?: (e: any) => void
}

const ScaleButton: StatelessComponent<ScaleButtonProps> = ({
  style,
  children,
  onClick
}) => {
  return (
    <div className="ScaleButton" style={style} onClick={onClick}>
      {children}
    </div>
  )
}

interface HorizontalScaleScrollBar_Props {
  size: ISize
  onClickScaleDown?: (e: any) => void
  onClickScaleReset?: (e: any) => void
  onClickScaleUp?: (e: any) => void
}

const HorizontalScaleScrollBar_: StatelessComponent<
  HorizontalScaleScrollBar_Props
> = props => {
  const buttonSize = BAR_WIDTH
  const barLength = props.size.width - buttonSize * 3
  const buttonStyle = {
    width: buttonSize,
    height: buttonSize
  }
  return (
    <ScrollBar
      isVertical={false}
      {...props}
      barLength={barLength}
      style={{
        width: "100%",
        height: BAR_WIDTH,
        position: "absolute",
        bottom: 0,
        left: 0
      }}
    >
      <ScaleButton style={buttonStyle} onClick={props.onClickScaleDown}>
        <Icon>minus</Icon>
      </ScaleButton>
      <ScaleButton style={buttonStyle} onClick={props.onClickScaleReset}>
        <Icon>circle</Icon>
      </ScaleButton>
      <ScaleButton style={buttonStyle} onClick={props.onClickScaleUp}>
        <Icon>plus</Icon>
      </ScaleButton>
    </ScrollBar>
  )
}

export type HorizontalScaleScrollBarProps = Omit<
  HorizontalScaleScrollBar_Props,
  "size"
>

export const HorizontalScaleScrollBar = sizeMe()(HorizontalScaleScrollBar_)
