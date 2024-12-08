import autoBindReact from "auto-bind/react";
import React, { PureComponent } from "react";
import styled from "styled-components";

const SliderContainer = styled.div`
  height: var(--charH);
  padding: 0;
  cursor: pointer;
  position: relative;
  width: 80%;
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
  background-color: var(--clickable);
  position: absolute;
  -webkit-box-shadow: none;
  box-shadow: none;
  left: ${(props) => props.pos};
  transition: ${(props) => (props.dragging ? "none" : "left 0.37s linear")};
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
