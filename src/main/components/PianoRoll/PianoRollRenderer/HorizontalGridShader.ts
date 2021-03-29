import { mat4, vec4 } from "gl-matrix"
import { ISize } from "pixi.js"
import { rectToTriangles } from "../../../helpers/polygon"
import { initShaderProgram } from "../../../helpers/webgl"
import { Uniform, uniformFloat, uniformMat4, uniformVec4 } from "./Uniform"

export class HorizontalGridBuffer {
  readonly positionBuffer: WebGLBuffer

  constructor(gl: WebGLRenderingContext) {
    this.positionBuffer = gl.createBuffer()!
  }

  update(gl: WebGLRenderingContext, viewSize: ISize) {
    const positions = rectToTriangles({ x: 0, y: 0, ...viewSize })
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW)
  }

  get vertexCount() {
    return 6
  }
}

export class HorizontalGridShader {
  private program: WebGLProgram

  // attribLocations
  private vertexPosition: number

  // uniformLocations
  readonly uProjectionMatrix: Uniform<mat4>
  readonly uColor: Uniform<vec4>
  readonly uHeight: Uniform<number>

  constructor(gl: WebGLRenderingContext) {
    const vsSource = `
      precision lowp float;
      attribute vec4 aVertexPosition;
      uniform mat4 uProjectionMatrix;
      varying vec4 vPosition;

      void main() {
        gl_Position = uProjectionMatrix * aVertexPosition;
        vPosition = aVertexPosition;
      }
    `

    const fsSource = `
      precision lowp float;
      uniform vec4 uColor;
      uniform float uHeight;
      varying vec4 vPosition;
      
      void main() {
        float y = vPosition.y;
        float border = 1.0;
        float index = y / uHeight;
        float key = mod(index, 12.0);
        bool highlight = key < 0.1;
        vec4 color = highlight ? uColor : vec4(0.0, 0.0, 0.5, 1.0);
        gl_FragColor = step(fract(index), border / uHeight) * color;
      }
    `
    const program = initShaderProgram(gl, vsSource, fsSource)!

    this.program = program

    this.vertexPosition = gl.getAttribLocation(program, "aVertexPosition")
    this.uProjectionMatrix = uniformMat4(gl, program, "uProjectionMatrix")
    this.uColor = uniformVec4(gl, program, "uColor")!
    this.uHeight = uniformFloat(gl, program, "uHeight")!
  }

  draw(gl: WebGLRenderingContext, buffer: HorizontalGridBuffer) {
    if (buffer.vertexCount === 0) {
      return
    }

    {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer.positionBuffer)
      gl.vertexAttribPointer(this.vertexPosition, 2, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(this.vertexPosition)
    }

    gl.useProgram(this.program)

    this.uProjectionMatrix.upload(gl)
    this.uColor.upload(gl)
    this.uHeight.upload(gl)

    gl.drawArrays(gl.TRIANGLES, 0, buffer.vertexCount)
  }
}
