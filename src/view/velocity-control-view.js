import createjs from "createjs"
import _ from "lodash"
import Theme from "../Theme"
import BeatLineView from "./beat-line-view"

/*
  events:
    "change": {
      target: view: noteId
      value: <Number>
    }
*/
const VEL_MAX_VALUE = 127
export default class VelocityControlView extends createjs.Container {
  constructor(keyWidth) {
    super()

    this.keyWidth = keyWidth
    this.background = new createjs.Shape
    this.addChild(this.background)

    this.beatLine = new BeatLineView()
    this.beatLine.x = keyWidth
    this.addChild(this.beatLine)

    this.valueLine = new createjs.Shape
    this.valueLine.y = 0.5
    this.addChild(this.valueLine)

    this.barContainer = new createjs.Container
    this.addChild(this.barContainer)

    this.leftLabel = new createjs.Shape
    this.addChild(this.leftLabel)

    this.setBounds(0, 0, 0, 0)

    this.on("pressmove", e => {
      const noteId = e.target.noteId
      if (noteId === undefined) return
      const height = this.getBounds().height
      const value = Math.floor(Math.max(0, Math.min(VEL_MAX_VALUE, 
        (height - this.globalToLocal(e.stageX, e.stageY).y) / height * VEL_MAX_VALUE)))
      const ev = new createjs.Event("change")
      ev.noteId = noteId
      ev.velocity = value
      this.dispatchEvent(ev)
    })
  }

  set ticksPerBeat(ticksPerBeat) {
    this._ticksPerBeat = ticksPerBeat
    this.beatLine.ticksPerBeat = ticksPerBeat
  }

  set transform(t) {
    this._transform = t
    this.beatLine.transform = t
  }

  set endTick(endTick) {
    this._endTick = endTick
    this.beatLine.endTick = endTick
  }

  setBounds(x, y, width, height) {
    super.setBounds(x, y, width, height)

    this.background.graphics.clear()
      .beginFill(Theme.backgroundColor)
      .rect(0, 0, width, height)
      .setStrokeStyle(1)
      .beginStroke(Theme.secondaryTextColor)
      .moveTo(0, 0.5)
      .lineTo(width, 0.5)

    this.beatLine.height = height

    this.valueLine.graphics
      .clear()
      .setStrokeStyle(1)
      .beginStroke(Theme.dividerColor)
      .moveTo(0, height / 2)
      .lineTo(width, height / 2)
      .moveTo(0, height)
      .lineTo(width, height)

    this.leftLabel.graphics
      .clear()
      .beginFill(Theme.backgroundColor)
      .rect(0, 0, this.keyWidth, height)
      .endFill()
      .setStrokeStyle(1)
      .beginStroke(Theme.secondaryTextColor)
      .moveTo(this.keyWidth + 0.5, 0)
      .lineTo(this.keyWidth + 0.5, height)
      .moveTo(0, 0.5)
      .lineTo(this.keyWidth, 0.5)
  }

  onScroll(x, y) {
    this.valueLine.x = -x + this.keyWidth
    this.leftLabel.x = -x
  }

  set notes(notes) {
    const views = this.barContainer.children.slice()
    this.barContainer.removeAllChildren()

    const viewHeight = this.getBounds().height
    notes.forEach(note => {
      let view = _.find(views, c => c.noteId == note.id)
      if (!view) {
        view = new createjs.Shape
        view.noteId = note.id
      }
      view.x = this.keyWidth + this._transform.getX(note.tick)
      const color = note.selected ? "black" : Theme.themeColor
      const height = note.velocity / 127 * viewHeight
      view.graphics
        .clear()
        .beginFill(color)
        .rect(0, viewHeight - height, 5, height)
      this.barContainer.addChild(view)
    })
  }
}
