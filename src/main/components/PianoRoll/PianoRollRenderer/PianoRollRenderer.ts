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
import { DisplayObject } from "../../../gl/DisplayObject"
import { RenderProperty } from "../../../gl/RenderProperty"
import { BorderedCircleObject } from "../../../gl/shaders/BorderedCircleShader"
import { BorderedRectangleObject } from "../../../gl/shaders/BorderedRectangleShader"
import { SolidRectangleObject } from "../../../gl/shaders/SolidRectangleShader"
import { PianoNoteItem } from "../../../stores/PianoRollStore"
import { DrumNoteObject } from "./DrumNoteShader"
import { HorizontalGridObject } from "./HorizontalGridShader"
import { NoteObject } from "./NoteShader"

export class PianoRollRenderer {
  private gl: WebGLRenderingContext

  private viewSize: RenderProperty<ISize> = new RenderProperty(
    { width: 0, height: 0 },
    (a, b) => a.width === b.width && a.height === b.height
  )

  private objects: DisplayObject<any, any>[] = []

  private noteObject: NoteObject
  private hGridObject: HorizontalGridObject

  private drumNoteObject: DrumNoteObject

  private ghostNoteObject: BorderedRectangleObject

  private ghostDrumNoteObject: BorderedCircleObject

  private selectionObject: BorderedRectangleObject
  private beatObject: SolidRectangleObject
  private highlightedBeatObject: SolidRectangleObject
  private cursorObject: SolidRectangleObject

  theme: Theme = defaultTheme

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl

    this.hGridObject = new HorizontalGridObject(gl)
    this.beatObject = new SolidRectangleObject(gl)
    this.highlightedBeatObject = new SolidRectangleObject(gl)
    this.cursorObject = new SolidRectangleObject(gl)
    this.noteObject = new NoteObject(gl)
    this.ghostNoteObject = new BorderedRectangleObject(gl)
    this.drumNoteObject = new DrumNoteObject(gl)
    this.ghostDrumNoteObject = new BorderedCircleObject(gl)
    this.selectionObject = new BorderedRectangleObject(gl)

    this.objects.push(
      // this.hGridObject,
      this.beatObject,
      this.highlightedBeatObject,
      this.ghostNoteObject,
      this.ghostDrumNoteObject,
      this.noteObject,
      this.drumNoteObject,
      this.selectionObject,
      this.cursorObject
    )

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
    {
      const [drumNotes, normalNotes] = partition(notes, (n) => n.isDrum)
      const [drumGhostNotes, normalGhostNotes] = partition(
        ghostNotes,
        (n) => n.isDrum
      )

      this.noteObject.updateBuffer(normalNotes)
      this.ghostNoteObject.updateBuffer(normalGhostNotes)
      this.drumNoteObject.updateBuffer(drumNotes)
      this.ghostDrumNoteObject.updateBuffer(drumGhostNotes)
    }

    this.selectionObject.updateBuffer([selection])
    this.beatObject.updateBuffer(beats.map(this.vline))
    this.highlightedBeatObject.updateBuffer(highlightedBeats.map(this.vline))
    this.hGridObject.updateBuffer(this.viewSize.value)
    this.cursorObject.updateBuffer([this.vline(cursorX)])

    this.updateUniforms(scroll)
    this.draw()
  }

  private clear() {
    const { gl } = this
    gl.clearColor(0.0, 0.0, 0.0, 0.0)
    gl.clearDepth(1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  }

  private draw() {
    const { gl } = this

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

    this.objects.forEach((o) => o.draw())
  }

  private updateUniforms(scroll: IPoint) {
    const { gl } = this
    const zNear = 0
    const zFar = 100.0
    const projectionMatrix = mat4.create()

    const canvas = gl.canvas as HTMLCanvasElement

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
      this.hGridObject.updateUniforms({
        projectionMatrix: projectionMatrixScrollX,
        color: vec4.fromValues(0.5, 0.5, 0.5, 1),
        height: Layout.keyHeight,
      })
    }

    this.beatObject.updateUniforms({
      projectionMatrix: projectionMatrixScrollX,
      color: colorToVec4(Color(this.theme.dividerColor).alpha(0.2)),
    })

    this.highlightedBeatObject.updateUniforms({
      projectionMatrix: projectionMatrixScrollX,
      color: colorToVec4(Color(this.theme.dividerColor).alpha(0.5)),
    })

    {
      const baseColor = Color(this.theme.ghostNoteColor)
      const borderColor = baseColor.lighten(0.3)

      this.ghostNoteObject.updateUniforms({
        projectionMatrix: projectionMatrixScrollXY,
        strokeColor: colorToVec4(borderColor),
        fillColor: colorToVec4(baseColor),
      })
    }

    {
      const baseColor = Color(this.theme.ghostNoteColor)
      const borderColor = baseColor.lighten(0.3)

      this.ghostDrumNoteObject.updateUniforms({
        projectionMatrix: projectionMatrixScrollXY,
        strokeColor: colorToVec4(borderColor),
        fillColor: colorToVec4(baseColor),
      })
    }

    {
      const baseColor = Color(this.theme.themeColor)
      const borderColor = baseColor.lighten(0.3)

      this.noteObject.updateUniforms({
        projectionMatrix: projectionMatrixScrollXY,
        fillColor: colorToVec4(baseColor),
        strokeColor: colorToVec4(borderColor),
      })
    }

    {
      const baseColor = Color(this.theme.themeColor)
      const borderColor = baseColor.lighten(0.3)

      this.drumNoteObject.updateUniforms({
        projectionMatrix: projectionMatrixScrollXY,
        fillColor: colorToVec4(baseColor),
        strokeColor: colorToVec4(borderColor),
      })
    }

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
