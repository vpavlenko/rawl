import { mat4, vec4 } from "gl-matrix"
import { ISize } from "pixi.js"
import { rectToTriangles } from "../../../helpers/polygon"
import { initShaderProgram } from "../../../helpers/webgl"
import { RenderProperty } from "./RenderProperty"

export class PianoGridBuffer {
  readonly positionBuffer: WebGLBuffer

  constructor(gl: WebGLRenderingContext) {
    this.positionBuffer = gl.createBuffer()!
  }

  update(gl: WebGLRenderingContext, viewSize: ISize) {
    const positions = rectToTriangles({ x: 0, y: 0, ...viewSize })
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
  }

  get vertexCount() {
    return 6
  }
}

export class GridShader {
  private program: WebGLProgram

  // attribLocations
  private vertexPosition: number

  // uniformLocations
  private uProjectionMatrix: WebGLUniformLocation
  private uColor: WebGLUniformLocation

  readonly projectionMatrix: RenderProperty<mat4> = new RenderProperty<mat4>(
    mat4.create(),
    mat4.equals
  )

  readonly color: RenderProperty<vec4> = new RenderProperty<vec4>(
    vec4.create(),
    vec4.equals
  )

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
        vec2 st = gl_FragCoord.xy;
        float height = 12.0;
        float border = 1.0;
        gl_FragColor = step(fract(st.y / height), border / height) * uColor;
      }
    `
    const program = initShaderProgram(gl, vsSource, fsSource)!

    this.program = program

    this.vertexPosition = gl.getAttribLocation(program, "aVertexPosition")

    this.uProjectionMatrix = gl.getUniformLocation(
      program,
      "uProjectionMatrix"
    )!

    this.uColor = gl.getUniformLocation(program, "uColor")!
  }

  private setProjectionMatrix(gl: WebGLRenderingContext, mat: mat4) {
    gl.uniformMatrix4fv(this.uProjectionMatrix, false, mat)
  }

  private setColor(gl: WebGLRenderingContext, color: vec4) {
    gl.uniform4fv(this.uColor, color)
  }

  draw(gl: WebGLRenderingContext, buffer: PianoGridBuffer) {
    {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer.positionBuffer)
      gl.vertexAttribPointer(this.vertexPosition, 2, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(this.vertexPosition)
    }

    gl.useProgram(this.program)

    if (this.projectionMatrix.isDirty) {
      this.setProjectionMatrix(gl, this.projectionMatrix.value)
    }

    if (this.color.isDirty) {
      this.setColor(gl, this.color.value)
    }

    gl.drawArrays(gl.TRIANGLES, 0, buffer.vertexCount)
  }
}
