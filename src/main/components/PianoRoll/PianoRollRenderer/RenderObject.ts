interface Buffer<T> {
  update(gl: WebGLRenderingContext, params: T): void
}

interface Shader<B> {
  draw(gl: WebGLRenderingContext, buffer: B): void
}

export class RenderObject<T, B extends Buffer<T>, S extends Shader<B>> {
  protected shader: S
  protected buffer: B

  constructor(shader: S, buffer: B) {
    this.shader = shader
    this.buffer = buffer
  }

  update(gl: WebGLRenderingContext, params: T) {
    this.buffer.update(gl, params)
  }

  draw(gl: WebGLRenderingContext) {
    this.shader.draw(gl, this.buffer)
  }
}
