import Color from "color"
import { mat4, vec3, vec4 } from "gl-matrix"
import { IPoint, IRect, ISize } from "../../../common/geometry"
import { defaultTheme, Theme } from "../../../common/theme/Theme"
import { colorToVec4 } from "../../gl/color"
import { DisplayObject } from "../../gl/DisplayObject"
import { RenderProperty } from "../../gl/RenderProperty"
import { BorderedRectangleObject } from "../../gl/shaders/BorderedRectangleShader"
import { SolidRectangleObject } from "../../gl/shaders/SolidRectangleShader"

export class ArrangeViewRenderer {
  private gl: WebGLRenderingContext

  private viewSize: RenderProperty<ISize> = new RenderProperty(
    { width: 0, height: 0 },
    (a, b) => a.width === b.width && a.height === b.height
  )

  private objects: DisplayObject<any, any>[] = []

  private noteObject: SolidRectangleObject
  private cursorObject: SolidRectangleObject
  private beatObject: SolidRectangleObject
  private highlightedBeatObject: SolidRectangleObject
  private lineObject: SolidRectangleObject
  private selectionObject: BorderedRectangleObject

  theme: Theme = defaultTheme

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl

    this.noteObject = new SolidRectangleObject(gl)
    this.cursorObject = new SolidRectangleObject(gl)
    this.beatObject = new SolidRectangleObject(gl)
    this.highlightedBeatObject = new SolidRectangleObject(gl)
    this.lineObject = new SolidRectangleObject(gl)
    this.selectionObject = new BorderedRectangleObject(gl)

    this.objects = [
      this.lineObject,
      this.beatObject,
      this.highlightedBeatObject,
      this.noteObject,
      this.selectionObject,
      this.cursorObject,
    ]
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
    this.noteObject.updateBuffer(notes)
    this.selectionObject.updateBuffer([selection])
    this.cursorObject.updateBuffer([this.vline(cursorX)])
    this.beatObject.updateBuffer(beats.map(this.vline))
    this.highlightedBeatObject.updateBuffer(highlightedBeats.map(this.vline))
    this.lineObject.updateBuffer(lines.map(this.hline))

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

    const canvas = gl.canvas as HTMLCanvasElement

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
      this.lineObject.updateUniforms({
        projectionMatrix: projectionMatrixScrollY,
        color: colorToVec4(Color(this.theme.dividerColor)),
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

    this.noteObject.updateUniforms({
      projectionMatrix: projectionMatrixScrollXY,
      color: colorToVec4(Color(this.theme.themeColor)),
    })

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
