import React, { Component } from "react"
import { observer, inject } from "mobx-react"

import Icon from "./Icon"
import { Toolbar, ToolbarItem, ToolbarSeparator } from "./groups/Toolbar"
import QuantizeSelector from "./QuantizeSelector"
import { TIME_BASE } from "../Constants"

import "./MainToolbar.css"

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

    <ToolbarSeparator />

    <QuantizeSelector
      value={quantize}
      onSelect={value => onSelectQuantize({ denominator: value })}
    />

    <ToolbarSeparator />

    <ToolbarItem onClick={onClickScaleUp}><Icon>magnify-plus</Icon></ToolbarItem>
    <ToolbarItem onClick={onClickScaleDown}><Icon>magnify-minus</Icon></ToolbarItem>
  </Toolbar>
}

class MainToolbar extends Component {
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

export default inject(({ rootStore: {
  services: { player, quantizer },
  song: { measureList },
  pianoRollStore,
  dispatch
} }) => ({
    player,
    measureList,
    quantize: pianoRollStore.quantize === 0 ? quantizer.denominator : pianoRollStore.quantize,
    mouseMode: pianoRollStore.mouseMode,
    autoScroll: pianoRollStore.autoScroll,
    onClickPlay: () => dispatch("PLAY"),
    onClickStop: () => dispatch("STOP"),
    onClickBackward: () => dispatch("MOVE_PLAYER_POSITION", { tick: -TIME_BASE * 4 }),
    onClickForward: () => dispatch("MOVE_PLAYER_POSITION", { tick: TIME_BASE * 4 }),
    onClickPencil: () => pianoRollStore.mouseMode = 0,
    onClickSelection: () => pianoRollStore.mouseMode = 1,
    onClickScaleUp: () => pianoRollStore.scaleX = pianoRollStore.scaleX + 0.1,
    onClickScaleDown: () => pianoRollStore.scaleX = Math.max(0.05, pianoRollStore.scaleX - 0.1),
    onClickAutoScroll: () => pianoRollStore.autoScroll = !pianoRollStore.autoScroll,
    onSelectQuantize: e => {
      dispatch("SET_QUANTIZE_DENOMINATOR", { denominator: e.denominator })
      pianoRollStore.quantize = e.denominator
    }
  }))(observer(MainToolbar))