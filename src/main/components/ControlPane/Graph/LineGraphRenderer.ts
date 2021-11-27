import Color from "color"
import { vec4 } from "gl-matrix"
import { partition } from "lodash"
import { containsPoint, IPoint, IRect } from "../../../../common/geometry"
import { joinObjects } from "../../../../common/helpers/array"
import { BeatWithX } from "../../../../common/helpers/mapBeats"
import { defaultTheme, Theme } from "../../../../common/theme/Theme"
import { colorToVec4 } from "../../../gl/color"
import { Renderer2D, translateMatrix } from "../../../gl/Renderer2D"
import { BorderedCircleObject } from "../../../gl/shaders/BorderedCircleShader"
import { BorderedRectangleObject } from "../../../gl/shaders/BorderedRectangleShader"
import { SolidRectangleObject } from "../../../gl/shaders/SolidRectangleShader"
import { IDValue } from "../../../hooks/recycleKeys"

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
      y: y - lineWidth / 2,
      width: nextX - x,
      height: lineWidth,
    }
  })

  // add vertical lines between horizontal lines
  return joinObjects<IRect>(horizontalLineRects, (prev, next) => {
    const y = Math.min(prev.y, next.y)
    const height = Math.abs(prev.y - next.y) + lineWidth
    return {
      x: next.x - lineWidth / 2,
      y,
      width: lineWidth,
      height,
    }
  })
}

const pointToCircleRect = (p: IPoint, radius: number) => ({
  x: p.x - radius,
  y: p.y - radius,
  width: radius * 2,
  height: radius * 2,
})

export class LineGraphRenderer {
  private renderer: Renderer2D

  private itemObject: SolidRectangleObject
  private circleObject: BorderedCircleObject
  private highlightedCircleObject: BorderedCircleObject
  private selectionObject: BorderedRectangleObject
  private cursorObject: SolidRectangleObject
  private beatObject: SolidRectangleObject
  private highlightedBeatObject: SolidRectangleObject
  private horizontalLineObject: SolidRectangleObject

  theme: Theme = defaultTheme
  private circleRects: (IRect & IDValue)[] = []

  constructor(gl: WebGLRenderingContext) {
    this.renderer = new Renderer2D(gl)

    this.itemObject = new SolidRectangleObject(gl)
    this.circleObject = new BorderedCircleObject(gl)
    this.highlightedCircleObject = new BorderedCircleObject(gl)
    this.selectionObject = new BorderedRectangleObject(gl)
    this.cursorObject = new SolidRectangleObject(gl)
    this.beatObject = new SolidRectangleObject(gl)
    this.highlightedBeatObject = new SolidRectangleObject(gl)
    this.horizontalLineObject = new SolidRectangleObject(gl)

    const objects = [
      this.beatObject,
      this.highlightedBeatObject,
      this.horizontalLineObject,
      this.itemObject,
      this.highlightedCircleObject,
      this.circleObject,
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
    lineWidth: number,
    circleRadius: number,
    values: (IPoint & IDValue)[],
    selectedEventIds: number[],
    selection: IRect | null,
    beats: BeatWithX[],
    horizontalLines: number[],
    cursorX: number,
    scrollX: number
  ) {
    const right = scrollX + this.renderer.gl.canvas.width

    this.itemObject.updateBuffer(createLineRects(values, lineWidth, right))

    this.circleRects = values.map((p) => ({
      ...pointToCircleRect(p, circleRadius),
      id: p.id,
    }))

    const [highlightedItems, nonHighlightedItems] = partition(
      this.circleRects,
      (i) => selectedEventIds.includes(i.id)
    )

    const [highlightedBeats, nonHighlightedBeats] = partition(
      beats,
      (b) => b.beat === 0
    )

    this.circleObject.updateBuffer(nonHighlightedItems)
    this.highlightedCircleObject.updateBuffer(highlightedItems)

    this.cursorObject.updateBuffer([this.vline(cursorX)])
    this.beatObject.updateBuffer(
      nonHighlightedBeats.map((b) => this.vline(b.x))
    )
    this.highlightedBeatObject.updateBuffer(
      highlightedBeats.map((b) => this.vline(b.x))
    )
    this.horizontalLineObject.updateBuffer(horizontalLines.map(this.hline))
    this.selectionObject.updateBuffer(selection !== null ? [selection] : [])

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
      fillColor: colorToVec4(Color(this.theme.themeColor)),
    })

    this.highlightedCircleObject.updateUniforms({
      projectionMatrix: projectionMatrixScrollX,
      strokeColor: colorToVec4(Color(this.theme.themeColor)),
      fillColor: colorToVec4(Color(this.theme.textColor)),
    })

    this.selectionObject.updateUniforms({
      projectionMatrix: projectionMatrixScrollX,
      strokeColor: [0, 0, 0, 0],
      fillColor: colorToVec4(Color(this.theme.themeColor).alpha(0.2)),
    })

    this.horizontalLineObject.updateUniforms({
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

  hitTest(point: IPoint): number | undefined {
    return this.circleRects.find((r) => containsPoint(r, point))?.id
  }
}
