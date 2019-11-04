import React, { Component } from "react"
import { storiesOf } from "@storybook/react"
import { action } from '@storybook/addon-actions';
import "../src/theme.css"

// inputs

import Icon from "../src/components/Icon"
import Knob from "../src/components/inputs/Knob"
import Slider from "../src/components/inputs/Slider"
import Select from "../src/components/inputs/Select"
import Button from "../src/components/inputs/Button"
import TextInput from "../src/components/inputs/TextInput"
import NumberInput from "../src/components/inputs/NumberInput"

// groups

import Section from "../src/components/groups/Section"
import { MenuBar, MenuItem, SubMenu, MenuSeparator } from "../src/components/groups/MenuBar"
import { Toolbar, ToolbarItem, ToolbarSeparator } from "../src/components/groups/Toolbar"
import { createContextMenu, ContextMenu, MenuItem as ContextMenuItem } from "../src/components/groups/ContextMenu"

// containers

import PianoRoll from "../src/components/PianoRoll/PianoRoll"
import Stage from "../src/components/Stage/Stage"

// other

import Track from "../src/model/Track"
import Rect from "../src/geometry/Rect"
import Theme from "../src/model/Theme"
import SelectionModel from "../src/model/SelectionModel"

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

storiesOf("inputs", module)
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
  .add("Slider with maxValue", () => {
    const SliderWrapper = wrapControl(Slider)
    return <SliderWrapper maxValue={280} />
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

storiesOf("groups", module)
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
  .add("ContextMenu", () => (
    <Container>
      <div onContextMenu={createContextMenu(close =>
        <ContextMenu>
          <ContextMenuItem onClick={() => {
            action("onClick Menu 1")
          }}>Keep Opened</ContextMenuItem>
          <ContextMenuItem onClick={() => {
            action("onClick Menu 2")
            close()
          }}>Close</ContextMenuItem>
        </ContextMenu>
      )}>right click to open ContextMenu</div>
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
    resize: "both"
  }}>
    {children}
  </div>
}

storiesOf("PianoRoll", module)
  .add("empty", () => {
    const player = {
      on: () => { },
      off: () => { }
    }
    const track = new Track()
    return <Container width={300} height={300}>
      <PianoRoll
        track={track}
        dispatch={action}
        onChangeTool={action("onChangeTool")}
        onClickRuler={action("onClickRuler")}
        onClickKey={action("onClickKey")}
        theme={Theme.fromCSS()}
        beats={[]}
        selection={new SelectionModel()}
        noteMouseHandler={{
          onMouseDown: action("noteMouseHandler#onMouseDown"),
          onMouseMove: action("noteMouseHandler#onMouseMove"),
          onMouseUp: action("noteMouseHandler#onMouseUp"),
          defaultCursor: "crosshair"
        }}
        mouesMode={0}
        player={player} />
    </Container>
  })

function wrapStage(BaseComponent) {
  return class extends Component {
    constructor(props) {
      super(props)
      this.state = {
        selection: null,
        items: this.props.initialItems
      }
    }

    onChangeSelection = selection => {
      this.setState({ selection })
    }

    onMoveItems = items => {
      // 差し替える
      this.setState({
        items: this.state.items.map(i => {
          const items2 = items.filter(i2 => i2.id === i.id)
          if (items2.length > 0) {
            return items2[0]
          }
          return i
        })
      })
    }

    onContextMenu = e => {
      createContextMenu(close =>
        <ContextMenu>
          <ContextMenuItem onClick={() => {
            const itemIDs = e.items.map(i => i.id)
            this.setState({
              items: this.state.items.filter(i => !itemIDs.includes(i.id)),
              selection: null
            })
            close()
          }}>Delete</ContextMenuItem>
        </ContextMenu>
      )(e)
    }

    getSelectedItemIDs() {
      const rect = new Rect(this.state.selection)
      return this.state.selection ? this.state.items.filter(item => {
        return rect.containsRect(item)
      }).map(item => item.id) : []
    }

    render() {
      const selectedItemIDs = this.getSelectedItemIDs()

      return <BaseComponent
        {...this.props}
        items={this.state.items}
        selection={this.state.selection}
        onChangeSelection={this.onChangeSelection}
        onMoveItems={this.onMoveItems}
        onContextMenu={this.onContextMenu}
        selectedItemIDs={selectedItemIDs}
      />
    }
  }
}

storiesOf("Stage", module)
  .add("select", () => {
    const items = []
    function addItem() {
      items.push({ id: items.length, x: Math.random() * 300, y: Math.random() * 300, width: 20, height: 20 })
    }
    function drawItem(ctx, { x, y, width, height, selected }) {
      ctx.beginPath()
      ctx.fillStyle = selected ? "blue" : "gray"
      ctx.strokeStyle = "black"
      ctx.lineWidth = 1
      ctx.rect(x, y, width, height)
      ctx.fill()
      ctx.stroke()
    }
    for (let i = 0; i < 30; i++) {
      addItem()
    }
    const StageWrapper = wrapStage(Stage)
    return <StageWrapper
      width={300}
      height={300}
      initialItems={items}
      drawItem={drawItem}
    />
  })