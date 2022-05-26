import { mat4, vec4 } from "gl-matrix"
import { IRect } from "../../../common/geometry"
import {
  SolidRectangleBuffer,
  SolidRectangleShader,
} from "../../gl/shaders/SolidRectangleShader"
import { GLNode } from "./GLSurface"

export interface GLSolidRectangleNodeProps {
  buffer: IRect[]
  uniforms: { projectionMatrix: mat4; color: vec4 }
}

export class GLSolidRectangleNode extends GLNode<GLSolidRectangleNodeProps> {
  constructor(props: GLSolidRectangleNodeProps) {
    super(props)
  }

  initialize(gl: WebGLRenderingContext): void {
    this.shader = SolidRectangleShader(gl)
    this.buffer = new SolidRectangleBuffer(gl)
  }
}
