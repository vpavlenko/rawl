import { mat4, vec4 } from "gl-matrix"
import { initShaderProgram } from "../../../helpers/webgl"
import { Attrib } from "./Attrib"
import { NoteBuffer } from "./NoteShader"
import { Uniform, uniformMat4, uniformVec4 } from "./Uniform"

export class DrumNoteShader {
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
        
        float r = vBounds.w / 2.0;
        vec2 center = vBounds.xy + vBounds.zw / 2.0;
        float len = length(vPosition - center);

        if (len < r - border) {
          gl_FragColor = mix(vec4(uFillColor.rgb, vVelocity / 127.0), vec4(1.0, 1.0, 1.0, 1.0), vSelected);
        } else if (len < r) {
          gl_FragColor = uStrokeColor;
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
