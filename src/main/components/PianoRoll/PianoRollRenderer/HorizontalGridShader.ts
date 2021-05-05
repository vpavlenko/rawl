import { ISize } from "pixi.js"
import { Attrib } from "../../../gl/Attrib"
import { DisplayObject } from "../../../gl/DisplayObject"
import { Shader } from "../../../gl/Shader"
import { uniformFloat, uniformMat4, uniformVec4 } from "../../../gl/Uniform"
import { rectToTriangles } from "../../../helpers/polygon"

export class HorizontalGridObject extends DisplayObject<
  ReturnType<typeof HorizontalGridShader>,
  HorizontalGridBuffer
> {
  constructor(gl: WebGLRenderingContext) {
    super(HorizontalGridShader(gl), new HorizontalGridBuffer(gl))
  }
}

export class HorizontalGridBuffer {
  private gl: WebGLRenderingContext

  readonly buffers: {
    position: WebGLBuffer
  }

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl
    this.buffers = {
      position: gl.createBuffer()!,
    }
  }

  update(viewSize: ISize) {
    const { gl } = this
    const positions = rectToTriangles({ x: 0, y: 0, ...viewSize })
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW)
  }

  get vertexCount() {
    return 6
  }
}

export const HorizontalGridShader = (gl: WebGLRenderingContext) =>
  new Shader(
    gl,
    `
      precision lowp float;
      attribute vec4 aVertexPosition;
      uniform mat4 uProjectionMatrix;
      varying vec4 vPosition;

      void main() {
        gl_Position = uProjectionMatrix * aVertexPosition;
        vPosition = aVertexPosition;
      }
    `,
    `
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
    `,
    (program) => ({
      position: new Attrib(gl, program, "aVertexPosition", 2),
    }),
    (program) => ({
      projectionMatrix: uniformMat4(gl, program, "uProjectionMatrix"),
      color: uniformVec4(gl, program, "uColor"),
      height: uniformFloat(gl, program, "uHeight"),
    })
  )
