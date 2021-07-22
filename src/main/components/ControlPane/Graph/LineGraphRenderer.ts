import Color from "color"
import { vec4 } from "gl-matrix"
import { IPoint, IRect } from "../../../../common/geometry"
import { joinObjects } from "../../../../common/helpers/array"
import { defaultTheme, Theme } from "../../../../common/theme/Theme"
import { colorToVec4 } from "../../../gl/color"
import { Renderer2D, translateMatrix } from "../../../gl/Renderer2D"
import { BorderedCircleObject } from "../../../gl/shaders/BorderedCircleShader"
import { SolidRectangleObject } from "../../../gl/shaders/SolidRectangleShader"

const createLineRects = (
  values: IPoint[],
  lineWidth: number,
  right: number
): IRect[] => {
  const horizontalLineRects = values.map(({ x, y }, i) => {
    const next = values[i + 1]
    const nextX = next ? next.x : right // 次がなければ右端まで描画する
    return {
      x,
      y,
      width: nextX - x,
      height: lineWidth,
    }
  })

  // add vertical lines between horizontal lines
  return joinObjects<IRect>(horizontalLineRects, (prev, next) => {
    const y = Math.min(prev.y, next.y)
    const height = Math.abs(prev.y - next.y) + lineWidth
    return {
      x: next.x,
      y,
      width: lineWidth,
      height,
    }
  })
}

export class LineGraphRenderer {
  private renderer: Renderer2D

  private itemObject: SolidRectangleObject
  private circleObject: BorderedCircleObject
  private cursorObject: SolidRectangleObject
  private beatObject: SolidRectangleObject
  private highlightedBeatObject: SolidRectangleObject
  private lineObject: SolidRectangleObject

  theme: Theme = defaultTheme

  constructor(gl: WebGLRenderingContext) {
    this.renderer = new Renderer2D(gl)

    this.itemObject = new SolidRectangleObject(gl)
    this.circleObject = new BorderedCircleObject(gl)
    this.cursorObject = new SolidRectangleObject(gl)
    this.beatObject = new SolidRectangleObject(gl)
    this.highlightedBeatObject = new SolidRectangleObject(gl)
    this.lineObject = new SolidRectangleObject(gl)

    const objects = [
      this.beatObject,
      this.highlightedBeatObject,
      this.lineObject,
      this.itemObject,
      this.circleObject,
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
    lineWidth: number,
    values: IPoint[],
    beats: number[],
    highlightedBeats: number[],
    lines: number[],
    cursorX: number,
    scrollX: number
  ) {
    const right = scrollX + this.renderer.gl.canvas.width

    this.itemObject.updateBuffer(createLineRects(values, lineWidth, right))
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
      color: colorToVec4(Color(this.theme.themeColor)),
    })

    this.circleObject.updateUniforms({
      projectionMatrix: projectionMatrixScrollX,
      strokeColor: colorToVec4(Color(this.theme.themeColor)),
      fillColor: colorToVec4(Color(this.theme.backgroundColor)),
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
