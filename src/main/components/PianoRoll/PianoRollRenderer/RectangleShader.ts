import { mat4 } from "gl-matrix"
import { IRect } from "../../../../common/geometry"
import { rectToTriangleBounds, rectToTriangles } from "../../../helpers/polygon"
import { initShaderProgram } from "../../../helpers/webgl"
import { RenderProperty } from "./RenderProperty"

export class PianoNotesBuffer {
  readonly positionBuffer: WebGLBuffer
  readonly boundsBuffer: WebGLBuffer
  private _vertexCount: number

  constructor(gl: WebGLRenderingContext) {
    this.positionBuffer = gl.createBuffer()!
    this.boundsBuffer = gl.createBuffer()!
  }

  update(gl: WebGLRenderingContext, rects: IRect[]) {
    const positions = rects.flatMap(rectToTriangles)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

    const bounds = rects.flatMap(rectToTriangleBounds)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.boundsBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bounds), gl.STATIC_DRAW)

    this._vertexCount = rects.length * 6
  }

  get vertexCount() {
    return this._vertexCount
  }
}

export class RectangleShader {
  private program: WebGLProgram

  // attribLocations
  private vertexPosition: number
  private bounds: number

  // uniformLocations
  private uProjectionMatrix: WebGLUniformLocation

  readonly projectionMatrix: RenderProperty<mat4> = new RenderProperty<mat4>(
    mat4.create(),
    mat4.equals
  )

  constructor(gl: WebGLRenderingContext) {
    const vsSource = `
      precision highp float;
      attribute vec4 aVertexPosition;

      // XYZW -> X, Y, Width, Height
      attribute vec4 aBounds;

      uniform mat4 uProjectionMatrix;
      varying vec4 vBounds;
      varying vec2 vPosition;

      void main() {
        gl_Position = uProjectionMatrix * aVertexPosition;
        vBounds = aBounds;
        vPosition = aVertexPosition.xy;
      }
    `

    const fsSource = `
      precision highp float;
      varying vec4 vBounds;
      varying vec2 vPosition;

      void main() {
        float border = 1.0;
        float localX = vPosition.x - vBounds.x;
        float localY = vPosition.y - vBounds.y;

        if ((localX < border) || (localX >= (vBounds.z - border)) || (localY < border) || (localY > (vBounds.w - border))) {
          // draw outline
          gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        } else {
          gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
      }
    `
    const program = initShaderProgram(gl, vsSource, fsSource)!

    this.program = program

    this.vertexPosition = gl.getAttribLocation(program, "aVertexPosition")
    this.bounds = gl.getAttribLocation(program, "aBounds")

    this.uProjectionMatrix = gl.getUniformLocation(
      program,
      "uProjectionMatrix"
    )!
  }

  private setProjectionMatrix(gl: WebGLRenderingContext, mat: mat4) {
    gl.uniformMatrix4fv(this.uProjectionMatrix, false, mat)
  }

  draw(gl: WebGLRenderingContext, buffer: PianoNotesBuffer) {
    {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer.positionBuffer)
      gl.vertexAttribPointer(this.vertexPosition, 2, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(this.vertexPosition)
    }

    {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer.boundsBuffer)
      gl.vertexAttribPointer(this.bounds, 4, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(this.bounds)
    }

    gl.useProgram(this.program)

    if (this.projectionMatrix.isDirty) {
      this.setProjectionMatrix(gl, this.projectionMatrix.value)
    }

    gl.drawArrays(gl.TRIANGLES, 0, buffer.vertexCount)
  }
}
