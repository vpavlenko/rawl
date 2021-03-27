//
// Initialize a shader program, so WebGL knows how to draw our data

import Color from "color"
import { mat4, vec3, vec4 } from "gl-matrix"
import { ISize } from "pixi.js"
import { IRect, zeroRect } from "../../../../common/geometry"
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

    this.render([], [], [], zeroRect, [], [], 0, 0)
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
    scrollLeft: number
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

    this.preDraw(scrollLeft)
    this.draw()
  }

  private preDraw(scrollLeft: number) {
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

      mat4.translate(
        projectionMatrix,
        projectionMatrix,
        vec3.fromValues(-scrollLeft, 0, 0)
      )

      this.gridRenderer.projectionMatrix = projectionMatrix
      this.selectionRenderer.projectionMatrix = projectionMatrix
      this.beatRenderer.projectionMatrix = projectionMatrix
      this.highlightedBeatRenderer.projectionMatrix = projectionMatrix
      this.noteRenderer.projectionMatrix = projectionMatrix
      this.selectedNoteRenderer.projectionMatrix = projectionMatrix
      this.ghostNoteRenderer.projectionMatrix = projectionMatrix
      this.cursorRenderer.projectionMatrix = projectionMatrix
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

    this.selectionRenderer.strokeColor = vec4.fromValues(1, 0, 0, 1)
    this.selectionRenderer.fillColor = vec4.fromValues(0, 0, 0, 0)

    this.gridRenderer.color = vec4.fromValues(0.5, 0.5, 0.5, 1)
    this.gridRenderer.height = Layout.keyHeight

    this.beatRenderer.color = colorToVec4(
      Color(this.theme.dividerColor).alpha(0.5)
    )

    this.highlightedBeatRenderer.color = colorToVec4(
      Color(this.theme.dividerColor).alpha(1.0)
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
