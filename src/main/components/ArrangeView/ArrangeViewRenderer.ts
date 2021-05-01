import { mat4, vec3, vec4 } from "gl-matrix"
import { IPoint, IRect, ISize } from "../../../common/geometry"
import {
  BorderedRectangleBuffer,
  BorderedRectangleShader,
} from "../PianoRoll/PianoRollRenderer/BorderedRectangleShader"
import { RenderProperty } from "../PianoRoll/PianoRollRenderer/RenderProperty"

export class ArrangeViewRenderer {
  private gl: WebGLRenderingContext

  private viewSize: RenderProperty<ISize> = new RenderProperty(
    { width: 0, height: 0 },
    (a, b) => a.width === b.width && a.height === b.height
  )

  private rectShader: BorderedRectangleShader
  private rectBuffer: BorderedRectangleBuffer

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl

    this.rectShader = new BorderedRectangleShader(gl)
    this.rectBuffer = new BorderedRectangleBuffer(gl)
  }

  render(rects: IRect[], scroll: IPoint) {
    this.rectBuffer.update(this.gl, rects)
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

    const projectionMatrixScrollXY = mat4.create()
    mat4.translate(
      projectionMatrixScrollXY,
      projectionMatrix,
      vec3.fromValues(-scroll.x, -scroll.y, 0)
    )

    {
      this.rectShader.uProjectionMatrix.value = projectionMatrixScrollXY
      this.rectShader.uStrokeColor.value = vec4.fromValues(1, 0, 0, 1)
      this.rectShader.uFillColor.value = vec4.fromValues(1, 0, 0, 1)
      this.rectShader.draw(gl, this.rectBuffer)
    }
  }
}
