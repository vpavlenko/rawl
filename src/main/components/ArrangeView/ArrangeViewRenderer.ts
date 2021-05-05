import Color from "color"
import { vec4 } from "gl-matrix"
import { IPoint, IRect } from "../../../common/geometry"
import { defaultTheme, Theme } from "../../../common/theme/Theme"
import { colorToVec4 } from "../../gl/color"
import { Renderer2D, translateMatrix } from "../../gl/Renderer2D"
import { BorderedRectangleObject } from "../../gl/shaders/BorderedRectangleShader"
import { SolidRectangleObject } from "../../gl/shaders/SolidRectangleShader"

export class ArrangeViewRenderer {
  private renderer: Renderer2D

  private noteObject: SolidRectangleObject
  private cursorObject: SolidRectangleObject
  private beatObject: SolidRectangleObject
  private highlightedBeatObject: SolidRectangleObject
  private lineObject: SolidRectangleObject
  private selectionObject: BorderedRectangleObject

  theme: Theme = defaultTheme

  constructor(gl: WebGLRenderingContext) {
    this.renderer = new Renderer2D(gl)

    this.noteObject = new SolidRectangleObject(gl)
    this.cursorObject = new SolidRectangleObject(gl)
    this.beatObject = new SolidRectangleObject(gl)
    this.highlightedBeatObject = new SolidRectangleObject(gl)
    this.lineObject = new SolidRectangleObject(gl)
    this.selectionObject = new BorderedRectangleObject(gl)

    const objects = [
      this.lineObject,
      this.beatObject,
      this.highlightedBeatObject,
      this.noteObject,
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

  private hline = (y: number): IRect => ({
    x: 0,
    y,
    width: this.renderer.gl.canvas.width,
    height: 1,
  })

  render(
    cursorX: number,
    notes: IRect[],
    selection: IRect,
    beats: number[],
    highlightedBeats: number[],
    lines: number[],
    scroll: IPoint
  ) {
    this.noteObject.updateBuffer(notes)
    this.selectionObject.updateBuffer([selection])
    this.cursorObject.updateBuffer([this.vline(cursorX)])
    this.beatObject.updateBuffer(beats.map(this.vline))
    this.highlightedBeatObject.updateBuffer(highlightedBeats.map(this.vline))
    this.lineObject.updateBuffer(lines.map(this.hline))

    this.updateUniforms(scroll)
    this.renderer.render()
  }

  private updateUniforms(scroll: IPoint) {
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

    this.lineObject.updateUniforms({
      projectionMatrix: projectionMatrixScrollY,
      color: colorToVec4(Color(this.theme.dividerColor)),
    })

    this.beatObject.updateUniforms({
      projectionMatrix: projectionMatrixScrollX,
      color: colorToVec4(Color(this.theme.dividerColor).alpha(0.2)),
    })

    this.highlightedBeatObject.updateUniforms({
      projectionMatrix: projectionMatrixScrollX,
      color: colorToVec4(Color(this.theme.dividerColor).alpha(0.5)),
    })

    this.noteObject.updateUniforms({
      projectionMatrix: projectionMatrixScrollXY,
      color: colorToVec4(Color(this.theme.themeColor)),
    })

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
