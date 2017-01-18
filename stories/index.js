import React from "react"
import { storiesOf, action, linkTo } from "@kadira/storybook"
import "../src/theme.css"

import Button from "../src/components/atoms/Button"
import Icon from "../src/components/atoms/Icon"
import Select from "../src/components/atoms/Select"
import TextInput from "../src/components/atoms/TextInput"
import NumberInput from "../src/components/atoms/NumberInput"
import { MenuBar, MenuItem, SubMenu, MenuSeparator } from "../src/components/molecules/MenuBar"
import Section from "../src/components/molecules/Section"
import { Toolbar, ToolbarItem, ToolbarSeparator } from "../src/components/molecules/Toolbar"
import PianoRoll from "../src/components/PianoRoll"
import Track from "../src/model/Track"

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
