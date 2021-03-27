import { mat4, vec4 } from "gl-matrix"
import { IRect } from "../../../../common/geometry"
import { rectToTriangles } from "../../../helpers/polygon"
import { initShaderProgram } from "../../../helpers/webgl"
import { RenderObject } from "./RenderObject"
import { Uniform, uniformMat4, uniformVec4 } from "./Uniform"

export class SolidRectangleBuffer {
  readonly positionBuffer: WebGLBuffer
  private _vertexCount: number

  constructor(gl: WebGLRenderingContext) {
    this.positionBuffer = gl.createBuffer()!
  }

  update(gl: WebGLRenderingContext, rects: IRect[]) {
    const positions = rects.flatMap(rectToTriangles)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

    this._vertexCount = rects.length * 6
  }

  get vertexCount() {
    return this._vertexCount
  }
}

export class SolidRectangleShader {
  private program: WebGLProgram

  // attribLocations
  private vertexPosition: number

  // uniformLocations
  readonly uProjectionMatrix: Uniform<mat4>
  readonly uColor: Uniform<vec4>

  constructor(gl: WebGLRenderingContext) {
    const vsSource = `
      precision highp float;
      attribute vec4 aVertexPosition;
      uniform mat4 uProjectionMatrix;

      void main() {
        gl_Position = uProjectionMatrix * aVertexPosition;
      }
    `

    const fsSource = `
      precision highp float;

      uniform vec4 uColor;

      void main() {
        gl_FragColor = uColor;
      }
    `
    const program = initShaderProgram(gl, vsSource, fsSource)!

    this.program = program

    this.vertexPosition = gl.getAttribLocation(program, "aVertexPosition")
    this.uProjectionMatrix = uniformMat4(gl, program, "uProjectionMatrix")
    this.uColor = uniformVec4(gl, program, "uColor")
  }

  draw(gl: WebGLRenderingContext, buffer: SolidRectangleBuffer) {
    {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer.positionBuffer)
      gl.vertexAttribPointer(this.vertexPosition, 2, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(this.vertexPosition)
    }

    gl.useProgram(this.program)

    this.uProjectionMatrix.upload(gl)
    this.uColor.upload(gl)

    gl.drawArrays(gl.TRIANGLES, 0, buffer.vertexCount)
  }
}

export class SolidRectangleObject extends RenderObject<
  IRect[],
  SolidRectangleBuffer,
  SolidRectangleShader
> {
  constructor(gl: WebGLRenderingContext) {
    super(new SolidRectangleShader(gl), new SolidRectangleBuffer(gl))
  }

  set projectionMatrix(value: mat4) {
    this.shader.uProjectionMatrix.value = value
  }

  set color(value: vec4) {
    this.shader.uColor.value = value
  }
}
