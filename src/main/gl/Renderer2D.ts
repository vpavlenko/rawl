import { mat4, vec3 } from "gl-matrix"
import { ISize } from "../../common/geometry"
import { RenderProperty } from "./RenderProperty"

export const translateMatrix = (mat: mat4, x: number, y: number) => {
  const newMat = mat4.create()
  mat4.translate(newMat, mat, vec3.fromValues(x, y, 0))
  return newMat
}

export interface Renderable {
  draw(): void
}

export class Renderer2D {
  readonly gl: WebGLRenderingContext

  private viewSize: RenderProperty<ISize> = new RenderProperty(
    { width: 0, height: 0 },
    (a, b) => a.width === b.width && a.height === b.height
  )

  private objects: Renderable[] = []
  private isQueued = false

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl
  }

  setNeedsDisplay() {
    if (this.isQueued) {
      return
    }
    requestAnimationFrame(() => {
      this.isQueued = false
      this.render()
    })
  }

  setObjects(objects: Renderable[]) {
    this.objects = objects
  }

  addObject(object: Renderable) {
    this.objects.push(object)
  }

  private clear() {
    const { gl } = this
    gl.clearColor(0.0, 0.0, 0.0, 0.0)
    gl.clearDepth(1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  }

  render() {
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

  createProjectionMatrix() {
    const zNear = 0
    const zFar = 100.0
    const projectionMatrix = mat4.create()

    const canvas = this.gl.canvas as HTMLCanvasElement

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

    return projectionMatrix
  }
}
