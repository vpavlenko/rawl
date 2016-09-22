import React, { Component } from "react"
import Config from "../config"
import SharedService from "../shared-service"
import Select from "./select"
import Button from "./button"

function ToolbarContent(props) {
  return <div className="toolbar">
    <div className="container">
      <div className="file-section section">
        <label className="file"><span className="icon">&#xe63a;</span><input type="file" accept=".mid,.midi" onChange={props.onChangeFile}></input></label>
        <Button onClick={props.onClickSave}><span className="icon">&#xe63c;</span></Button>
      </div>

      <div className="song-section section">
        <p className="song-name">{props.songName}</p>
        <p className="tempo">BPM {props.tempo}</p>
      </div>

      <div className="transport-section section">
        <p className="time">{props.mbtTime}</p>
        <Button onClick={props.onClickBackward}><span className="icon">&#xe606;</span></Button>
        <Button onClick={props.onClickStop}><span className="icon">&#xe615;</span></Button>
        <Button onClick={props.onClickPlay}><span className="icon">&#xe616;</span></Button>
        <Button onClick={props.onClickForward}><span className="icon">&#xe607;</span></Button>
        <Button onClick={props.onClickAutoScroll} selected={props.autoScroll}>Auto Scroll</Button>
      </div>

      <div className="tool-section section">
        <Button onClick={props.onClickPencil} selected={props.mouseMode == 0}>✎</Button>
        <Button onClick={props.onClickSelection} selected={props.mouseMode == 1}>□</Button>
        <Select onChange={props.onSelectQuantize} options={props.quantizeOptions} value={props.quantize} />
      </div>

      <Button onClick={props.onClickScaleUp}><img src="images/iconmonstr-magnifier-7-16.png" /></Button>
      <Button onClick={props.onClickScaleDown}><img src="images/iconmonstr-magnifier-8-16.png" /></Button>

      <Button onClick={props.onClickShowLeftPane} selected={props.showLeftPane}>←</Button>
      <Button onClick={props.onClickShowRightPane} selected={props.showRightPane}>→</Button>
    </div>
  </div>
}

export default class Toolbar extends Component {
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
        mbtTime: this.props.song.getMeasureList().getMBTString(tick, player.timebase)
      })
    })
  }

  render() {
    const song = this.props.song
    const trackOptions = song ? song.getTracks().map((t, i) => { return {
      name: `${i}. ${t.getName() || ""}`,
      value: i
    }}) : []

    const player = SharedService.player
    const mbtTime = song && song.getMeasureList().getMBTString(player.position, player.timebase)

    return <ToolbarContent
      {...this.props}
      trackOptions={trackOptions}
      quantizeOptions={Config.QuantizeOptions}
      songName={song && song.name}
      mbtTime={mbtTime} />
  }
}
