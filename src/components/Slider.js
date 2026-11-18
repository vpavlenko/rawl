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
  touch-action: none;
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

const SliderPlayhead = styled.div`
  position: absolute;
  inset: 0;
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

    this.playhead = React.createRef();
    this.magnifier = React.createRef();
    this.pointer = null;
    this.position = null;
  }

  setPosition(position) {
    if (this.pointer !== null) return false;
    this.paint(position);
    return true;
  }

  paint(position) {
    if (position === this.position) return;
    this.position = position;
    const percent = `${position * 100}%`;
    this.playhead.current.style.transform = `translateX(${percent})`;
    // Overlap the knob's left edge to cover subpixel clipping seams.
    this.magnifier.current.style.clipPath =
      `inset(0 calc(100% - ${percent} - var(--charW1)) 0 calc(${percent} - 1px))`;
  }

  onPointerMove(event) {
    if (this.pointer !== event.pointerId) return;
    const { left, width } = event.currentTarget.getBoundingClientRect();
    if (!width) return;
    const position = Math.max(0, Math.min((event.clientX - left) / width, 1));
    this.paint(position);
    this.props.onDrag(position);
  }

  onPointerDown(event) {
    if (this.pointer !== null || event.button !== 0) return;
    event.preventDefault();
    this.pointer = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    this.onPointerMove(event);
  }

  onPointerUp(event) {
    if (this.pointer !== event.pointerId) return;
    this.onPointerMove(event);
    this.pointer = null;
    this.props.onChange(this.position);
  }

  onPointerCancel(event) {
    if (this.pointer !== event.pointerId) return;
    this.pointer = null;
    this.props.onCancel();
  }

  render() {
    return (
      <SliderContainer
        onPointerDown={this.onPointerDown}
        onPointerMove={this.onPointerMove}
        onPointerUp={this.onPointerUp}
        onPointerCancel={this.onPointerCancel}
        onLostPointerCapture={this.onPointerCancel}
      >
        <ColoredMarks marks={this.props.coloredMarks} />
        <SectionMarks marks={this.props.marks} />
        <PhraseMarks marks={this.props.phraseMarks} />
        <BassBars bars={this.props.bassBars} />
        <SliderPlayhead ref={this.playhead} data-playback-head aria-hidden="true">
          <SliderKnob />
        </SliderPlayhead>
        <SliderMagnifier
          ref={this.magnifier}
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
