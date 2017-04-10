import React, { Component } from "react"
import Config from "../Config"
import Select from "./atoms/Select"
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
    const { player } = this.props
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
    const { song, tempo, player } = this.props

    const mbtTime = song && song.measureList.getMBTString(player.position, player.timebase)
    const quantizeOptions = Config.QuantizeOptions

    const onClickPlay = () => {
      player.play()
    }

    const onClickStop = () => {
      if (player.isPlaying) {
        player.stop()
      } else {
        player.stop()
        player.position = 0
      }
    }

    const onClickBackward = () => {
      player.position -= Config.TIME_BASE * 4
    }

    const onClickForward = () => {
      player.position += Config.TIME_BASE * 4
    }

    return <Toolbar>
      <ToolbarItem className="time-section">
        <p className="tempo">BPM {tempo}</p>
        <p className="time">{mbtTime}</p>
      </ToolbarItem>

      <ToolbarSeparator />

      <ToolbarItem onClick={onClickBackward}><Icon>skip-backward</Icon></ToolbarItem>
      <ToolbarItem onClick={onClickStop}><Icon>stop</Icon></ToolbarItem>
      <ToolbarItem onClick={onClickPlay}><Icon>play</Icon></ToolbarItem>
      <ToolbarItem onClick={onClickForward}><Icon>skip-forward</Icon></ToolbarItem>
      <ToolbarItem onClick={props.onClickAutoScroll} selected={props.autoScroll}><Icon>pin</Icon></ToolbarItem>

      <ToolbarSeparator />

      <ToolbarItem onClick={props.onClickPencil} selected={props.mouseMode == 0}><Icon>pencil</Icon></ToolbarItem>
      <ToolbarItem onClick={props.onClickSelection} selected={props.mouseMode == 1}><Icon>select</Icon></ToolbarItem>
      <ToolbarItem touchDisabled={true}>
        <Select
          options={quantizeOptions}
          value={props.quantize}
          onChange={e => props.onSelectQuantize(parseFloat(e.target.value))} />
      </ToolbarItem>

      <ToolbarSeparator />

      <ToolbarItem onClick={props.onClickScaleUp}><Icon>magnify-plus</Icon></ToolbarItem>
      <ToolbarItem onClick={props.onClickScaleDown}><Icon>magnify-minus</Icon></ToolbarItem>
    </Toolbar>
  }
}
