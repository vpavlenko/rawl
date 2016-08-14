import React, { Component } from "react"
import Config from "../config"
import SharedService from "../shared-service"

function ToolbarContent(props) {
  return <div className="toolbar">
    <div className="container">
      <div className="file-section section">
        <label className="file"><span className="icon">&#xe63a;</span><input type="file" accept=".mid,.midi" onChange={props.onChangeFile}></input></label>
        <button onClick={props.onClickSave}><span className="icon">&#xe63c;</span></button>
      </div>

      <div className="song-section section">
        <p className="song-name">{props.songName}</p>
        <p className="tempo">BPM {props.tempo}</p>
      </div>

      <div className="transport-section section">
        <p className="time">{props.mbtTime}</p>
        <button onClick={props.onClickBackward}><span className="icon">&#xe606;</span></button>
        <button onClick={props.onClickStop}><span className="icon">&#xe615;</span></button>
        <button onClick={props.onClickPlay}><span className="icon">&#xe616;</span></button>
        <button onClick={props.onClickForward}><span className="icon">&#xe607;</span></button>
      </div>

      <div className="tool-section section">
        <button onClick={props.onClickPencil}>✎</button>
        <button onClick={props.onClickSelection}>□</button>
      </div>

      <button onClick={props.onClickScaleUp}><img src="images/iconmonstr-magnifier-7-16.png" /></button>
      <button onClick={props.onClickScaleDown}><img src="images/iconmonstr-magnifier-8-16.png" /></button>
      <button onClick={props.onClickAutoScroll}>Auto Scroll</button>

      <select onChange={props.onSelectTrack}>
        {props.trackOptions.map((o, i) => <option key={i} value={o.value}>{o.name}</option>)}
      </select>
      <select onChange={props.onSelectQuantize}>
        {props.quantizeOptions.map((o, i) => <option key={i} value={o.value}>{o.name}</option>)}
      </select>
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
        mbtTime: this.state.song.getMeasureList().getMBTString(tick, player.TIME_BASE)
      })
    })
  }

  render() {
    const song = this.state.song
    const trackOptions = song ? song.getTracks().map((t, i) => { return {
      name: `${i}. ${t.name || ""}`,
      value: i,
      selected: i == 0
    }}) : []

    const player = SharedService.player
    const mbtTime = song && song.getMeasureList().getMBTString(player.position, player.TIME_BASE)

    return <ToolbarContent
      {...this.props}
      trackOptions={trackOptions}
      quantizeOptions={Config.QuantizeOptions}
      songName={song && song.name}
      mbtTime={mbtTime} />
  }
}
