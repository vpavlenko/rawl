//
// Initialize a shader program, so WebGL knows how to draw our data

import { mat4, vec2 } from "gl-matrix"
import { ISize } from "pixi.js"
import { IRect } from "../../../common/geometry"
import {
  rectToTriangleBounds,
  rectToTriangles,
  rectToTriangleTexCoords,
} from "../../helpers/polygon"
import { initShaderProgram } from "../../helpers/webgl"

function initBuffers(gl: WebGLRenderingContext, rects: IRect[]) {
  const positionBuffer = gl.createBuffer()
  const positions = rects.flatMap(rectToTriangles)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

  const texCorrdsBuffer = gl.createBuffer()
  const texCoords = rects.flatMap(rectToTriangleTexCoords)
  gl.bindBuffer(gl.ARRAY_BUFFER, texCorrdsBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW)

  const boundsBuffer = gl.createBuffer()
  const bounds = rects.flatMap(rectToTriangleBounds)
  gl.bindBuffer(gl.ARRAY_BUFFER, boundsBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bounds), gl.STATIC_DRAW)

  return {
    position: positionBuffer,
    texCoords: texCorrdsBuffer,
    bounds: boundsBuffer,
    count: rects.length * 6,
  }
}

class RectangleShader {
  readonly program: WebGLProgram

  // attribLocations
  readonly vertexPosition: number
  readonly texCoord: number
  readonly bounds: number

  // uniformLocations
  private projectionMatrix: WebGLUniformLocation
  private modelViewMatrix: WebGLUniformLocation
  private resolution: WebGLUniformLocation

  constructor(gl: WebGLRenderingContext) {
    const vsSource = `
      precision highp float;
      attribute vec4 aVertexPosition;
      attribute vec2 aTexCoord;

      // XYZW -> X, Y, Width, Height
      attribute vec4 aBounds;

      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;
      uniform vec2 uResolution;
      varying vec2 vTexCoord;
      varying vec4 vBounds;
      varying vec2 vPosition;

      void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vTexCoord = aTexCoord;
        vBounds = aBounds;
        vPosition = aVertexPosition.xy;
      }
    `

    const fsSource = `
      precision highp float;
      varying vec2 vTexCoord;
      uniform vec2 uResolution;
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
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource)!

    this.program = shaderProgram

    this.vertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition")
    this.texCoord = gl.getAttribLocation(shaderProgram, "aTexCoord")
    this.bounds = gl.getAttribLocation(shaderProgram, "aBounds")

    this.projectionMatrix = gl.getUniformLocation(
      shaderProgram,
      "uProjectionMatrix"
    )!
    this.modelViewMatrix = gl.getUniformLocation(
      shaderProgram,
      "uModelViewMatrix"
    )!
    this.resolution = gl.getUniformLocation(shaderProgram, "uResolution")!
  }

  setProjectionMatrix(gl: WebGLRenderingContext, mat: mat4) {
    gl.uniformMatrix4fv(this.projectionMatrix, false, mat)
  }

  setModelViewMatrix(gl: WebGLRenderingContext, mat: mat4) {
    gl.uniformMatrix4fv(this.modelViewMatrix, false, mat)
  }

  setResolution(gl: WebGLRenderingContext, vec: vec2) {
    gl.uniform2fv(this.resolution, vec)
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
  private resolution: RenderProperty<vec2> = new RenderProperty<vec2>(
    vec2.create(),
    vec2.equals
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
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
      gl.vertexAttribPointer(shader.vertexPosition, 2, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(shader.vertexPosition)
    }

    {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texCoords)
      gl.vertexAttribPointer(shader.texCoord, 2, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(shader.texCoord)
    }

    {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.bounds)
      gl.vertexAttribPointer(shader.bounds, 4, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(shader.bounds)
    }

    gl.useProgram(shader.program)

    // Set the shader uniforms

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

    if (this.projectionMatrix.isDirty) {
      shader.setProjectionMatrix(gl, this.projectionMatrix.value)
    }

    this.resolution.value = vec2.fromValues(
      this.viewSize.value.width,
      this.viewSize.value.height
    )

    if (this.resolution.isDirty) {
      shader.setResolution(gl, this.resolution.value)
    }

    {
      const modelViewMatrix = mat4.create()
      shader.setModelViewMatrix(gl, modelViewMatrix)
    }

    gl.drawArrays(gl.TRIANGLES, 0, buffers.count)
  }
}
