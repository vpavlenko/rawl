import Color from "color"
import { vec4 } from "gl-matrix"
import { IRect } from "../../../common/geometry"
import { defaultTheme, Theme } from "../../../common/theme/Theme"
import { colorToVec4 } from "../../gl/color"
import { Renderer2D, translateMatrix } from "../../gl/Renderer2D"
import { BorderedRectangleObject } from "../../gl/shaders/BorderedRectangleShader"
import { SolidRectangleObject } from "../../gl/shaders/SolidRectangleShader"

export class TempoGraphRenderer {
  private renderer: Renderer2D

  private itemObject: BorderedRectangleObject
  private cursorObject: SolidRectangleObject
  private beatObject: SolidRectangleObject
  private highlightedBeatObject: SolidRectangleObject
  private lineObject: SolidRectangleObject

  theme: Theme = defaultTheme

  constructor(gl: WebGLRenderingContext) {
    this.renderer = new Renderer2D(gl)

    this.itemObject = new BorderedRectangleObject(gl)
    this.cursorObject = new SolidRectangleObject(gl)
    this.beatObject = new SolidRectangleObject(gl)
    this.highlightedBeatObject = new SolidRectangleObject(gl)
    this.lineObject = new SolidRectangleObject(gl)

    const objects = [
      this.beatObject,
      this.highlightedBeatObject,
      this.lineObject,
      this.itemObject,
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
    items: IRect[],
    beats: number[],
    highlightedBeats: number[],
    lines: number[],
    cursorX: number,
    scrollX: number
  ) {
    this.itemObject.updateBuffer(items)
    this.cursorObject.updateBuffer([this.vline(cursorX)])
    this.beatObject.updateBuffer(beats.map(this.vline))
    this.highlightedBeatObject.updateBuffer(highlightedBeats.map(this.vline))
    this.lineObject.updateBuffer(lines.map(this.hline))

    this.updateUniforms(scrollX)
    this.renderer.render()
  }

  private updateUniforms(scrollX: number) {
    const projectionMatrix = this.renderer.createProjectionMatrix()
    const projectionMatrixScrollX = translateMatrix(
      projectionMatrix,
      -scrollX,
      0
    )

    this.itemObject.updateUniforms({
      projectionMatrix: projectionMatrixScrollX,
      fillColor: colorToVec4(Color(this.theme.themeColor).alpha(0.1)),
      strokeColor: colorToVec4(Color(this.theme.themeColor)),
    })

    this.lineObject.updateUniforms({
      projectionMatrix: projectionMatrix,
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

    this.cursorObject.updateUniforms({
      projectionMatrix: projectionMatrixScrollX,
      color: vec4.fromValues(1, 0, 0, 1),
    })
  }
}
