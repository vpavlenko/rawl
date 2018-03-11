import React from "react"
import sizeMe from "react-sizeme"
import Icon from "components/Icon.tsx"
import { ScrollBar, BAR_WIDTH } from "./ScrollBar"

import "./ScaleScrollBar.css"

function ScaleButton({ style, children, onClick }) {
  return <div className="ScaleButton" style={style} onClick={onClick}>
    {children}
  </div>
}

function HorizontalScaleScrollBar_(props) {
  const buttonSize = BAR_WIDTH
  const barLength = props.size.width - buttonSize * 3
  const buttonStyle = {
    width: buttonSize,
    height: buttonSize
  }
  return <ScrollBar isVertial={false} {...props} barLength={barLength} style={{
    width: "100%",
    height: BAR_WIDTH,
    position: "absolute",
    bottom: 0,
    left: 0
  }}>
    <ScaleButton style={buttonStyle} onClick={props.onClickScaleDown}><Icon>minus</Icon></ScaleButton>
    <ScaleButton style={buttonStyle} onClick={props.onClickScaleReset}><Icon>circle</Icon></ScaleButton>
    <ScaleButton style={buttonStyle} onClick={props.onClickScaleUp}><Icon>plus</Icon></ScaleButton>
  </ScrollBar>
}

export const HorizontalScaleScrollBar = sizeMe()(HorizontalScaleScrollBar_)
