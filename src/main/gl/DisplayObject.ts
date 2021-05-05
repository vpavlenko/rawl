export interface Shader<P, B> {
  setUniforms(params: P): void
  draw(buffer: B): void
}

export interface ShaderBuffer<P> {
  update(params: P): void
}

export class DisplayObject<
  S extends Shader<any, B>,
  B extends ShaderBuffer<any>
> {
  private shader: S
  private buffer: B

  constructor(shader: S, buffer: B) {
    this.shader = shader
    this.buffer = buffer
  }

  updateBuffer(param: Parameters<B["update"]>[0]) {
    this.buffer.update(param)
  }

  updateUniforms(uniforms: Parameters<S["setUniforms"]>[0]) {
    this.shader.setUniforms(uniforms)
  }

  draw() {
    this.shader.draw(this.buffer)
  }
}
