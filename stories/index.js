import React, { Component } from "react"
import { storiesOf, action, linkTo } from "@kadira/storybook"
import "../src/theme.css"

// atoms

import Icon from "../src/components/atoms/Icon"
import Knob from "../src/components/atoms/Knob"
import Slider from "../src/components/atoms/Slider"
import Select from "../src/components/atoms/Select"
import Button from "../src/components/atoms/Button"
import TextInput from "../src/components/atoms/TextInput"
import NumberInput from "../src/components/atoms/NumberInput"

// molecules

import Section from "../src/components/molecules/Section"
import { MenuBar, MenuItem, SubMenu, MenuSeparator } from "../src/components/molecules/MenuBar"
import { Toolbar, ToolbarItem, ToolbarSeparator } from "../src/components/molecules/Toolbar"

// organisms

import PianoRoll from "../src/components/PianoRoll"

// other

import Track from "../src/model/Track"

/**

  e.target.value と props.value で受け渡しするコンポーネントをラップする

*/
function wrapControl(BaseComponent) {
  return class extends Component {
    constructor(props) {
      super(props)
      this.state = {
        value: 0
      }
    }
    render() {
      return <BaseComponent
        {...this.props}
        value={this.state.value}
        onChange={e => this.setState({ value: e.target.value })}
      />
    }
  }
}

storiesOf("atoms", module)
  .add("Button", () => (
    <Button>Hello</Button>
  ))
  .add("Icon", () => (
    <Icon>earth</Icon>
  ))
  .add("TextInput", () => (
    <TextInput value="hello" onChange={action("onChange")} />
  ))
  .add("TextInput with placeholder", () => (
    <TextInput placeholder="type here..." onChange={action("onChange")} />
  ))
  .add("NumberInput", () => (
    <NumberInput placeholder="velocity" onChange={action("onChange")} />
  ))
  .add("Select", () => (
    <Select options={[
      { value: "a", name: "option 1" },
      { value: "b", name: "option 2" },
      { value: "c", name: "option 3" },
    ]} onChange={action("onChange")} />
  ))
  .add("Slider", () => {
    const SliderWrapper = wrapControl(Slider)
    return <SliderWrapper />
  })
  .add("Knob", () => {
    const KnobWrapper = wrapControl(Knob)
    return <KnobWrapper />
  })
  .add("Knob pan", () => {
    const KnobWrapper = wrapControl(Knob)
    return <KnobWrapper
      minValue={-100}
      maxValue={100}
      offsetDegree={0}
      maxDegree={280} />
  })

storiesOf("molecules", module)
  .add("MenuBar", () => (
    <Container overflow="visible">
      <MenuBar>
        <MenuItem title={<Icon>apple</Icon>} />
        <MenuItem title="File">
          <SubMenu>
            <MenuItem title="Open" />
            <MenuItem title="Exit" />
          </SubMenu>
        </MenuItem>
        <MenuItem title="Edit">
          <SubMenu>
            <MenuItem title="Undo" />
            <MenuItem title="Redo" />
            <MenuSeparator />
            <MenuItem title="Cut" />
            <MenuItem title="Copy" />
          </SubMenu>
        </MenuItem>
        <MenuItem title="Window" />
        <MenuItem title="Settings" />
      </MenuBar>
    </Container>
  ))
  .add("Section", () => (
    <Container width={300} height={300}>
      <Section title="one">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      </Section>
      <Section title="two">
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      </Section>
    </Container>
  ))
  .add("Toolbar", () => (
    <Container>
      <Toolbar>
        <ToolbarItem><Icon>eraser</Icon></ToolbarItem>
        <ToolbarItem><Icon>pencil</Icon></ToolbarItem>
        <ToolbarItem selected={true}><Icon>pen</Icon></ToolbarItem>
        <ToolbarSeparator />
        <ToolbarItem><Icon>undo</Icon></ToolbarItem>
        <ToolbarItem><Icon>redo</Icon></ToolbarItem>
        <ToolbarSeparator />
        <ToolbarItem>share</ToolbarItem>
        <ToolbarItem touchDisabled={true}><TextInput placeholder="Search" onChange={action("onChange")} /></ToolbarItem>
      </Toolbar>
    </Container>
  ))

function Container({ children, width, height, overflow }) {
  return <div style={{
    width: width,
    height: height,
    overflow: overflow || "hidden",
    position: "relative",
    backgroundColor: "white",
    boxShadow: "0 1px 10px rgba(0, 0, 0, 0.1)",
    margin: "1em",
    resize: "both" }}>
    {children}
  </div>
}

storiesOf("PianoRoll", module)
  .add("empty", () => {
    const player = {
      on: () => {}
    }
    const track = new Track()
    return <Container width={300} height={300}>
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
