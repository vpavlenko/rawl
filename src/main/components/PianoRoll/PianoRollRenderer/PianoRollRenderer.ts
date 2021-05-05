//
// Initialize a shader program, so WebGL knows how to draw our data

import Color from "color"
import { mat4, vec3, vec4 } from "gl-matrix"
import { partition } from "lodash"
import { ISize } from "pixi.js"
import { IPoint, IRect, zeroPoint, zeroRect } from "../../../../common/geometry"
import { defaultTheme, Theme } from "../../../../common/theme/Theme"
import { Layout } from "../../../Constants"
import { colorToVec4 } from "../../../gl/color"
import { RenderProperty } from "../../../gl/RenderProperty"
import {
  BorderedCircleBuffer,
  BorderedCircleShader,
} from "../../../gl/shaders/BorderedCircleShader"
import {
  BorderedRectangleBuffer,
  BorderedRectangleShader,
} from "../../../gl/shaders/BorderedRectangleShader"
import {
  SolidRectangleBuffer,
  SolidRectangleShader,
} from "../../../gl/shaders/SolidRectangleShader"
import { PianoNoteItem } from "../../../stores/PianoRollStore"
import { DrumNoteShader } from "./DrumNoteShader"
import {
  HorizontalGridBuffer,
  HorizontalGridShader,
} from "./HorizontalGridShader"
import { NoteBuffer, NoteShader } from "./NoteShader"

export class PianoRollRenderer {
  private gl: WebGLRenderingContext

  private viewSize: RenderProperty<ISize> = new RenderProperty(
    { width: 0, height: 0 },
    (a, b) => a.width === b.width && a.height === b.height
  )

  private noteShader: NoteShader
  private drumNoteShader: DrumNoteShader
  private rectShader: BorderedRectangleShader
  private solidRectShader: SolidRectangleShader
  private hGridShader: HorizontalGridShader
  private circleShader: BorderedCircleShader

  private noteBuffer: NoteBuffer
  private ghostNoteBuffer: BorderedRectangleBuffer

  private drumNoteBuffer: NoteBuffer
  private ghostDrumNoteBuffer: BorderedCircleBuffer

  private selectionBuffer: BorderedRectangleBuffer
  private beatBuffer: SolidRectangleBuffer
  private highlightedBeatBuffer: SolidRectangleBuffer
  private gridBuffer: HorizontalGridBuffer
  private cursorBuffer: SolidRectangleBuffer

  theme: Theme = defaultTheme

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl

    this.noteShader = new NoteShader(gl)
    this.drumNoteShader = new DrumNoteShader(gl)
    this.rectShader = new BorderedRectangleShader(gl)
    this.solidRectShader = new SolidRectangleShader(gl)
    this.hGridShader = new HorizontalGridShader(gl)
    this.circleShader = new BorderedCircleShader(gl)

    this.noteBuffer = new NoteBuffer(gl)
    this.ghostNoteBuffer = new BorderedRectangleBuffer(gl)

    this.drumNoteBuffer = new NoteBuffer(gl)
    this.ghostDrumNoteBuffer = new BorderedCircleBuffer(gl)

    this.selectionBuffer = new BorderedRectangleBuffer(gl)
    this.beatBuffer = new SolidRectangleBuffer(gl)
    this.highlightedBeatBuffer = new SolidRectangleBuffer(gl)
    this.gridBuffer = new HorizontalGridBuffer(gl)
    this.cursorBuffer = new SolidRectangleBuffer(gl)

    this.render([], [], zeroRect, [], [], 0, zeroPoint)
  }

  private vline = (x: number): IRect => ({
    x,
    y: 0,
    width: 1,
    height: this.viewSize.value.height,
  })

  render(
    notes: PianoNoteItem[],
    ghostNotes: PianoNoteItem[],
    selection: IRect,
    beats: number[],
    highlightedBeats: number[],
    cursorX: number,
    scroll: IPoint
  ) {
    const { gl } = this

    {
      const [drumNotes, normalNotes] = partition(notes, (n) => n.isDrum)
      const [drumGhostNotes, normalGhostNotes] = partition(
        ghostNotes,
        (n) => n.isDrum
      )

      this.noteBuffer.update(gl, normalNotes)
      this.ghostNoteBuffer.update(gl, normalGhostNotes)
      this.drumNoteBuffer.update(gl, drumNotes)
      this.ghostDrumNoteBuffer.update(gl, drumGhostNotes)
    }

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
      this.hGridShader.uProjectionMatrix.value = projectionMatrixScrollX
      this.hGridShader.uColor.value = vec4.fromValues(0.5, 0.5, 0.5, 1)
      this.hGridShader.uHeight.value = Layout.keyHeight
      // this.hGridShader.draw(gl, this.gridBuffer)
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
      const baseColor = Color(this.theme.ghostNoteColor)
      const borderColor = baseColor.lighten(0.3)

      this.rectShader.uProjectionMatrix.value = projectionMatrixScrollXY
      this.rectShader.uStrokeColor.value = colorToVec4(borderColor)
      this.rectShader.uFillColor.value = colorToVec4(baseColor)
      this.rectShader.draw(gl, this.ghostNoteBuffer)
    }

    {
      const baseColor = Color(this.theme.ghostNoteColor)
      const borderColor = baseColor.lighten(0.3)

      this.circleShader.uProjectionMatrix.value = projectionMatrixScrollXY
      this.circleShader.uStrokeColor.value = colorToVec4(borderColor)
      this.circleShader.uFillColor.value = colorToVec4(baseColor)
      this.circleShader.draw(gl, this.ghostDrumNoteBuffer)
    }

    {
      const baseColor = Color(this.theme.themeColor)
      const borderColor = baseColor.lighten(0.3)

      this.noteShader.uProjectionMatrix.value = projectionMatrixScrollXY
      this.noteShader.uFillColor.value = colorToVec4(baseColor)
      this.noteShader.uStrokeColor.value = colorToVec4(borderColor)
      this.noteShader.draw(gl, this.noteBuffer)
    }

    {
      const baseColor = Color(this.theme.themeColor)
      const borderColor = baseColor.lighten(0.3)

      this.drumNoteShader.uProjectionMatrix.value = projectionMatrixScrollXY
      this.drumNoteShader.uFillColor.value = colorToVec4(baseColor)
      this.drumNoteShader.uStrokeColor.value = colorToVec4(borderColor)
      this.drumNoteShader.draw(gl, this.drumNoteBuffer)
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
