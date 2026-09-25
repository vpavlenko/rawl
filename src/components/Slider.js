import { noteColorClass } from "./rawl/colors";
import autoBindReact from "auto-bind/react";
import React, { PureComponent } from "react";
import styled from "styled-components";

// Slider color constants
const COLORS = {
  TRACK_FILLED: "#fff", // Light gray for filled portion of track
  TRACK_EMPTY: "#000", // Dark gray for empty portion of track
  TRACK_BORDER: "#888", // Medium gray for borders
  THUMB_BACKGROUND: "#fff", // Light gray for thumb (same as filled track)
  THUMB_BORDER: "#aaa", // Medium gray for thumb border
  THUMB_SHADOW: "rgba(0, 0, 0, 0.4)", // Semi-transparent black for shadow
};

const SliderContainer = styled.div`
  height: var(--charH);
  padding: 0;
  cursor: pointer;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  border: 0;
  display: inline-block;
`;

const SliderMark = styled.div`
  position: absolute;
  top: 50%;
  width: 1px;
  height: 7.5px;
  background: #fff;
  transform: translateX(-50%) translateY(-100%);
  pointer-events: none;
`;

const SliderColoredMark = styled.div`
  position: absolute;
  top: calc(50% - 7.5px);
  width: 10px;
  height: 7.5px;
  pointer-events: none;
`;

const SliderPhraseMark = styled(SliderMark)`
  height: 3.75px;
`;

const SliderBassBar = styled.div`
  position: absolute;
  top: 50%;
  height: 7.5px;
  border: 0;
  pointer-events: none;
`;

const SliderKnob = styled.div`
  height: calc(var(--charH) + 6px);
  width: var(--charW1);
  margin: 0;
  border-radius: 0;
  background-color: #fff;
  position: absolute;
  top: -3px;
  -webkit-box-shadow: none;
  box-shadow: none;
`;

const SliderMagnifier = styled.div`
  position: absolute;
  inset: -3px 0;
  pointer-events: none;

  ${SliderMark} {
    background: #000;
  }

  ${SliderColoredMark} {
    top: 0;
    height: 50%;
  }

  ${SliderBassBar} {
    height: 50%;
  }
`;

export const StyledRangeInput = styled.input.attrs({ type: "range" })`
  -webkit-appearance: none;
  background: transparent;
  width: 100%;

  &::-webkit-slider-runnable-track {
    width: 100%;
    height: 4px;
    background: ${(props) => `linear-gradient(to right, 
      ${COLORS.TRACK_FILLED} ${(props.value / props.max) * 100}%, 
      ${COLORS.TRACK_EMPTY} ${(props.value / props.max) * 100}%)`};
    border-radius: 2px;
    border: 1px solid ${COLORS.TRACK_BORDER};
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: ${COLORS.THUMB_BACKGROUND};
    border: 1px solid ${COLORS.THUMB_BORDER};
    margin-top: -7px; /* Centers the thumb on the track */
    cursor: pointer;
    box-shadow: 0 1px 3px ${COLORS.THUMB_SHADOW};
  }

  &::-moz-range-track {
    width: 100%;
    height: 4px;
    background: ${(props) => `linear-gradient(to right, 
      ${COLORS.TRACK_FILLED} ${(props.value / props.max) * 100}%, 
      ${COLORS.TRACK_EMPTY} ${(props.value / props.max) * 100}%)`};
    border-radius: 2px;
    border: 1px solid ${COLORS.TRACK_BORDER};
  }

  &::-moz-range-progress {
    background-color: ${COLORS.TRACK_FILLED};
    height: 4px;
    border-radius: 2px;
  }

  &::-moz-range-thumb {
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: ${COLORS.THUMB_BACKGROUND};
    border: 1px solid ${COLORS.THUMB_BORDER};
    cursor: pointer;
    box-shadow: 0 1px 3px ${COLORS.THUMB_SHADOW};
  }
`;

// Playback changes only move the knob and clipping window. These memoized
// layers retain all rectangle elements until their cached geometry changes.
const ColoredMarks = React.memo(({ marks }) => (
  <>{(marks ?? []).map(({ pos, pitchClass }, index) => (
    <SliderColoredMark key={index} className={noteColorClass(pitchClass)}
      aria-hidden="true" style={{ left: `${pos * 100}%` }} />
  ))}</>
));
const BassBars = React.memo(({ bars }) => (
  <>{(bars ?? []).map(({ start, end, pitchClass }, index) => (
    <SliderBassBar key={index} className={noteColorClass(pitchClass)}
      aria-hidden="true" style={{ left: `${start * 100}%`, width: `${(end - start) * 100}%` }} />
  ))}</>
));
const SectionMarks = React.memo(({ marks }) => (
  <>{(marks ?? []).map((mark, index) => (
    <SliderMark key={index} aria-hidden="true" style={{ left: `${mark * 100}%` }} />
  ))}</>
));

const PhraseMarks = React.memo(({ marks }) => (
  <>{(marks ?? []).map((mark, index) => (
    <SliderPhraseMark key={index} aria-hidden="true" style={{ left: `${mark * 100}%` }} />
  ))}</>
));

export default class Slider extends PureComponent {
  constructor(props) {
    super(props);
    autoBindReact(this);

    this.node = React.createRef();
    this.state = {
      dragging: false,
      draggedPos: null,
    };
  }

  onMouseMove(event) {
    if (this.state.dragging) {
      const node = this.node.current;
      const pos = Math.max(
        Math.min((event.clientX - node.offsetLeft) / node.offsetWidth, 1),
        0,
      );
      this.setState({
        draggedPos: pos,
      });
      this.props.onDrag(pos);
    }
  }

  onMouseDown(event) {
    event.preventDefault();
    event.persist();
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);
    this.setState({ dragging: true }, () => this.onMouseMove(event));
  }

  onMouseUp(event) {
    document.removeEventListener("mouseup", this.onMouseUp);
    document.removeEventListener("mousemove", this.onMouseMove);
    // Wait a moment to prevent 'snapback' (pos momentarily won't match draggedPos)
    setTimeout(() => {
      this.setState({ dragging: false });
    }, 150);
    this.props.onChange(this.state.draggedPos);
  }

  render() {
    const pos =
      Math.max(
        Math.min(
          this.state.dragging ? this.state.draggedPos : this.props.pos,
          1,
        ),
        0,
      ) *
        100 +
      "%";

    return (
      <SliderContainer ref={this.node} onMouseDown={this.onMouseDown}>
        <ColoredMarks marks={this.props.coloredMarks} />
        <SectionMarks marks={this.props.marks} />
        <PhraseMarks marks={this.props.phraseMarks} />
        <BassBars bars={this.props.bassBars} />
        <SliderKnob style={{
          left: pos,
          transition: this.state.dragging ? "none" : "left 0.37s linear",
        }} />
        <SliderMagnifier
          style={{
            // Overlap the knob's left edge to cover subpixel clipping seams.
            clipPath: `inset(0 calc(100% - ${pos} - var(--charW1)) 0 calc(${pos} - 1px))`,
            transition: this.state.dragging ? "none" : "clip-path 0.37s linear",
          }}
          aria-hidden="true"
        >
          <ColoredMarks marks={this.props.coloredMarks} />
          <BassBars bars={this.props.bassBars} />
          <SectionMarks marks={this.props.marks} />
          <PhraseMarks marks={this.props.phraseMarks} />
        </SliderMagnifier>
      </SliderContainer>
    );
  }
}
