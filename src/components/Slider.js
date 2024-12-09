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

const SliderRail = styled.div`
  width: calc(100% + var(--charW1));
  height: 3px;
  margin-top: -2px;
  background: none;
  position: absolute;
  top: 50%;
  box-sizing: border-box;
  border: 1px solid var(--clickable);
`;

const SliderKnob = styled.div`
  height: var(--charH);
  width: var(--charW1);
  margin: 0;
  border-radius: 0;
  background-color: #fff;
  position: absolute;
  -webkit-box-shadow: none;
  box-shadow: none;
  left: ${(props) => props.pos};
  transition: ${(props) => (props.dragging ? "none" : "left 0.37s linear")};
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
        <SliderRail />
        <SliderKnob pos={pos} dragging={this.state.dragging} />
      </SliderContainer>
    );
  }
}
