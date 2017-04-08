import React, { Component } from "react"
import Config from "../Config"
import SharedService from "../services/SharedService"
import Select from "./atoms/Select"
import Button from "./atoms/Button"
import Icon from "./atoms/Icon"
import { Toolbar, ToolbarItem, ToolbarSeparator } from "./molecules/Toolbar"

import "./MainToolbar.css"

export default class MainToolbar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      tempo: 0
    }
  }

  componentDidMount() {
    const player = SharedService.player
    player.on("change-tempo", tempo => {
      this.setState({tempo: new Number(tempo).toFixed(3)})
    })
    player.on("change-position", tick => {
      this.setState({
        mbtTime: this.props.song.measureList.getMBTString(tick, player.timebase)
      })
    })
  }

  render() {
    const props = this.props
    const { song, tempo } = this.props
    const trackOptions = song ? song.tracks.map((t, i) => { return {
      name: `${i}. ${t.getName() || ""}`,
      value: i
    }}) : []

    const player = SharedService.player
    const mbtTime = song && song.measureList.getMBTString(player.position, player.timebase)
    const quantizeOptions = Config.QuantizeOptions

    return <Toolbar>
      <ToolbarItem className="time-section">
        <p className="tempo">BPM {tempo}</p>
        <p className="time">{mbtTime}</p>
      </ToolbarItem>

      <ToolbarSeparator />

      <ToolbarItem onClick={props.onClickBackward}><Icon>skip-backward</Icon></ToolbarItem>
      <ToolbarItem onClick={props.onClickStop}><Icon>stop</Icon></ToolbarItem>
      <ToolbarItem onClick={props.onClickPlay}><Icon>play</Icon></ToolbarItem>
      <ToolbarItem onClick={props.onClickForward}><Icon>skip-forward</Icon></ToolbarItem>
      <ToolbarItem onClick={props.onClickAutoScroll} selected={props.autoScroll}><Icon>pin</Icon></ToolbarItem>

      <ToolbarSeparator />

      <ToolbarItem onClick={props.onClickPencil} selected={props.mouseMode == 0}><Icon>pencil</Icon></ToolbarItem>
      <ToolbarItem onClick={props.onClickSelection} selected={props.mouseMode == 1}><Icon>select</Icon></ToolbarItem>
      <ToolbarItem><Select onChange={props.onSelectQuantize} options={quantizeOptions} value={props.quantize} /></ToolbarItem>

      <ToolbarSeparator />

      <ToolbarItem onClick={props.onClickScaleUp}><Icon>magnify-plus</Icon></ToolbarItem>
      <ToolbarItem onClick={props.onClickScaleDown}><Icon>magnify-minus</Icon></ToolbarItem>
    </Toolbar>
  }
}
