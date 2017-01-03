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
    <div>
      <Section title="one">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      </Section>
      <Section title="two">
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      </Section>
    </div>
  ))

storiesOf("PianoRoll", module)
  .add("empty", () => {
    const player = {
      on: () => {}
    }
    return <div style={{ width: 640, height: 480, overflow: "hidden", position: "relative" }}>
      <PianoRoll
        track={new Track()}
        player={player}
        endTick={400}
        scaleX={1}
        scaleY={1}
        autoScroll={false}
        onChangeTool={() => {}}
        mouseMode={0} />
    </div>
  })
