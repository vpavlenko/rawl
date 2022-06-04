import {
  Attrib,
  rectToTriangleBounds,
  rectToTriangles,
  Shader,
  uniformMat4,
  uniformVec4,
} from "@ryohey/webgl-react"
import { IRect } from "../../../../../common/geometry"

export interface IVelocityData {
  velocity: number
}

export interface ISelectionData {
  isSelected: boolean
}

const triangleVelocities = (obj: IVelocityData): number[] =>
  Array(6).fill(obj.velocity)

const triangleSelections = (obj: ISelectionData): number[] =>
  Array(6).fill(obj.isSelected ? 1 : 0)

export class NoteBuffer {
  private gl: WebGLRenderingContext

  readonly buffers: {
    position: WebGLBuffer
    bounds: WebGLBuffer
    velocities: WebGLBuffer
    selection: WebGLBuffer
  }

  private _vertexCount: number = 0

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl
    this.buffers = {
      position: gl.createBuffer()!,
      bounds: gl.createBuffer()!,
      velocities: gl.createBuffer()!,
      selection: gl.createBuffer()!,
    }
  }

  update(rects: (IRect & IVelocityData & ISelectionData)[]) {
    const { gl } = this
    const positions = rects.flatMap(rectToTriangles)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW)

    const bounds = rects.flatMap(rectToTriangleBounds)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.bounds)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bounds), gl.DYNAMIC_DRAW)

    const velocities = rects.flatMap(triangleVelocities)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.velocities)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(velocities),
      gl.DYNAMIC_DRAW
    )

    const selection = rects.flatMap(triangleSelections)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.selection)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(selection), gl.DYNAMIC_DRAW)

    this._vertexCount = rects.length * 6
  }

  get vertexCount() {
    return this._vertexCount
  }
}

export const NoteShader = (gl: WebGLRenderingContext) =>
  new Shader(
    gl,
    `
      precision lowp float;
      attribute vec4 aVertexPosition;

      // XYZW -> X, Y, Width, Height
      attribute vec4 aBounds;
      attribute float aVelocity;
      attribute float aSelected;

      uniform mat4 uProjectionMatrix;
      varying vec4 vBounds;
      varying vec2 vPosition;
      varying float vVelocity;
      varying float vSelected;

      void main() {
        gl_Position = uProjectionMatrix * aVertexPosition;
        vBounds = aBounds;
        vPosition = aVertexPosition.xy;
        vVelocity = aVelocity;
        vSelected = aSelected;
      }
    `,
    `
      precision lowp float;

      uniform vec4 uFillColor;
      uniform vec4 uStrokeColor;

      varying vec4 vBounds;
      varying vec2 vPosition;
      varying float vVelocity;
      varying float vSelected;

      void main() {
        float border = 1.0;
        float localX = vPosition.x - vBounds.x;
        float localY = vPosition.y - vBounds.y;

        if ((localX < border) || (localX >= (vBounds.z - border)) || (localY < border) || (localY > (vBounds.w - border))) {
          // draw outline
          gl_FragColor = uStrokeColor;
        } else {
          gl_FragColor = mix(vec4(uFillColor.rgb, vVelocity / 127.0), vec4(1.0, 1.0, 1.0, 1.0), vSelected);
        }
      }
    `,
    (program) => ({
      position: new Attrib(gl, program, "aVertexPosition", 2),
      bounds: new Attrib(gl, program, "aBounds", 4),
      velocities: new Attrib(gl, program, "aVelocity", 1),
      selection: new Attrib(gl, program, "aSelected", 1),
    }),
    (program) => ({
      projectionMatrix: uniformMat4(gl, program, "uProjectionMatrix"),
      fillColor: uniformVec4(gl, program, "uFillColor"),
      strokeColor: uniformVec4(gl, program, "uStrokeColor"),
    })
  )
