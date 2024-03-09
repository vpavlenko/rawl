import {
  InstancedBuffer,
  rectToTriangles,
  Shader,
  VertexArray,
} from "@ryohey/webgl-react"
import { IRect } from "../../../../../common/geometry"

export interface INoteData {
  velocity: number
  isSelected: boolean
}

class Float32Data {
  readonly data: Float32Array
  private cursor: number = 0

  constructor(size: number) {
    this.data = new Float32Array(size)
  }

  push(value: number) {
    this.data[this.cursor++] = value
  }
}

export class NoteBuffer
  implements
    InstancedBuffer<(IRect & INoteData)[], "position" | "bounds" | "state">
{
  private _instanceCount: number = 0

  constructor(
    readonly vertexArray: VertexArray<"position" | "bounds" | "state">,
  ) {
    this.vertexArray.updateBuffer(
      "position",
      new Float32Array(rectToTriangles({ x: 0, y: 0, width: 1, height: 1 })),
    )
  }

  update(rects: (IRect & INoteData)[]) {
    const boundsData = new Float32Data(rects.length * 4)
    const stateData = new Float32Data(rects.length * 2)

    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i]
      boundsData.push(rect.x)
      boundsData.push(rect.y)
      boundsData.push(rect.width)
      boundsData.push(rect.height)

      stateData.push(rect.velocity / 127)
      stateData.push(rect.isSelected ? 1 : 0)
    }

    this.vertexArray.updateBuffer("bounds", boundsData.data)
    this.vertexArray.updateBuffer("state", stateData.data)

    this._instanceCount = rects.length
  }

  get vertexCount() {
    return 6
  }

  get instanceCount() {
    return this._instanceCount
  }
}

export const NoteShader = (gl: WebGL2RenderingContext) =>
  new Shader(
    gl,
    `#version 300 es
      precision lowp float;

      uniform mat4 projectionMatrix;

      in vec4 position;
      in vec4 bounds;  // [x, y, width, height]
      in vec2 state; // [velocity, isSelected]

      out vec4 vBounds;
      out vec2 vPosition;
      out vec2 vState;

      void main() {
        vec4 transformedPosition = vec4((position.xy * bounds.zw + bounds.xy), position.zw);
        gl_Position = projectionMatrix * transformedPosition;
        vBounds = bounds;
        vPosition = transformedPosition.xy;
        vState = state;
      }
    `,
    `#version 300 es
      precision lowp float;

      uniform vec4 strokeColor;
      uniform vec4 selectedColor;
      uniform vec4 inactiveColor;
      uniform vec4 activeColor;

      in vec4 vBounds;
      in vec2 vPosition;
      in vec2 vState;

      out vec4 outColor;

      void main() {
        float border = 1.0;
        float localX = vPosition.x - vBounds.x;
        float localY = vPosition.y - vBounds.y;

        if ((localX < border) || (localX >= (vBounds.z - border)) || (localY < border) || (localY > (vBounds.w - border))) {
          // draw outline
          outColor = strokeColor;
        } else {
          // if selected, draw selected color
          // otherwise, draw color based on velocity by mixing active and inactive color
          outColor = mix(mix(inactiveColor, activeColor, vState.x), selectedColor, vState.y);
        }
      }
    `,
    {
      position: { size: 2, type: gl.FLOAT },
      bounds: { size: 4, type: gl.FLOAT, divisor: 1 },
      state: { size: 2, type: gl.FLOAT, divisor: 1 },
    },
    {
      projectionMatrix: { type: "mat4" },
      strokeColor: { type: "vec4" },
      inactiveColor: { type: "vec4" },
      activeColor: { type: "vec4" },
      selectedColor: { type: "vec4" },
    },
  )
