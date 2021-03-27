//
// Initialize a shader program, so WebGL knows how to draw our data

import Color from "color"
import { mat4, vec4 } from "gl-matrix"
import { ISize } from "pixi.js"
import { IRect, zeroRect } from "../../../../common/geometry"
import { defaultTheme, Theme } from "../../../../common/theme/Theme"
import { Layout } from "../../../Constants"
import { HorizontalGridObject } from "./HorizontalGridShader"
import { RectangleObject } from "./RectangleShader"
import { RenderProperty } from "./RenderProperty"

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

  private noteRenderer: RectangleObject
  private selectedNoteRenderer: RectangleObject
  private selectionRenderer: RectangleObject
  private beatRenderer: RectangleObject
  private gridRenderer: HorizontalGridObject
  private cursorRenderer: RectangleObject

  theme: Theme = defaultTheme

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl
    this.setup()
  }

  private setup() {
    const { gl } = this

    this.noteRenderer = new RectangleObject(gl)
    this.selectedNoteRenderer = new RectangleObject(gl)
    this.selectionRenderer = new RectangleObject(gl)
    this.beatRenderer = new RectangleObject(gl)
    this.gridRenderer = new HorizontalGridObject(gl)
    this.cursorRenderer = new RectangleObject(gl)

    this.render([], [], zeroRect, [], 0)
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
    selection: IRect,
    beats: number[],
    cursorX: number
  ) {
    const { gl } = this

    this.noteRenderer.update(gl, notes)
    this.selectedNoteRenderer.update(gl, selectedNotes)
    this.selectionRenderer.update(gl, [selection])
    this.beatRenderer.update(gl, beats.map(this.vline))
    this.gridRenderer.update(gl, this.viewSize.value)
    this.cursorRenderer.update(gl, [this.vline(cursorX)])

    this.preDraw()
    this.draw()
  }

  private preDraw() {
    const { gl } = this

    this.viewSize.value = {
      width: gl.canvas.width,
      height: gl.canvas.height,
    }

    if (this.viewSize.isDirty) {
      gl.viewport(0, 0, this.viewSize.value.width, this.viewSize.value.height)
    }

    gl.clearColor(0.0, 0.0, 0.0, 0.0)
    gl.clearDepth(1.0) // Clear everything

    gl.disable(gl.DEPTH_TEST) // Enable depth testing
    gl.depthFunc(gl.LEQUAL) // Near things obscure far things

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    // Clear the canvas before we start drawing on it.

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    {
      const zNear = 0
      const zFar = 100.0
      const projectionMatrix = mat4.create()

      mat4.ortho(
        projectionMatrix,
        0,
        gl.canvas.width,
        gl.canvas.height,
        0,
        zNear,
        zFar
      )

      this.gridRenderer.projectionMatrix = projectionMatrix
      this.selectionRenderer.projectionMatrix = projectionMatrix
      this.beatRenderer.projectionMatrix = projectionMatrix
      this.noteRenderer.projectionMatrix = projectionMatrix
      this.selectedNoteRenderer.projectionMatrix = projectionMatrix
      this.cursorRenderer.projectionMatrix = projectionMatrix
    }

    {
      const baseColor = Color(this.theme.themeColor)
      const borderColor = baseColor.lighten(0.3)
      const selectedColor = baseColor.lighten(0.7)
      const selectedBorderColor = baseColor.lighten(0.8)

      this.noteRenderer.strokeColor = colorToVec4(borderColor)
      this.noteRenderer.fillColor = colorToVec4(baseColor)

      this.selectedNoteRenderer.strokeColor = colorToVec4(selectedColor)
      this.selectedNoteRenderer.fillColor = colorToVec4(selectedBorderColor)
    }

    this.selectionRenderer.strokeColor = vec4.fromValues(1, 0, 0, 1)
    this.selectionRenderer.fillColor = vec4.fromValues(0, 0, 0, 0)

    this.gridRenderer.color = vec4.fromValues(0.5, 0.5, 0.5, 1)
    this.gridRenderer.height = Layout.keyHeight

    this.beatRenderer.strokeColor = vec4.fromValues(0.5, 0.5, 0.5, 1)
    this.beatRenderer.fillColor = vec4.fromValues(0, 0, 0, 0)

    this.cursorRenderer.strokeColor = vec4.fromValues(1, 0, 0, 1)
    this.cursorRenderer.fillColor = vec4.fromValues(0, 0, 0, 0)
  }

  private draw() {
    const { gl } = this

    // this.gridRenderer.draw(gl)
    this.beatRenderer.draw(gl)
    this.noteRenderer.draw(gl)
    this.selectedNoteRenderer.draw(gl)
    this.selectionRenderer.draw(gl)
    this.cursorRenderer.draw(gl)
  }
}
