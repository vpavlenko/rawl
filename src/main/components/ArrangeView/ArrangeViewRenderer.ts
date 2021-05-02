import Color from "color"
import { mat4, vec3, vec4 } from "gl-matrix"
import { IPoint, IRect, ISize } from "../../../common/geometry"
import { defaultTheme, Theme } from "../../../common/theme/Theme"
import {
  BorderedRectangleBuffer,
  BorderedRectangleShader,
} from "../PianoRoll/PianoRollRenderer/BorderedRectangleShader"
import { colorToVec4 } from "../PianoRoll/PianoRollRenderer/color"
import { RenderProperty } from "../PianoRoll/PianoRollRenderer/RenderProperty"
import {
  SolidRectangleBuffer,
  SolidRectangleShader,
} from "../PianoRoll/PianoRollRenderer/SolidRectangleShader"

export class ArrangeViewRenderer {
  private gl: WebGLRenderingContext

  private viewSize: RenderProperty<ISize> = new RenderProperty(
    { width: 0, height: 0 },
    (a, b) => a.width === b.width && a.height === b.height
  )

  private rectShader: BorderedRectangleShader
  private solidRectShader: SolidRectangleShader
  private noteBuffer: SolidRectangleBuffer
  private cursorBuffer: SolidRectangleBuffer
  private beatBuffer: SolidRectangleBuffer
  private highlightedBeatBuffer: SolidRectangleBuffer
  private lineBuffer: SolidRectangleBuffer
  private selectionBuffer: BorderedRectangleBuffer

  theme: Theme = defaultTheme

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl

    this.rectShader = new BorderedRectangleShader(gl)
    this.solidRectShader = new SolidRectangleShader(gl)
    this.noteBuffer = new SolidRectangleBuffer(gl)
    this.cursorBuffer = new SolidRectangleBuffer(gl)
    this.beatBuffer = new SolidRectangleBuffer(gl)
    this.highlightedBeatBuffer = new SolidRectangleBuffer(gl)
    this.lineBuffer = new SolidRectangleBuffer(gl)
    this.selectionBuffer = new BorderedRectangleBuffer(gl)
  }

  private vline = (x: number): IRect => ({
    x,
    y: 0,
    width: 1,
    height: this.viewSize.value.height,
  })

  private hline = (y: number): IRect => ({
    x: 0,
    y,
    width: this.viewSize.value.width,
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
    const { gl } = this
    this.noteBuffer.update(gl, notes)
    this.selectionBuffer.update(gl, [selection])
    this.cursorBuffer.update(gl, [this.vline(cursorX)])
    this.beatBuffer.update(gl, beats.map(this.vline))
    this.highlightedBeatBuffer.update(gl, highlightedBeats.map(this.vline))
    this.lineBuffer.update(gl, lines.map(this.hline))

    this.draw(scroll)
  }

  private clear() {
    const { gl } = this
    gl.clearColor(0.0, 0.0, 0.0, 0.0)
    gl.clearDepth(1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  }

  private draw(scroll: IPoint) {
    const { gl } = this

    const canvas = gl.canvas as HTMLCanvasElement

    this.viewSize.value = {
      width: gl.canvas.width,
      height: gl.canvas.height,
    }

    if (this.viewSize.isDirty) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    }

    gl.disable(gl.CULL_FACE)
    gl.disable(gl.DEPTH_TEST)
    gl.disable(gl.DITHER)
    gl.disable(gl.POLYGON_OFFSET_FILL)
    gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE)
    gl.disable(gl.SAMPLE_COVERAGE)
    gl.disable(gl.SCISSOR_TEST)
    gl.disable(gl.STENCIL_TEST)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    this.clear()

    const zNear = 0
    const zFar = 100.0
    const projectionMatrix = mat4.create()

    const scale = canvas.clientWidth / canvas.width
    mat4.scale(
      projectionMatrix,
      projectionMatrix,
      vec3.fromValues(scale, scale, scale)
    )

    mat4.ortho(
      projectionMatrix,
      0,
      canvas.clientWidth,
      canvas.clientHeight,
      0,
      zNear,
      zFar
    )

    const projectionMatrixScrollX = mat4.create()
    mat4.translate(
      projectionMatrixScrollX,
      projectionMatrix,
      vec3.fromValues(-scroll.x, 0, 0)
    )

    const projectionMatrixScrollXY = mat4.create()
    mat4.translate(
      projectionMatrixScrollXY,
      projectionMatrix,
      vec3.fromValues(-scroll.x, -scroll.y, 0)
    )

    const projectionMatrixScrollY = mat4.create()
    mat4.translate(
      projectionMatrixScrollY,
      projectionMatrix,
      vec3.fromValues(0, -scroll.y, 0)
    )

    {
      this.solidRectShader.uProjectionMatrix.value = projectionMatrixScrollY
      this.solidRectShader.uColor.value = colorToVec4(
        Color(this.theme.dividerColor)
      )
      this.solidRectShader.draw(gl, this.lineBuffer)
    }

    {
      this.solidRectShader.uProjectionMatrix.value = projectionMatrixScrollX
      this.solidRectShader.uColor.value = colorToVec4(
        Color(this.theme.dividerColor).alpha(0.2)
      )
      this.solidRectShader.draw(gl, this.beatBuffer)
    }

    {
      this.solidRectShader.uProjectionMatrix.value = projectionMatrixScrollX
      this.solidRectShader.uColor.value = colorToVec4(
        Color(this.theme.dividerColor).alpha(0.5)
      )
      this.solidRectShader.draw(gl, this.highlightedBeatBuffer)
    }

    {
      this.solidRectShader.uProjectionMatrix.value = projectionMatrixScrollXY
      this.solidRectShader.uColor.value = colorToVec4(
        Color(this.theme.themeColor)
      )
      this.solidRectShader.draw(gl, this.noteBuffer)
    }

    {
      this.rectShader.uProjectionMatrix.value = projectionMatrixScrollXY
      this.rectShader.uStrokeColor.value = colorToVec4(
        Color(this.theme.themeColor)
      )
      this.rectShader.uFillColor.value = vec4.create()
      this.rectShader.draw(gl, this.selectionBuffer)
    }

    {
      this.solidRectShader.uProjectionMatrix.value = projectionMatrixScrollX
      this.solidRectShader.uColor.value = vec4.fromValues(1, 0, 0, 1)
      this.solidRectShader.draw(gl, this.cursorBuffer)
    }
  }
}
