import React from "react"
import { storiesOf, action, linkTo } from "@kadira/storybook"
import "../static/css/theme.css"

import Welcome from "./Welcome"
import Select from "../src/components/Select"
import Section from "../src/components/Section"
import PianoRoll from "../src/components/PianoRoll"
import Track from "../src/model/Track"

storiesOf("Welcome", module)
  .add("to Storybook", () => (
    <Welcome showApp={linkTo("Button")}/>
  ))

storiesOf("Select", module)
  .add("options", () => (
    <Select options={[
      { value: "a", name: "option 1" },
      { value: "b", name: "option 2" },
      { value: "c", name: "option 3" },
    ]} />
  ))

storiesOf("Section", module)
  .add("with contents", () => (
    <Container>
      <Section title="one">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      </Section>
      <Section title="two">
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      </Section>
    </Container>
  ))

function Container(props) {
  return <div style={{
    width: 300,
    height: 300,
    overflow: "hidden",
    position: "relative",
    resize: "both" }}>
    {props.children}
  </div>
}

storiesOf("PianoRoll", module)
  .add("empty", () => {
    const player = {
      on: () => {}
    }
    const track = new Track()
    return <Container>
      <PianoRoll
        track={track}
        onChangeTool={action("onChangeTool")}
        onClickRuler={action("onClickRuler")}
        onClickKey={action("onClickKey")}
        noteMouseHandler={{
          onMouseDown: action("noteMouseHandler#onMouseDown"),
          onMouseMove: action("noteMouseHandler#onMouseMove"),
          onMouseUp: action("noteMouseHandler#onMouseUp"),
          defaultCursor: "crosshair"
        }}
        player={player} />
    </Container>
  })
