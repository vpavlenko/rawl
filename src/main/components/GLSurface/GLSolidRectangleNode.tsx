import { IRect } from "../../../common/geometry"
import {
  SolidRectangleBuffer,
  SolidRectangleShader,
} from "../../gl/shaders/SolidRectangleShader"
import { GLNode } from "./GLSurface"

export type GLSolidRectangleNodeProps = IRect[]

export class GLSolidRectangleNode extends GLNode<GLSolidRectangleNodeProps> {
  constructor(props: { buffer: GLSolidRectangleNodeProps }) {
    super(props)
  }

  initialize(gl: WebGLRenderingContext): void {
    this.shader = SolidRectangleShader(gl)
    this.buffer = new SolidRectangleBuffer(gl)
  }
}
