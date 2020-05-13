import React, { Component } from "react"
import { storiesOf } from "@storybook/react"
import { action } from "@storybook/addon-actions"

// inputs

import Icon from "../src/main/components/outputs/Icon"
import TextInput from "../src/main/components/inputs/TextInput"

// groups

import {
  MenuBar,
  MenuItem,
  SubMenu,
  MenuSeparator,
} from "../src/main/components/groups/MenuBar"
import {
  Toolbar,
  ToolbarItem,
  ToolbarSeparator,
} from "../src/main/components/groups/Toolbar"
import { createContextMenu } from "../src/main/components/groups/ContextMenu"

// containers

import { PianoRoll } from "../src/main/components/PianoRoll/PianoRoll"
import Stage from "../src/main/components/Stage/Stage"

// other

import Track from "../src/common/track/Track"
import { defaultTheme } from "../src/common/theme/Theme"
import SelectionModel from "../src/common/selection/SelectionModel"
import NoteCoordTransform from "../src/common/transform/NoteCoordTransform"

/**

  e.target.value と props.value で受け渡しするコンポーネントをラップする

*/
function wrapControl(BaseComponent: any) {
  return class extends Component<any, any> {
    constructor(props: any) {
      super(props)
      this.state = {
        value: 0,
      }
    }
    render() {
      return (
        <BaseComponent
          {...this.props}
          value={this.state.value}
          onChange={(e: any) => this.setState({ value: e.target.value })}
        />
      )
    }
  }
}

storiesOf("inputs", module)
  .add("Icon", () => <Icon>earth</Icon>)
  .add("TextInput", () => (
    <TextInput value="hello" onChange={action("onChange")} />
  ))
  .add("TextInput with placeholder", () => (
    <TextInput placeholder="type here..." onChange={action("onChange")} />
  ))

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
  .add("Toolbar", () => (
    <Container>
      <Toolbar>
        <ToolbarItem>
          <Icon>eraser</Icon>
        </ToolbarItem>
        <ToolbarItem>
          <Icon>pencil</Icon>
        </ToolbarItem>
        <ToolbarItem selected={true}>
          <Icon>pen</Icon>
        </ToolbarItem>
        <ToolbarSeparator />
        <ToolbarItem>
          <Icon>undo</Icon>
        </ToolbarItem>
        <ToolbarItem>
          <Icon>redo</Icon>
        </ToolbarItem>
        <ToolbarSeparator />
        <ToolbarItem>share</ToolbarItem>
        <ToolbarItem touchDisabled={true}>
          <TextInput placeholder="Search" onChange={action("onChange")} />
        </ToolbarItem>
      </Toolbar>
    </Container>
  ))

function Container({ children, width, height, overflow }: any) {
  return (
    <div
      style={{
        width: width,
        height: height,
        overflow: overflow || "hidden",
        position: "relative",
        backgroundColor: "white",
        boxShadow: "0 1px 10px rgba(0, 0, 0, 0.1)",
        margin: "1em",
        resize: "both",
        display: "flex",
      }}
    >
      {children}
    </div>
  )
}

storiesOf("PianoRoll", module).add("empty", () => {
  const track = new Track()
  return (
    <Container width={300} height={300}>
      <PianoRoll
        track={track}
        theme={defaultTheme}
        selection={new SelectionModel()}
        transform={new NoteCoordTransform(10, 10, 127)}
        events={[]}
        measures={[]}
        timebase={480}
        previewNote={action("previewNote")}
        endTick={1000}
        alphaHeight={200}
        scrollLeft={0}
        setScrollLeft={action("setScrollLeft")}
        scrollTop={0}
        setScrollTop={action("setScrollTop")}
        controlMode={"velocity"}
        setControlMode={action("setControlMode")}
        notesCursor={"default"}
        cursorPosition={100}
        loop={{ begin: 0, end: 200, enabled: true }}
        setLoopBegin={action("setLoopBegin")}
        setLoopEnd={action("setLoopEnd")}
        onClickScaleUp={action("onClickScaleUp")}
        onClickScaleDown={action("onClickScaleDown")}
        onClickScaleReset={action("onClickScaleReset")}
        size={{ width: 300, height: 300 }}
        setPlayerPosition={action("setPlayerPosition")}
        mouseHandler={{
          onMouseDown: action("noteMouseHandler#onMouseDown"),
          onMouseMove: action("noteMouseHandler#onMouseMove"),
          onMouseUp: action("noteMouseHandler#onMouseUp"),
        }}
        createControlEvent={action("createControlEvent")}
        changeVelocity={action("createControlEvent")}
      />
    </Container>
  )
})

function wrapStage(BaseComponent: any) {
  return class extends Component<any, any> {
    constructor(props: any) {
      super(props)
      this.state = {
        selection: null,
        items: this.props.initialItems,
      }
    }

    onChangeSelection = (selection: any) => {
      this.setState({ selection })
    }

    onMoveItems = (items: any) => {
      // 差し替える
      this.setState({
        items: this.state.items.map((i: any) => {
          const items2 = items.filter((i2: any) => i2.id === i.id)
          if (items2.length > 0) {
            return items2[0]
          }
          return i
        }),
      })
    }

    onContextMenu = (e: any) => {
      createContextMenu((close) => [
        <MenuItem
          title="Delete"
          onClick={() => {
            const itemIDs = e.items.map((i: any) => i.id)
            this.setState({
              items: this.state.items.filter(
                (i: any) => !itemIDs.includes(i.id)
              ),
              selection: null,
            })
            close()
          }}
        />,
      ])(e)
    }

    getSelectedItemIDs() {
      const rect = this.state.selection
      return this.state.selection
        ? this.state.items
            .filter((item: any) => {
              return rect.containsRect(item)
            })
            .map((item: any) => item.id)
        : []
    }

    render() {
      const selectedItemIDs = this.getSelectedItemIDs()

      return (
        <BaseComponent
          {...this.props}
          items={this.state.items}
          selection={this.state.selection}
          onChangeSelection={this.onChangeSelection}
          onMoveItems={this.onMoveItems}
          onContextMenu={this.onContextMenu}
          selectedItemIDs={selectedItemIDs}
        />
      )
    }
  }
}

storiesOf("Stage", module).add("select", () => {
  const items: any[] = []
  function addItem() {
    items.push({
      id: items.length,
      x: Math.random() * 300,
      y: Math.random() * 300,
      width: 20,
      height: 20,
    })
  }
  function drawItem(ctx: any, { x, y, width, height, selected }: any) {
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
  return (
    <StageWrapper
      width={300}
      height={300}
      initialItems={items}
      drawItem={drawItem}
    />
  )
})
