import autoBindReact from "auto-bind/react";
import { observePlaybackPosition } from "librawl/components";
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

const pad = (n) => (n < 10 ? "0" + n : n);

export default class TimeSlider extends React.PureComponent {
  constructor(props) {
    super(props);
    autoBindReact(this);

    this.state = {
      sliderData: props.timeSliderStore?.getSnapshot() ?? EMPTY_TIME_SLIDER_DATA,
    };
    this.slider = React.createRef();
    this.elapsed = React.createRef();
  }

  componentDidMount() {
    this.subscribeToGeometry();
    this.syncPlaybackFrames();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.timeSliderStore !== this.props.timeSliderStore) {
      this.unsubscribeGeometry?.();
      this.subscribeToGeometry();
    }
    if (prevProps.paused !== this.props.paused ||
      prevProps.getCurrentPositionMs !== this.props.getCurrentPositionMs) {
      this.syncPlaybackFrames();
    } else if (prevProps.currentSongPositionMs !== this.props.currentSongPositionMs ||
      prevProps.currentSongDurationMs !== this.props.currentSongDurationMs) {
      this.updateCurrentPosition();
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

  syncPlaybackFrames() {
    this.stopFrames?.();
    this.stopFrames = this.props.paused === false
      ? observePlaybackPosition(this.props.getCurrentPositionMs, this.paintPlaybackPosition)
      : undefined;
    if (!this.stopFrames) this.updateCurrentPosition();
  }

  updateCurrentPosition() {
    this.paintPlaybackPosition(this.props.getCurrentPositionMs());
  }

  paintPlaybackPosition(position) {
    const duration = this.props.currentSongDurationMs;
    const ms = duration > 0 && Number.isFinite(position)
      ? Math.max(0, Math.min(position, duration))
      : 0;
    if (this.slider.current?.setPosition(duration > 0 ? ms / duration : 0)) {
      this.paintTimeLabel(ms);
    }
  }

  componentWillUnmount() {
    this.unsubscribeGeometry?.();
    this.stopFrames?.();
  }

  paintTimeLabel(ms) {
    const label = this.getTime(ms);
    if (this.elapsed.current.textContent !== label) this.elapsed.current.textContent = label;
  }

  getTime(ms) {
    const sign = ms < 0 ? "-" : "";
    ms = Math.abs(ms);
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${sign}${min}:${pad(sec)}`;
  }

  handlePositionDrag(position) {
    this.paintTimeLabel(position * this.props.currentSongDurationMs);
  }

  handlePositionDrop(position) {
    this.props.onChange(position);
    this.updateCurrentPosition();
  }

  render() {
    const geometry = getGeometry(this.state.sliderData, this.props.currentSongDurationMs);
    const durationLabel = this.getTime(this.props.currentSongDurationMs);
    return (
      <TimeSliderContainer>
        <TimeLabel ref={this.elapsed} style={{ width: `${Math.max(5, durationLabel.length)}ch` }}>
          0:00
        </TimeLabel>
        <Slider
          ref={this.slider}
          onDrag={this.handlePositionDrag}
          onChange={this.handlePositionDrop}
          onCancel={this.updateCurrentPosition}
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
