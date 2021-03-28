//
// Initialize a shader program, so WebGL knows how to draw our data

import Color from "color"
import { mat4, vec3, vec4 } from "gl-matrix"
import { ISize } from "pixi.js"
import { IPoint, IRect, zeroPoint, zeroRect } from "../../../../common/geometry"
import { defaultTheme, Theme } from "../../../../common/theme/Theme"
import { Layout } from "../../../Constants"
import {
  BorderedRectangleBuffer,
  BorderedRectangleShader,
} from "./BorderedRectangleShader"
import {
  HorizontalGridBuffer,
  HorizontalGridShader,
} from "./HorizontalGridShader"
import { RenderProperty } from "./RenderProperty"
import {
  SolidRectangleBuffer,
  SolidRectangleShader,
} from "./SolidRectangleShader"

const colorToVec4 = (color: Color): vec4 => {
  const rgb = color.rgb().array()
  return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, color.alpha()]
}

export class PianoRollRenderer {
  private gl: WebGLRenderingContext

  private viewSize: RenderProperty<ISize> = new RenderProperty(
    { width: 0, height: 0 },
    (a, b) => a.width === b.width && a.height === b.height
  )

  private borderedRectangleShader: BorderedRectangleShader
  private solidRectangleShader: SolidRectangleShader
  private horizontalGridShader: HorizontalGridShader

  private noteBuffer: BorderedRectangleBuffer
  private selectedNoteBuffer: BorderedRectangleBuffer
  private ghostNoteBuffer: BorderedRectangleBuffer
  private selectionBuffer: BorderedRectangleBuffer
  private beatBuffer: SolidRectangleBuffer
  private highlightedBeatBuffer: SolidRectangleBuffer
  private gridBuffer: HorizontalGridBuffer
  private cursorBuffer: SolidRectangleBuffer

  theme: Theme = defaultTheme

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl
    this.setup()
  }

  private setup() {
    const { gl } = this

    this.borderedRectangleShader = new BorderedRectangleShader(gl)
    this.solidRectangleShader = new SolidRectangleShader(gl)
    this.horizontalGridShader = new HorizontalGridShader(gl)

    this.noteBuffer = new BorderedRectangleBuffer(gl)
    this.selectedNoteBuffer = new BorderedRectangleBuffer(gl)
    this.ghostNoteBuffer = new BorderedRectangleBuffer(gl)
    this.selectionBuffer = new BorderedRectangleBuffer(gl)
    this.beatBuffer = new SolidRectangleBuffer(gl)
    this.highlightedBeatBuffer = new SolidRectangleBuffer(gl)
    this.gridBuffer = new HorizontalGridBuffer(gl)
    this.cursorBuffer = new SolidRectangleBuffer(gl)

    this.render([], [], [], zeroRect, [], [], 0, zeroPoint)
  }

  private vline = (x: number): IRect => ({
    x,
    y: 0,
    width: 1,
    height: this.viewSize.value.height,
  })

  render(
    notes: IRect[],
    selectedNotes: IRect[],
    ghostNotes: IRect[],
    selection: IRect,
    beats: number[],
    highlightedBeats: number[],
    cursorX: number,
    scroll: IPoint
  ) {
    const { gl } = this

    this.noteBuffer.update(gl, notes)
    this.selectedNoteBuffer.update(gl, selectedNotes)
    this.ghostNoteBuffer.update(gl, ghostNotes)
    this.selectionBuffer.update(gl, [selection])
    this.beatBuffer.update(gl, beats.map(this.vline))
    this.highlightedBeatBuffer.update(gl, highlightedBeats.map(this.vline))
    this.gridBuffer.update(gl, this.viewSize.value)
    this.cursorBuffer.update(gl, [this.vline(cursorX)])

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

    {
      this.horizontalGridShader.uProjectionMatrix.value = projectionMatrixScrollX
      this.horizontalGridShader.uColor.value = vec4.fromValues(0.5, 0.5, 0.5, 1)
      this.horizontalGridShader.uHeight.value = Layout.keyHeight
      // this.horizontalGridShader.draw(gl, this.gridBuffer)
    }

    {
      this.solidRectangleShader.uProjectionMatrix.value = projectionMatrixScrollX
      this.solidRectangleShader.uColor.value = colorToVec4(
        Color(this.theme.dividerColor).alpha(0.2)
      )
      this.solidRectangleShader.draw(gl, this.beatBuffer)
    }

    {
      this.solidRectangleShader.uProjectionMatrix.value = projectionMatrixScrollX
      this.solidRectangleShader.uColor.value = colorToVec4(
        Color(this.theme.dividerColor).alpha(0.5)
      )
      this.solidRectangleShader.draw(gl, this.highlightedBeatBuffer)
    }

    {
      const baseColor = Color(this.theme.ghostNoteColor)
      const borderColor = baseColor.lighten(0.3)

      this.borderedRectangleShader.uProjectionMatrix.value = projectionMatrixScrollXY
      this.borderedRectangleShader.uStrokeColor.value = colorToVec4(borderColor)
      this.borderedRectangleShader.uFillColor.value = colorToVec4(baseColor)
      this.borderedRectangleShader.draw(gl, this.ghostNoteBuffer)
    }

    {
      const baseColor = Color(this.theme.themeColor)
      const borderColor = baseColor.lighten(0.3)

      this.borderedRectangleShader.uProjectionMatrix.value = projectionMatrixScrollXY
      this.borderedRectangleShader.uStrokeColor.value = colorToVec4(borderColor)
      this.borderedRectangleShader.uFillColor.value = colorToVec4(baseColor)
      this.borderedRectangleShader.draw(gl, this.noteBuffer)
    }

    {
      const baseColor = Color(this.theme.themeColor)
      const selectedColor = baseColor.lighten(0.7)
      const selectedBorderColor = baseColor.lighten(0.8)

      this.borderedRectangleShader.uProjectionMatrix.value = projectionMatrixScrollXY
      this.borderedRectangleShader.uStrokeColor.value = colorToVec4(
        selectedBorderColor
      )
      this.borderedRectangleShader.uFillColor.value = colorToVec4(selectedColor)
      this.borderedRectangleShader.draw(gl, this.selectedNoteBuffer)
    }

    {
      this.borderedRectangleShader.uProjectionMatrix.value = projectionMatrixScrollXY
      this.borderedRectangleShader.uStrokeColor.value = colorToVec4(
        Color(this.theme.themeColor)
      )
      this.borderedRectangleShader.uFillColor.value = vec4.fromValues(
        0,
        0,
        0,
        0
      )
      this.borderedRectangleShader.draw(gl, this.selectionBuffer)
    }

    {
      this.solidRectangleShader.uProjectionMatrix.value = projectionMatrixScrollX
      this.solidRectangleShader.uColor.value = vec4.fromValues(1, 0, 0, 1)
      this.solidRectangleShader.draw(gl, this.cursorBuffer)
    }
  }
}
