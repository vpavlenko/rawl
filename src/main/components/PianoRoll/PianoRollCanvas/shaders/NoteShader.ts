import {
  InstancedBuffer,
  rectToTriangles,
  Shader,
  VertexArray,
} from "@ryohey/webgl-react"
import { vec4 } from "gl-matrix"
import { IRect } from "../../../../../common/geometry"

export interface IColorData {
  color: vec4
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

export class NoteBuffer extends InstancedBuffer<
  (IRect & IColorData)[],
  "position" | "bounds" | "color"
> {
  private _instanceCount: number = 0

  constructor(vertexArray: VertexArray<"position" | "bounds" | "color">) {
    super(vertexArray)

    this.vertexArray.updateBuffer(
      "position",
      new Float32Array(rectToTriangles({ x: 0, y: 0, width: 1, height: 1 })),
    )
  }

  update(rects: (IRect & IColorData)[]) {
    const boundsData = new Float32Data(rects.length * 4)
    const colorsData = new Float32Data(rects.length * 4)

    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i]
      boundsData.push(rect.x)
      boundsData.push(rect.y)
      boundsData.push(rect.width)
      boundsData.push(rect.height)

      colorsData.push(rect.color[0])
      colorsData.push(rect.color[1])
      colorsData.push(rect.color[2])
      colorsData.push(rect.color[3])
    }

    this.vertexArray.updateBuffer("bounds", boundsData.data)
    this.vertexArray.updateBuffer("color", colorsData.data)

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
      in vec4 bounds;  // x, y, width, height
      in vec4 color;

      out vec4 vBounds;
      out vec2 vPosition;
      out vec4 vColor;

      void main() {
        vec4 transformedPosition = vec4((position.xy * bounds.zw + bounds.xy), position.zw);
        gl_Position = projectionMatrix * transformedPosition;
        vBounds = bounds;
        vPosition = transformedPosition.xy;
        vColor = color;
      }
    `,
    `#version 300 es
      precision lowp float;

      uniform vec4 strokeColor;

      in vec4 vBounds;
      in vec2 vPosition;
      in vec4 vColor;

      out vec4 outColor;

      void main() {
        float border = 1.0;
        float localX = vPosition.x - vBounds.x;
        float localY = vPosition.y - vBounds.y;

        if ((localX < border) || (localX >= (vBounds.z - border)) || (localY < border) || (localY > (vBounds.w - border))) {
          // draw outline
          outColor = strokeColor;
        } else {
          outColor = vColor;
        }
      }
    `,
    {
      position: { size: 2, type: gl.FLOAT },
      bounds: { size: 4, type: gl.FLOAT, divisor: 1 },
      color: { size: 4, type: gl.FLOAT, divisor: 1 },
    },
    {
      projectionMatrix: { type: "mat4" },
      strokeColor: { type: "vec4" },
    },
  )
