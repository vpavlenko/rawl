import Color from "color"
import { vec4 } from "gl-matrix"
import { partition } from "lodash"
import { IPoint, IRect } from "../../../../common/geometry"
import { defaultTheme, Theme } from "../../../../common/theme/Theme"
import { Layout } from "../../../Constants"
import { colorToVec4 } from "../../../gl/color"
import { Renderer2D, translateMatrix } from "../../../gl/Renderer2D"
import { BorderedCircleObject } from "../../../gl/shaders/BorderedCircleShader"
import { BorderedRectangleObject } from "../../../gl/shaders/BorderedRectangleShader"
import { SolidRectangleObject } from "../../../gl/shaders/SolidRectangleShader"
import { PianoNoteItem } from "../../../stores/PianoRollStore"
import { DrumNoteObject } from "./DrumNoteShader"
import { HorizontalGridObject } from "./HorizontalGridShader"
import { NoteObject } from "./NoteShader"

export class PianoRollRenderer {
  private renderer: Renderer2D

  private noteObject: NoteObject
  private hGridObject: HorizontalGridObject
  private drumNoteObject: DrumNoteObject
  private ghostNoteObject: BorderedRectangleObject
  private ghostDrumNoteObject: BorderedCircleObject
  private selectionObject: BorderedRectangleObject
  private beatObject: SolidRectangleObject
  private highlightedBeatObject: SolidRectangleObject
  private cursorObject: SolidRectangleObject

  theme: Theme = defaultTheme

  constructor(gl: WebGLRenderingContext) {
    this.renderer = new Renderer2D(gl)

    this.hGridObject = new HorizontalGridObject(gl)
    this.beatObject = new SolidRectangleObject(gl)
    this.highlightedBeatObject = new SolidRectangleObject(gl)
    this.cursorObject = new SolidRectangleObject(gl)
    this.noteObject = new NoteObject(gl)
    this.ghostNoteObject = new BorderedRectangleObject(gl)
    this.drumNoteObject = new DrumNoteObject(gl)
    this.ghostDrumNoteObject = new BorderedCircleObject(gl)
    this.selectionObject = new BorderedRectangleObject(gl)

    const objects = [
      this.hGridObject,
      this.beatObject,
      this.highlightedBeatObject,
      this.ghostNoteObject,
      this.ghostDrumNoteObject,
      this.noteObject,
      this.drumNoteObject,
      this.selectionObject,
      this.cursorObject,
    ]

    objects.forEach((o) => this.renderer.addObject(o))
  }

  private vline = (x: number): IRect => ({
    x,
    y: 0,
    width: 1,
    height: this.renderer.gl.canvas.height,
  })

  render(
    notes: PianoNoteItem[],
    ghostNotes: PianoNoteItem[],
    selection: IRect,
    beats: number[],
    highlightedBeats: number[],
    cursorX: number,
    scroll: IPoint,
    scale: IPoint
  ) {
    {
      const [drumNotes, normalNotes] = partition(notes, (n) => n.isDrum)
      const [drumGhostNotes, normalGhostNotes] = partition(
        ghostNotes,
        (n) => n.isDrum
      )

      this.noteObject.updateBuffer(normalNotes)
      this.ghostNoteObject.updateBuffer(normalGhostNotes)
      this.drumNoteObject.updateBuffer(drumNotes)
      this.ghostDrumNoteObject.updateBuffer(drumGhostNotes)
    }

    this.selectionObject.updateBuffer([selection])
    this.beatObject.updateBuffer(beats.map(this.vline))
    this.highlightedBeatObject.updateBuffer(highlightedBeats.map(this.vline))
    this.hGridObject.updateBuffer({
      x: 0,
      y: scroll.y,
      width: this.renderer.gl.canvas.width,
      height: this.renderer.gl.canvas.height,
    })
    this.cursorObject.updateBuffer([this.vline(cursorX)])

    this.updateUniforms(scroll, scale)
    this.renderer.render()
  }

  private updateUniforms(scroll: IPoint, scale: IPoint) {
    const projectionMatrix = this.renderer.createProjectionMatrix()
    const projectionMatrixScrollX = translateMatrix(
      projectionMatrix,
      -scroll.x,
      0
    )
    const projectionMatrixScrollXY = translateMatrix(
      projectionMatrix,
      -scroll.x,
      -scroll.y
    )
    const projectionMatrixScrollY = translateMatrix(
      projectionMatrix,
      0,
      -scroll.y
    )

    {
      this.hGridObject.updateUniforms({
        projectionMatrix: projectionMatrixScrollY,
        color: colorToVec4(Color(this.theme.dividerColor).alpha(0.2)),
        highlightedColor: colorToVec4(
          Color(this.theme.dividerColor).alpha(0.5)
        ),
        blackLaneColor: colorToVec4(Color(this.theme.pianoBlackKeyLaneColor)),
        height: scale.y * Layout.keyHeight,
      })
    }

    this.beatObject.updateUniforms({
      projectionMatrix: projectionMatrixScrollX,
      color: colorToVec4(Color(this.theme.dividerColor).alpha(0.2)),
    })

    this.highlightedBeatObject.updateUniforms({
      projectionMatrix: projectionMatrixScrollX,
      color: colorToVec4(Color(this.theme.dividerColor).alpha(0.5)),
    })

    {
      const baseColor = Color(this.theme.ghostNoteColor)
      const borderColor = baseColor.lighten(0.3)

      this.ghostNoteObject.updateUniforms({
        projectionMatrix: projectionMatrixScrollXY,
        strokeColor: colorToVec4(borderColor),
        fillColor: colorToVec4(baseColor),
      })
    }

    {
      const baseColor = Color(this.theme.ghostNoteColor)
      const borderColor = baseColor.lighten(0.3)

      this.ghostDrumNoteObject.updateUniforms({
        projectionMatrix: projectionMatrixScrollXY,
        strokeColor: colorToVec4(borderColor),
        fillColor: colorToVec4(baseColor),
      })
    }

    {
      const baseColor = Color(this.theme.themeColor)
      const borderColor = baseColor.lighten(0.3)

      this.noteObject.updateUniforms({
        projectionMatrix: projectionMatrixScrollXY,
        fillColor: colorToVec4(baseColor),
        strokeColor: colorToVec4(borderColor),
      })
    }

    {
      const baseColor = Color(this.theme.themeColor)
      const borderColor = baseColor.lighten(0.3)

      this.drumNoteObject.updateUniforms({
        projectionMatrix: projectionMatrixScrollXY,
        fillColor: colorToVec4(baseColor),
        strokeColor: colorToVec4(borderColor),
      })
    }

    this.selectionObject.updateUniforms({
      projectionMatrix: projectionMatrixScrollXY,
      strokeColor: colorToVec4(Color(this.theme.themeColor)),
      fillColor: vec4.create(),
    })

    this.cursorObject.updateUniforms({
      projectionMatrix: projectionMatrixScrollX,
      color: vec4.fromValues(1, 0, 0, 1),
    })
  }
}
