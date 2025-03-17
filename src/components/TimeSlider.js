import autoBindReact from "auto-bind/react";
import React from "react";
import styled from "styled-components";
import Slider from "./Slider";

const TimeSliderContainer = styled.div`
  flex-grow: 1;
  margin-left: var(--charW2);
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  width: 95%;
`;

const TimeLabel = styled.div`
  margin-right: 15px;
`;

const DurationLabel = styled.div`
  margin-left: 20px;
`;

//  46 ms = 2048/44100 sec or 21.7 fps
// 400 ms = 2.5 fps
const UPDATE_INTERVAL_MS = 100;
const pad = (n) => (n < 10 ? "0" + n : n);

export default class TimeSlider extends React.Component {
  constructor(props) {
    super(props);
    autoBindReact(this);

    this.state = {
      draggedSongPositionMs: -1,
      currentSongPositionMs: 0,
    };
    this.timer = null;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.paused === true && this.props.paused === false) {
      this.timer = setInterval(() => {
        const { getCurrentPositionMs, currentSongDurationMs } = this.props;
        this.setState({
          currentSongPositionMs: Math.min(
            getCurrentPositionMs(),
            currentSongDurationMs,
          ),
        });
      }, UPDATE_INTERVAL_MS);
    } else if (prevProps.paused === false && this.props.paused === true) {
      clearInterval(this.timer);
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  getSongPos() {
    return this.state.currentSongPositionMs / this.props.currentSongDurationMs;
  }

  getTimeLabel() {
    const val =
      this.state.draggedSongPositionMs >= 0
        ? this.state.draggedSongPositionMs
        : this.state.currentSongPositionMs;
    return this.getTime(val);
  }

  getTime(ms) {
    const sign = ms < 0 ? "-" : "";
    ms = Math.abs(ms);
    const min = Math.floor(ms / 60000);
    const sec = (Math.floor((ms % 60000) / 100) / 10).toFixed(0);
    return `${sign}${min}:${pad(sec)}`;
  }

  handlePositionDrag(event) {
    const pos = event.target ? event.target.value : event;
    // Update current time position label
    this.setState({
      draggedSongPositionMs: pos * this.props.currentSongDurationMs,
    });
  }

  handlePositionDrop(event) {
    this.setState({
      draggedSongPositionMs: -1,
      currentSongPositionMs: this.state.draggedSongPositionMs,
    });
    this.props.onChange(event);
  }

  render() {
    return (
      <TimeSliderContainer>
        <TimeLabel>{this.getTimeLabel()}</TimeLabel>
        <Slider
          pos={this.getSongPos()}
          onDrag={this.handlePositionDrag}
          onChange={this.handlePositionDrop}
        />
        <DurationLabel id="duration-label">
          {this.getTime(this.props.currentSongDurationMs)}
        </DurationLabel>
      </TimeSliderContainer>
    );
  }
}
