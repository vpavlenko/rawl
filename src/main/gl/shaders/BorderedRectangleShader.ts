import { IRect } from "../../../common/geometry"
import { rectToTriangleBounds, rectToTriangles } from "../../helpers/polygon"
import { Attrib } from "../Attrib"
import { DisplayObject } from "../DisplayObject"
import { Shader } from "../Shader"
import { uniformMat4, uniformVec4 } from "../Uniform"

export class BorderedRectangleObject extends DisplayObject<
  ReturnType<typeof BorderedRectangleShader>,
  BorderedRectangleBuffer
> {
  constructor(gl: WebGLRenderingContext) {
    super(BorderedRectangleShader(gl), new BorderedRectangleBuffer(gl))
  }
}

export class BorderedRectangleBuffer {
  private gl: WebGLRenderingContext

  readonly buffers: {
    position: WebGLBuffer
    bounds: WebGLBuffer
  }
  private _vertexCount: number = 0

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl

    this.buffers = {
      position: gl.createBuffer()!,
      bounds: gl.createBuffer()!,
    }
  }

  update(rects: IRect[]) {
    const { gl } = this

    const positions = rects.flatMap(rectToTriangles)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW)

    const bounds = rects.flatMap(rectToTriangleBounds)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.bounds)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bounds), gl.DYNAMIC_DRAW)

    this._vertexCount = rects.length * 6
  }

  get vertexCount() {
    return this._vertexCount
  }
}

export const BorderedRectangleShader = (gl: WebGLRenderingContext) =>
  new Shader(
    gl,
    `
      precision lowp float;
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
    `,
    `
      precision lowp float;

      uniform vec4 uFillColor;
      uniform vec4 uStrokeColor;

      varying vec4 vBounds;
      varying vec2 vPosition;

      void main() {
        float border = 1.0;
        float localX = vPosition.x - vBounds.x;
        float localY = vPosition.y - vBounds.y;

        if ((localX < border) || (localX >= (vBounds.z - border)) || (localY < border) || (localY > (vBounds.w - border))) {
          // draw outline
          gl_FragColor = uStrokeColor;
        } else {
          gl_FragColor = uFillColor;
        }
      }
    `,
    (program) => ({
      position: new Attrib(gl, program, "aVertexPosition", 2),
      bounds: new Attrib(gl, program, "aBounds", 4),
    }),
    (program) => ({
      projectionMatrix: uniformMat4(gl, program, "uProjectionMatrix"),
      fillColor: uniformVec4(gl, program, "uFillColor"),
      strokeColor: uniformVec4(gl, program, "uStrokeColor"),
    })
  )
