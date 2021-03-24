//
// Initialize a shader program, so WebGL knows how to draw our data

import { mat4, vec4 } from "gl-matrix"
import { ISize } from "pixi.js"
import { IRect } from "../../../../common/geometry"
import { defaultTheme } from "../../../../common/theme/Theme"
import { GridShader, PianoGridBuffer } from "./GridShader"
import { PianoNotesBuffer, RectangleShader } from "./RectangleShader"
import { RenderProperty } from "./RenderProperty"

export class PianoRollRenderer {
  private gl: WebGLRenderingContext

  private viewSize: RenderProperty<ISize> = new RenderProperty(
    { width: 0, height: 0 },
    (a, b) => a.width === b.width && a.height === b.height
  )

  private shader: RectangleShader
  private buffer: PianoNotesBuffer

  private gridShader: GridShader
  private gridBuffer: PianoGridBuffer

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl
    this.setup()
  }

  private setup() {
    const { gl } = this

    this.shader = new RectangleShader(gl)
    this.buffer = new PianoNotesBuffer(gl)

    this.gridShader = new GridShader(gl)
    this.gridBuffer = new PianoGridBuffer(gl)

    this.render([])
  }

  render(rects: IRect[]) {
    const { gl } = this

    this.buffer.update(gl, rects)
    this.gridBuffer.update(gl, this.viewSize.value)

    this.preDraw()
    this.gridShader.draw(gl, this.gridBuffer)
    this.shader.draw(gl, this.buffer)
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

    gl.clearColor(0.0, 0.0, 0.0, 1.0) // Clear to black, fully opaque
    gl.clearDepth(1.0) // Clear everything
    gl.disable(gl.DEPTH_TEST) // Enable depth testing
    gl.depthFunc(gl.LEQUAL) // Near things obscure far things

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

      this.gridShader.uProjectionMatrix.value = projectionMatrix
      this.shader.uProjectionMatrix.value = projectionMatrix
    }

    this.gridShader.uColor.value = vec4.fromValues(0.5, 0.5, 0.5, 1)
    this.gridShader.uHeight.value = defaultTheme.keyHeight
  }
}
