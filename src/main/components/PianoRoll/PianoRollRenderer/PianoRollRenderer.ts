//
// Initialize a shader program, so WebGL knows how to draw our data

import Color from "color"
import { mat4, vec3, vec4 } from "gl-matrix"
import { ISize } from "pixi.js"
import { IPoint, IRect, zeroPoint, zeroRect } from "../../../../common/geometry"
import { defaultTheme, Theme } from "../../../../common/theme/Theme"
import { Layout } from "../../../Constants"
import { BorderedRectangleObject } from "./BorderedRectangleShader"
import { HorizontalGridObject } from "./HorizontalGridShader"
import { RenderProperty } from "./RenderProperty"
import { SolidRectangleObject } from "./SolidRectangleShader"

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

  private noteRenderer: BorderedRectangleObject
  private selectedNoteRenderer: BorderedRectangleObject
  private ghostNoteRenderer: BorderedRectangleObject
  private selectionRenderer: BorderedRectangleObject
  private beatRenderer: SolidRectangleObject
  private highlightedBeatRenderer: SolidRectangleObject
  private gridRenderer: HorizontalGridObject
  private cursorRenderer: SolidRectangleObject

  theme: Theme = defaultTheme

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl
    this.setup()
  }

  private setup() {
    const { gl } = this

    this.noteRenderer = new BorderedRectangleObject(gl)
    this.selectedNoteRenderer = new BorderedRectangleObject(gl)
    this.ghostNoteRenderer = new BorderedRectangleObject(gl)
    this.selectionRenderer = new BorderedRectangleObject(gl)
    this.beatRenderer = new SolidRectangleObject(gl)
    this.highlightedBeatRenderer = new SolidRectangleObject(gl)
    this.gridRenderer = new HorizontalGridObject(gl)
    this.cursorRenderer = new SolidRectangleObject(gl)

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

    this.noteRenderer.update(gl, notes)
    this.selectedNoteRenderer.update(gl, selectedNotes)
    this.ghostNoteRenderer.update(gl, ghostNotes)
    this.selectionRenderer.update(gl, [selection])
    this.beatRenderer.update(gl, beats.map(this.vline))
    this.highlightedBeatRenderer.update(gl, highlightedBeats.map(this.vline))
    this.gridRenderer.update(gl, this.viewSize.value)
    this.cursorRenderer.update(gl, [this.vline(cursorX)])

    this.preDraw(scroll)
    this.draw()
  }

  private clear() {
    const { gl } = this
    gl.clearColor(0.0, 0.0, 0.0, 0.0)
    gl.clearDepth(1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  }

  private preDraw(scroll: IPoint) {
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

    {
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

      this.gridRenderer.projectionMatrix = projectionMatrixScrollX
      this.selectionRenderer.projectionMatrix = projectionMatrixScrollXY
      this.beatRenderer.projectionMatrix = projectionMatrixScrollX
      this.highlightedBeatRenderer.projectionMatrix = projectionMatrixScrollX
      this.noteRenderer.projectionMatrix = projectionMatrixScrollXY
      this.selectedNoteRenderer.projectionMatrix = projectionMatrixScrollXY
      this.ghostNoteRenderer.projectionMatrix = projectionMatrixScrollXY
      this.cursorRenderer.projectionMatrix = projectionMatrixScrollX
    }

    {
      const baseColor = Color(this.theme.themeColor)
      const borderColor = baseColor.lighten(0.3)
      const selectedColor = baseColor.lighten(0.7)
      const selectedBorderColor = baseColor.lighten(0.8)

      this.noteRenderer.strokeColor = colorToVec4(borderColor)
      this.noteRenderer.fillColor = colorToVec4(baseColor)

      this.selectedNoteRenderer.strokeColor = colorToVec4(selectedBorderColor)
      this.selectedNoteRenderer.fillColor = colorToVec4(selectedColor)
    }

    {
      const baseColor = Color(this.theme.ghostNoteColor)
      const borderColor = baseColor.lighten(0.3)

      this.ghostNoteRenderer.strokeColor = colorToVec4(borderColor)
      this.ghostNoteRenderer.fillColor = colorToVec4(baseColor)
    }

    this.selectionRenderer.strokeColor = colorToVec4(
      Color(this.theme.themeColor)
    )
    this.selectionRenderer.fillColor = vec4.fromValues(0, 0, 0, 0)

    this.gridRenderer.color = vec4.fromValues(0.5, 0.5, 0.5, 1)
    this.gridRenderer.height = Layout.keyHeight

    this.beatRenderer.color = colorToVec4(
      Color(this.theme.dividerColor).alpha(0.2)
    )
    this.highlightedBeatRenderer.color = colorToVec4(
      Color(this.theme.dividerColor).alpha(0.5)
    )

    this.cursorRenderer.color = vec4.fromValues(1, 0, 0, 1)
  }

  private draw() {
    const { gl } = this

    // this.gridRenderer.draw(gl)
    this.beatRenderer.draw(gl)
    this.highlightedBeatRenderer.draw(gl)
    this.ghostNoteRenderer.draw(gl)
    this.noteRenderer.draw(gl)
    this.selectedNoteRenderer.draw(gl)
    this.selectionRenderer.draw(gl)
    this.cursorRenderer.draw(gl)
  }
}
