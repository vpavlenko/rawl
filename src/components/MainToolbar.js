import React, { Component } from "react"
import Config from "../Config"
import SharedService from "../services/SharedService"
import Select from "./atoms/Select"
import Button from "./atoms/Button"
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
      <ToolbarItem className="time-section section">
        <p className="tempo">BPM {tempo}</p>
        <p className="time">{mbtTime}</p>
      </ToolbarItem>

      <ToolbarSeparator />

      <ToolbarItem onClick={props.onClickBackward}><span className="icon">&#xe606;</span></ToolbarItem>
      <ToolbarItem onClick={props.onClickStop}><span className="icon">&#xe615;</span></ToolbarItem>
      <ToolbarItem onClick={props.onClickPlay}><span className="icon">&#xe616;</span></ToolbarItem>
      <ToolbarItem onClick={props.onClickForward}><span className="icon">&#xe607;</span></ToolbarItem>
      <ToolbarItem onClick={props.onClickAutoScroll} selected={props.autoScroll}>Auto Scroll</ToolbarItem>

      <ToolbarSeparator />

      <ToolbarItem onClick={props.onClickPencil} selected={props.mouseMode == 0}>✎</ToolbarItem>
      <ToolbarItem onClick={props.onClickSelection} selected={props.mouseMode == 1}>□</ToolbarItem>
      <ToolbarItem><Select onChange={props.onSelectQuantize} options={quantizeOptions} value={props.quantize} /></ToolbarItem>

      <ToolbarSeparator />

      <ToolbarItem onClick={props.onClickShowPianoRoll} selected={props.showPianoRoll}>Piano Roll</ToolbarItem>

      <ToolbarItem onClick={props.onClickScaleUp}><img src="images/iconmonstr-magnifier-7-16.png" /></ToolbarItem>
      <ToolbarItem onClick={props.onClickScaleDown}><img src="images/iconmonstr-magnifier-8-16.png" /></ToolbarItem>

      <ToolbarItem onClick={props.onClickShowLeftPane} selected={props.showLeftPane}>←</ToolbarItem>
      <ToolbarItem onClick={props.onClickShowRightPane} selected={props.showRightPane}>→</ToolbarItem>
    </Toolbar>
  }
}
