import { mat4 } from "gl-matrix"
import { Drawable } from "./Drawable"

interface Transformable {
  projectionMatrix: mat4
}

export interface ShaderBuffer<P> {
  update(params: P): void
}

export interface Shader<P, B> {
  setUniforms(params: P): void
  draw(buffer: B): void
}

export class RenderObject<
  Props,
  Buf extends ShaderBuffer<any>,
  S extends Shader<Props & Transformable, Buf>
> implements Drawable
{
  private readonly shader: S
  private props: Props
  readonly buffer: Buf

  constructor(shader: S, buffer: Buf, props: Props) {
    this.shader = shader
    this.props = props
    this.buffer = buffer
  }

  setProps(props: Props) {
    this.props = props
  }

  render(projectionMatrix: mat4): void {
    this.shader.setUniforms({ ...this.props, projectionMatrix })
    this.shader.draw(this.buffer)
  }
}
