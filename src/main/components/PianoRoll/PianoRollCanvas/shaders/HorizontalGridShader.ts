import {
  Buffer,
  rectToTriangles,
  Shader,
  VertexArray,
} from "@ryohey/webgl-react"
import { IRect } from "../../../../../common/geometry"

export class HorizontalGridBuffer implements Buffer<IRect, "position"> {
  constructor(readonly vertexArray: VertexArray<"position">) {}

  update(rect: IRect) {
    const positions = rectToTriangles(rect)
    this.vertexArray.updateBuffer("position", new Float32Array(positions))
  }

  get vertexCount() {
    return 6
  }
}

export const HorizontalGridShader = (gl: WebGL2RenderingContext) =>
  new Shader(
    gl,
    `#version 300 es
      precision lowp float;

      uniform mat4 projectionMatrix;
      in vec4 position;
      out vec4 vPosition;

      void main() {
        gl_Position = projectionMatrix * position;
        vPosition = position;
      }
    `,
    `#version 300 es
      precision lowp float;

      uniform vec4 color;
      uniform vec4 highlightedColor;
      uniform vec4 blackLaneColor;
      uniform float height;
      
      in vec4 vPosition;

      out vec4 outColor;

      float step2(float x) {
        return step(0.0, x) * step(x, 1.0);
      }
      
      void main() {
        const float eps = 0.1;
        float y = vPosition.y;
        float border = 1.0;
        float index = 128.0 - y / height;
        float key = mod(index, 12.0);

        // draw border
        if (abs(key) < eps || abs(key - 5.0) < eps) {
          vec4 color = mix(highlightedColor, color, step(0.1, key));
          outColor = step(fract(index) * height, border) * color;
        }

        // draw black lane
        outColor += (
          step2(key - 1.0) + 
          step2(key - 3.0) + 
          step2(key - 6.0) + 
          step2(key - 8.0) + 
          step2(key - 10.0)
        ) * blackLaneColor;
      }
    `,
    {
      position: { size: 2, type: gl.FLOAT },
    },
    {
      projectionMatrix: { type: "mat4" },
      color: { type: "vec4" },
      highlightedColor: { type: "vec4" },
      blackLaneColor: { type: "vec4" },
      height: { type: "float" },
    },
  )
