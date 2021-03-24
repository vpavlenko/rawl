//
// Initialize a shader program, so WebGL knows how to draw our data

import { mat4 } from "gl-matrix"
import { ISize } from "pixi.js"
import { IRect } from "../../../common/geometry"
import { rectToTriangles } from "../../helpers/polygon"
import { initShaderProgram } from "../../helpers/webgl"

function initBuffers(gl: WebGLRenderingContext, rects: IRect[]) {
  // Create a buffer for the square's positions.

  const positionBuffer = gl.createBuffer()

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  // Now create an array of positions for the square.

  const positions = rects.flatMap(rectToTriangles)

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

  return {
    position: positionBuffer,
    count: rects.length * 6,
  }
}

class RectangleShader {
  readonly program: WebGLProgram

  // attribLocations
  readonly vertexPosition: number

  // uniformLocations
  private projectionMatrix: WebGLUniformLocation | null
  private modelViewMatrix: WebGLUniformLocation | null

  constructor(gl: WebGLRenderingContext) {
    const vsSource = `
      attribute vec4 aVertexPosition;

      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;

      void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      }
    `
    const fsSource = `
      void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
      }
    `
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource)!

    this.program = shaderProgram

    this.vertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition")

    this.projectionMatrix = gl.getUniformLocation(
      shaderProgram,
      "uProjectionMatrix"
    )
    this.modelViewMatrix = gl.getUniformLocation(
      shaderProgram,
      "uModelViewMatrix"
    )
  }

  setProjectionMatrix(gl: WebGLRenderingContext, mat: mat4) {
    gl.uniformMatrix4fv(this.projectionMatrix, false, mat)
  }

  setModelViewMatrix(gl: WebGLRenderingContext, mat: mat4) {
    gl.uniformMatrix4fv(this.modelViewMatrix, false, mat)
  }
}

class RenderProperty<T> {
  private _isDirty: boolean
  private _value: T
  private isEqual: (a: T, b: T) => boolean

  constructor(value: T, isEqual: (a: T, b: T) => boolean = (a, b) => a === b) {
    this._value = value
    this._isDirty = true
    this.isEqual = isEqual
  }

  get isDirty() {
    return this._isDirty
  }

  set value(value: T) {
    if (!this.isEqual(this._value, value)) {
      this._isDirty = true
      this._value = value
    }
  }

  get value() {
    return this._value
  }
}

export class PianoRollRenderer {
  private gl: WebGLRenderingContext
  private shader: RectangleShader
  private viewSize: RenderProperty<ISize> = new RenderProperty(
    { width: 0, height: 0 },
    (a, b) => a.width === b.width && a.height === b.height
  )
  private projectionMatrix: RenderProperty<mat4> = new RenderProperty<mat4>(
    mat4.create(),
    mat4.equals
  )

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl
    this.setup()
  }

  private setup() {
    const { gl } = this

    this.shader = new RectangleShader(gl)
  }

  render(rects: IRect[]) {
    const { gl } = this

    const buffers = initBuffers(gl, rects)

    this.drawScene(buffers)
  }

  private drawScene(buffers: ReturnType<typeof initBuffers>) {
    const { gl, shader } = this

    this.viewSize.value = {
      width: gl.canvas.width,
      height: gl.canvas.height,
    }

    if (this.viewSize.isDirty) {
      gl.viewport(0, 0, this.viewSize.value.width, this.viewSize.value.height)
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0) // Clear to black, fully opaque
    gl.clearDepth(1.0) // Clear everything
    gl.enable(gl.DEPTH_TEST) // Enable depth testing
    gl.depthFunc(gl.LEQUAL) // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    {
      const zNear = 0
      const zFar = 100.0
      const projectionMatrix = mat4.create()

      // note: glmatrix.js always has the first argument
      // as the destination to receive the result.
      mat4.ortho(
        projectionMatrix,
        0,
        gl.canvas.width,
        gl.canvas.height,
        0,
        zNear,
        zFar
      )

      this.projectionMatrix.value = projectionMatrix
    }

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create()

    // Now move the drawing position a bit to where we want to
    // start drawing the square.

    // mat4.translate(
    //   modelViewMatrix, // destination matrix
    //   modelViewMatrix, // matrix to translate
    //   [-0.0, 0.0, -6.0]
    // ) // amount to translate

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    {
      const numComponents = 2 // pull out 2 values per iteration
      const type = gl.FLOAT // the data in the buffer is 32bit floats
      const normalize = false // don't normalize
      const stride = 0 // how many bytes to get from one set of values to the next
      // 0 = use type and numComponents above
      const offset = 0 // how many bytes inside the buffer to start from
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
      gl.vertexAttribPointer(
        shader.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset
      )
      gl.enableVertexAttribArray(shader.vertexPosition)
    }

    // Tell WebGL to use our program when drawing

    gl.useProgram(shader.program)

    // Set the shader uniforms

    if (this.projectionMatrix.isDirty) {
      shader.setProjectionMatrix(gl, this.projectionMatrix.value)
    }

    shader.setModelViewMatrix(gl, modelViewMatrix)

    gl.drawArrays(gl.TRIANGLES, 0, buffers.count)
  }
}
