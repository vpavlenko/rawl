//
// Initialize a shader program, so WebGL knows how to draw our data

import { mat4 } from "gl-matrix"
import { IRect } from "../../../common/geometry"

//
function initShaderProgram(
  gl: WebGLRenderingContext,
  vsSource: string,
  fsSource: string
) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)!
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)!

  // Create the shader program

  const shaderProgram = gl.createProgram()!
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      "Unable to initialize the shader program: " +
        gl.getProgramInfoLog(shaderProgram)
    )
    return null
  }

  return shaderProgram
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!

  // Send the source to the shader object

  gl.shaderSource(shader, source)

  // Compile the shader program

  gl.compileShader(shader)

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      "An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader)
    )
    gl.deleteShader(shader)
    return null
  }

  return shader
}

function rectToTriangles(rect: IRect): number[] {
  return [
    rect.x,
    rect.y,
    rect.x + rect.width,
    rect.y,
    rect.x,
    rect.y + rect.height,
    rect.x + rect.width,
    rect.y,
    rect.x + rect.width,
    rect.y + rect.height,
    rect.x,
    rect.y + rect.height,
  ]
}

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

interface ProgramInfo {
  program: WebGLProgram
  attribLocations: {
    vertexPosition: number
  }
  uniformLocations: {
    projectionMatrix: WebGLUniformLocation | null
    modelViewMatrix: WebGLUniformLocation | null
  }
}

function drawScene(
  gl: WebGLRenderingContext,
  shader: RectangleShader,
  buffers: ReturnType<typeof initBuffers>
) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0) // Clear to black, fully opaque
  gl.clearDepth(1.0) // Clear everything
  gl.enable(gl.DEPTH_TEST) // Enable depth testing
  gl.depthFunc(gl.LEQUAL) // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = (45 * Math.PI) / 180 // in radians
  const canvas = gl.canvas as HTMLCanvasElement
  const aspect = canvas.clientWidth / canvas.clientHeight
  const zNear = 0
  const zFar = 100.0
  const projectionMatrix = mat4.create()

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.ortho(
    projectionMatrix,
    0,
    canvas.clientWidth,
    canvas.clientHeight,
    0,
    zNear,
    zFar
  )

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

  shader.setProjectionMatrix(gl, projectionMatrix)
  shader.setModelViewMatrix(gl, modelViewMatrix)

  {
    const offset = 0
    gl.drawArrays(gl.TRIANGLES, offset, buffers.count)
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

export class PianoRollRenderer {
  private gl: WebGLRenderingContext
  private shader: RectangleShader

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

    // クリアカラーを黒に設定し、完全に不透明にします
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    // 指定されたクリアカラーでカラーバッファをクリアします
    gl.clear(gl.COLOR_BUFFER_BIT)

    const buffers = initBuffers(gl, rects)

    drawScene(gl, this.shader, buffers)
  }
}
