import { Shader } from "@ryohey/webgl-react"

export const DrumNoteShader = (gl: WebGL2RenderingContext) =>
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
        gl_Position = projectionMatrix * position;
        vBounds = bounds;
        vPosition = position.xy;
        vColor = color;
      }
    `,
    `#version 300 es
      precision lowp float;

      uniform vec4 uFillColor;
      uniform vec4 strokeColor;

      in vec4 vBounds;
      in vec2 vPosition;
      in vec4 vColor;

      out vec4 outColor;

      void main() {
        float border = 1.0;
        
        float r = vBounds.w / 2.0;
        vec2 center = vBounds.xy + vBounds.zw / 2.0;
        float len = length(vPosition - center);

        if (len < r - border) {
          outColor = vColor;
        } else if (len < r) {
          outColor = strokeColor;
        }
      }
    `,
    {
      position: { size: 2, type: gl.FLOAT },
      bounds: { size: 4, type: gl.FLOAT },
      color: { size: 4, type: gl.FLOAT },
    },
    {
      projectionMatrix: { type: "mat4" },
      strokeColor: { type: "vec4" },
    },
  )
