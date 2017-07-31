import React, { Component } from "react"
import Config from "../Config"
import Select from "./atoms/Select"
import Icon from "./atoms/Icon"
import { Toolbar, ToolbarItem, ToolbarSeparator } from "./molecules/Toolbar"

import "./MainToolbar.css"

const quantizeOptions = Config.QuantizeOptions

function Content({
  onClickPlay,
  onClickStop,
  onClickBackward,
  onClickForward,
  autoScroll,
  onClickAutoScroll,
  mouseMode,
  onClickPencil,
  onClickSelection,
  quantize,
  onSelectQuantize,
  onClickScaleUp,
  onClickScaleDown,
  mbtTime }) {

  return <Toolbar>
    <ToolbarItem className="time-section">
      <p className="time">{mbtTime}</p>
    </ToolbarItem>

    <ToolbarSeparator />

    <ToolbarItem onClick={onClickBackward}><Icon>skip-backward</Icon></ToolbarItem>
    <ToolbarItem onClick={onClickStop}><Icon>stop</Icon></ToolbarItem>
    <ToolbarItem onClick={onClickPlay}><Icon>play</Icon></ToolbarItem>
    <ToolbarItem onClick={onClickForward}><Icon>skip-forward</Icon></ToolbarItem>
    <ToolbarItem onClick={onClickAutoScroll} selected={autoScroll}><Icon>pin</Icon></ToolbarItem>

    <ToolbarSeparator />

    <ToolbarItem onClick={onClickPencil} selected={mouseMode === 0}><Icon>pencil</Icon></ToolbarItem>
    <ToolbarItem onClick={onClickSelection} selected={mouseMode === 1}><Icon>select</Icon></ToolbarItem>
    <ToolbarItem touchDisabled={true}>
      <Select
        options={quantizeOptions}
        value={quantize}
        onChange={e => onSelectQuantize({ ...e, denominator: parseFloat(e.target.value) })} />
    </ToolbarItem>

    <ToolbarSeparator />

    <ToolbarItem onClick={onClickScaleUp}><Icon>magnify-plus</Icon></ToolbarItem>
    <ToolbarItem onClick={onClickScaleDown}><Icon>magnify-minus</Icon></ToolbarItem>
  </Toolbar>
}

export default class MainToolbar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      mbtTime: ""
    }
  }

  componentDidMount() {
    this.props.player.on("change-position", this.onTick)
  }

  componentWillUnmount() {
    this.props.player.on("change-position", this.onTick)
  }

  onTick = tick => {
    this.setState({
      mbtTime: this.props.measureList.getMBTString(tick, this.props.player.timebase)
    })
  }

  render() {
    return <Content {...this.props} {...this.state} />
  }
}
