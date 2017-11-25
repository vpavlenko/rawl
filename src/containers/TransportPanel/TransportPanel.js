import React, { Component } from "react"
import { observer, inject } from "mobx-react"

import Icon from "components/Icon"
import { Toolbar, ToolbarItem, ToolbarSeparator } from "components/groups/Toolbar"

import { TIME_BASE } from "Constants"

import "./TransportPanel.css"

function TransportPanel({
  onClickPlay,
  onClickStop,
  onClickBackward,
  onClickForward,
  mbtTime,
  loopEnabled,
  onClickEnableLoop
 }) {
  return <Toolbar className="TransportPanel">
    <ToolbarSeparator />

    <ToolbarItem onClick={onClickBackward}><Icon>skip-backward</Icon></ToolbarItem>
    <ToolbarItem onClick={onClickStop}><Icon>stop</Icon></ToolbarItem>
    <ToolbarItem onClick={onClickPlay}><Icon>play</Icon></ToolbarItem>
    <ToolbarItem onClick={onClickForward}><Icon>skip-forward</Icon></ToolbarItem>
    <ToolbarItem onClick={onClickEnableLoop} selected={loopEnabled}><Icon>loop</Icon></ToolbarItem>

    <ToolbarSeparator />

    <ToolbarItem className="time-section">
      <p className="time">{mbtTime}</p>
    </ToolbarItem>
  </Toolbar>
}

class stateful extends Component {
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
    return <TransportPanel {...this.props} {...this.state} />
  }
}

export default inject(({ rootStore: {
  services: { player },
  song: { measureList },
  playerStore: { loop },
  dispatch
} }) => ({
    player,
    measureList,
    loopEnabled: loop.enabled,
    onClickPlay: () => dispatch("PLAY"),
    onClickStop: () => dispatch("STOP"),
    onClickBackward: () => dispatch("MOVE_PLAYER_POSITION", { tick: -TIME_BASE * 4 }),
    onClickForward: () => dispatch("MOVE_PLAYER_POSITION", { tick: TIME_BASE * 4 }),
    onClickEnableLoop: () => dispatch("TOGGLE_ENABLE_LOOP")
  }))(observer(stateful))