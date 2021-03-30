import { mat4, vec4 } from "gl-matrix"
import { IRect } from "../../../../common/geometry"
import { rectToTriangleBounds, rectToTriangles } from "../../../helpers/polygon"
import { initShaderProgram } from "../../../helpers/webgl"
import { Attrib } from "./Attrib"
import { Uniform, uniformMat4, uniformVec4 } from "./Uniform"

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
  readonly positionBuffer: WebGLBuffer
  readonly boundsBuffer: WebGLBuffer
  readonly velocitiesBuffer: WebGLBuffer
  readonly selectionBuffer: WebGLBuffer

  private _vertexCount: number

  constructor(gl: WebGLRenderingContext) {
    this.positionBuffer = gl.createBuffer()!
    this.boundsBuffer = gl.createBuffer()!
    this.velocitiesBuffer = gl.createBuffer()!
    this.selectionBuffer = gl.createBuffer()!
  }

  update(
    gl: WebGLRenderingContext,
    rects: (IRect & IVelocityData & ISelectionData)[]
  ) {
    const positions = rects.flatMap(rectToTriangles)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW)

    const bounds = rects.flatMap(rectToTriangleBounds)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.boundsBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bounds), gl.DYNAMIC_DRAW)

    const velocities = rects.flatMap(triangleVelocities)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.velocitiesBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(velocities),
      gl.DYNAMIC_DRAW
    )

    const selection = rects.flatMap(triangleSelections)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.selectionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(selection), gl.DYNAMIC_DRAW)

    this._vertexCount = rects.length * 6
  }

  get vertexCount() {
    return this._vertexCount
  }
}

export class NoteShader {
  private program: WebGLProgram

  private aVertex: Attrib
  private aBounds: Attrib
  private aVelocity: Attrib
  private aSelected: Attrib

  readonly uProjectionMatrix: Uniform<mat4>
  readonly uFillColor: Uniform<vec4>
  readonly uStrokeColor: Uniform<vec4>

  constructor(gl: WebGLRenderingContext) {
    const vsSource = `
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
    `

    const fsSource = `
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
    `
    const program = initShaderProgram(gl, vsSource, fsSource)!

    this.program = program

    this.aVertex = new Attrib(gl, program, "aVertexPosition", 2)
    this.aBounds = new Attrib(gl, program, "aBounds", 4)
    this.aVelocity = new Attrib(gl, program, "aVelocity", 1)
    this.aSelected = new Attrib(gl, program, "aSelected", 1)

    this.uProjectionMatrix = uniformMat4(gl, program, "uProjectionMatrix")
    this.uFillColor = uniformVec4(gl, program, "uFillColor")
    this.uStrokeColor = uniformVec4(gl, program, "uStrokeColor")
  }

  draw(gl: WebGLRenderingContext, buffer: NoteBuffer) {
    if (buffer.vertexCount === 0) {
      return
    }

    this.aVertex.upload(gl, buffer.positionBuffer)
    this.aBounds.upload(gl, buffer.boundsBuffer)
    this.aVelocity.upload(gl, buffer.velocitiesBuffer)
    this.aSelected.upload(gl, buffer.selectionBuffer)

    gl.useProgram(this.program)

    this.uProjectionMatrix.upload(gl)
    this.uFillColor.upload(gl)
    this.uStrokeColor.upload(gl)

    gl.drawArrays(gl.TRIANGLES, 0, buffer.vertexCount)
  }
}
