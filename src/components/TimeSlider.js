import autoBindReact from "auto-bind/react";
import React from "react";
import styled from "styled-components";
import Slider from "./Slider";
import { EMPTY_TIME_SLIDER_DATA } from "./timeSliderData";

const geometryCache = new WeakMap();
function getGeometry(data, duration) {
  let cached = geometryCache.get(data);
  if (cached?.duration === duration) return cached;
  cached = {
    duration,
    phraseMarks: data.phraseStartTimesMs
      .map((time) => time / duration)
      .filter((pos) => Number.isFinite(pos) && pos >= 0 && pos < 1),
    marks: [...data.sectionStartTimesMs
      .map((time) => time / duration)
      .filter((pos) => Number.isFinite(pos) && pos >= 0 && pos < 1), 1],
    bassBars: data.bassBars.map(({ startMs, endMs, pitchClass }) => ({
      start: Math.max(0, startMs / duration),
      end: Math.min(1, endMs / duration),
      pitchClass,
    })).filter(({ start, end }) => Number.isFinite(start) && Number.isFinite(end) && end > start),
    coloredMarks: data.modulationMarkers.map(({ timeMs, pitchClass }) => ({
      pos: timeMs / duration, pitchClass,
    })).filter(({ pos }) => Number.isFinite(pos) && pos >= 0 && pos <= 1),
  };
  geometryCache.set(data, cached);
  return cached;
}

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
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  text-align: right;
  white-space: nowrap;
`;

const DurationLabel = styled.div`
  margin-left: 20px;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

//  46 ms = 2048/44100 sec or 21.7 fps
// 400 ms = 2.5 fps
const UPDATE_INTERVAL_MS = 100;
const pad = (n) => (n < 10 ? "0" + n : n);

export default class TimeSlider extends React.PureComponent {
  constructor(props) {
    super(props);
    autoBindReact(this);

    this.state = {
      sliderData: props.timeSliderStore?.getSnapshot() ?? EMPTY_TIME_SLIDER_DATA,
      draggedSongPositionMs: -1,
      currentSongPositionMs: 0,
    };
    this.timer = null;
  }

  componentDidMount() {
    this.subscribeToGeometry();
    this.syncPlaybackTimer();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.timeSliderStore !== this.props.timeSliderStore) {
      this.unsubscribeGeometry?.();
      this.subscribeToGeometry();
    }
    if (prevProps.paused !== this.props.paused) {
      this.syncPlaybackTimer();
    }
  }

  subscribeToGeometry() {
    const store = this.props.timeSliderStore;
    const update = () => this.setState({
      sliderData: store?.getSnapshot() ?? EMPTY_TIME_SLIDER_DATA,
    });
    this.unsubscribeGeometry = store?.subscribe(update);
    update();
  }

  syncPlaybackTimer() {
    clearInterval(this.timer);
    this.timer = null;
    this.updateCurrentPosition();
    if (this.props.paused === false) {
      this.timer = setInterval(this.updateCurrentPosition, UPDATE_INTERVAL_MS);
    }
  }

  updateCurrentPosition() {
    const { getCurrentPositionMs, currentSongDurationMs } = this.props;
    this.setState({
      currentSongPositionMs: Math.min(
        getCurrentPositionMs(),
        currentSongDurationMs,
      ),
    });
  }

  componentWillUnmount() {
    this.unsubscribeGeometry?.();
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
    const geometry = getGeometry(this.state.sliderData, this.props.currentSongDurationMs);
    const durationLabel = this.getTime(this.props.currentSongDurationMs);
    return (
      <TimeSliderContainer>
        <TimeLabel style={{ width: `${Math.max(5, durationLabel.length)}ch` }}>
          {this.getTimeLabel()}
        </TimeLabel>
        <Slider
          pos={this.getSongPos()}
          onDrag={this.handlePositionDrag}
          onChange={this.handlePositionDrop}
          marks={geometry.marks}
          phraseMarks={geometry.phraseMarks}
          bassBars={geometry.bassBars}
          coloredMarks={geometry.coloredMarks}
        />
        <DurationLabel id="duration-label">
          {durationLabel}
        </DurationLabel>
      </TimeSliderContainer>
    );
  }
}
